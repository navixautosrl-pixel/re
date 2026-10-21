using System.Collections.Concurrent;
using RobixHost.Core;
using RobixHost.Data;

namespace RobixHost.Jobs;

public interface IJobHandler
{
    string Type { get; }

    /// <summary>
    /// Jobs that return the same non-null key never run concurrently and run in the order they were claimed (submission order).
    /// Without this, a late "suspend" could land after a newer "unsuspend" and leave the VM in the opposite of the last request.
    /// </summary>
    string? ConcurrencyKey(JobRecord job) => null;

    Task ExecuteAsync(JobContext ctx, CancellationToken ct);
}

public sealed class JobContext(JobRecord job, JobStore store)
{
    public JobRecord Job { get; } = job;
    public void Step(int progress, string step) { store.SetProgress(Job.Id, progress, step); store.Log(Job.Id, "info", step); }
    public void Info(string m) => store.Log(Job.Id, "info", m);
    public void Warn(string m) => store.Log(Job.Id, "warn", m);
}

/// <summary>
/// Persistent job executor. State lives in the database, not in memory: a crash returns Running jobs to Queued
/// (handlers are required to be idempotent). A job is marked Succeeded only after its handler returns without throwing,
/// and handlers only return after the virtualization layer has confirmed the result.
/// </summary>
public sealed class JobRunner(JobStore store, IEnumerable<IJobHandler> handlers, AuditStore audit, Action<string>? log = null) : IDisposable
{
    private readonly Dictionary<string, IJobHandler> _handlers = handlers.ToDictionary(h => h.Type);
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _running = new();
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _keyGates = new();
    private readonly SemaphoreSlim _wake = new(0);
    private CancellationTokenSource? _loopCts;
    private Task? _loop;

    /// <summary>Jobs waiting for their resource key still occupy a slot, so keep this above the number of jobs that can pile up on one VM.</summary>
    public int MaxParallel { get; init; } = 4;

    public void Start()
    {
        var recovered = store.RecoverInterrupted();
        if (recovered > 0) log?.Invoke($"recovered {recovered} interrupted job(s)");
        _loopCts = new CancellationTokenSource();
        _loop = Task.Run(() => LoopAsync(_loopCts.Token));
    }

    public void Notify() => _wake.Release();

    public (JobRecord Job, bool Created) Submit(string type, string requestedBy, string? payloadJson, string? idempotencyKey)
    {
        if (!_handlers.ContainsKey(type)) throw new RobixException("job.unknown_type", $"No handler registered for job type '{type}'.");
        var res = store.Enqueue(type, requestedBy, payloadJson, idempotencyKey);
        if (res.Created) { audit.Write(requestedBy, "job.submit", res.Job.Id, type); Notify(); }
        return res;
    }

    public bool Cancel(string id, string actor)
    {
        if (_running.TryGetValue(id, out var cts)) { cts.Cancel(); audit.Write(actor, "job.cancel", id); return true; }
        var j = store.Get(id);
        if (j?.State == JobState.Queued) { store.MarkCancelled(id); audit.Write(actor, "job.cancel", id); return true; }
        return false;
    }

    private async Task LoopAsync(CancellationToken stop)
    {
        var active = new List<Task>();
        while (!stop.IsCancellationRequested)
        {
            active.RemoveAll(t => t.IsCompleted);
            while (active.Count < MaxParallel && store.ClaimNext() is { } job)
            {
                // The waiter is enqueued HERE, synchronously, so per-resource order equals claim order (not thread-pool order).
                SemaphoreSlim? gate = null; Task? turn = null;
                if (KeyOf(job) is { } key) { gate = _keyGates.GetOrAdd(key, _ => new SemaphoreSlim(1, 1)); turn = gate.WaitAsync(stop); }
                active.Add(Task.Run(() => RunOneAsync(job, stop, gate, turn), CancellationToken.None));
            }
            try { await _wake.WaitAsync(TimeSpan.FromSeconds(1), stop); } catch (OperationCanceledException) { break; }
        }
        await Task.WhenAll(active);
    }

    private string? KeyOf(JobRecord job)
    {
        try { return _handlers.TryGetValue(job.Type, out var h) ? h.ConcurrencyKey(job) : null; }
        catch (Exception) { return null; }   // an unparsable payload fails properly inside the handler, not here
    }

    private async Task RunOneAsync(JobRecord job, CancellationToken stop, SemaphoreSlim? gate, Task? turn)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(stop);
        _running[job.Id] = cts;
        var holdsGate = false;
        try
        {
            if (turn is not null) { await turn; holdsGate = true; }
            cts.Token.ThrowIfCancellationRequested();            // cancelled while waiting for its turn
            var ctx = new JobContext(job, store);
            await _handlers[job.Type].ExecuteAsync(ctx, cts.Token);
            store.Complete(job.Id);
            audit.Write("system", "job.succeeded", job.Id, job.Type);
        }
        catch (OperationCanceledException)
        {
            store.MarkCancelled(job.Id);
            store.Log(job.Id, "warn", "cancelled");
        }
        catch (Exception ex)
        {
            var code = ex is RobixException rx ? rx.Code : "job.unhandled";
            store.Log(job.Id, "error", $"{code}: {ex.Message}");
            var transient = ex is not RobixException { Code: var c } || !c.StartsWith("validation.", StringComparison.Ordinal);
            if (transient && job.Attempts < job.MaxAttempts) { store.Requeue(job.Id, code, ex.Message); Notify(); }
            else { store.Fail(job.Id, code, ex.Message); audit.Write("system", "job.failed", job.Id, $"{job.Type}: {code}"); }
        }
        finally
        {
            if (holdsGate) gate!.Release();
            else if (turn is not null) _ = turn.ContinueWith(t => { if (t.Status == TaskStatus.RanToCompletion) gate!.Release(); }, TaskScheduler.Default);   // never leak the gate if we bailed out before our turn
            _running.TryRemove(job.Id, out _);
        }
    }

    public void Dispose()
    {
        _loopCts?.Cancel();
        try { _loop?.Wait(TimeSpan.FromSeconds(10)); } catch { }
        _loopCts?.Dispose();
    }
}
