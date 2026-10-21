namespace RobixHost.Client;

public enum ConnectionState { Unknown, Connected, Reconnecting }

/// <summary>
/// Watches the server's /health endpoint and reports state changes, so the UI can show "Reconnecting…" and recover by
/// itself after a network interruption. It never raises on every poll, only when the state actually changes.
/// </summary>
public sealed class ConnectionMonitor(IRobixApi api, TimeSpan? interval = null) : IDisposable
{
    private readonly TimeSpan _interval = interval ?? TimeSpan.FromSeconds(5);
    private CancellationTokenSource? _cts;
    private Task? _loop;

    public ConnectionState State { get; private set; } = ConnectionState.Unknown;
    public int ConsecutiveFailures { get; private set; }
    public event Action<ConnectionState>? StateChanged;

    /// <summary>One probe. Public so it can be driven deterministically in tests.</summary>
    public async Task CheckOnceAsync(CancellationToken ct = default)
    {
        var healthy = await api.IsHealthyAsync(ct);
        ConsecutiveFailures = healthy ? 0 : ConsecutiveFailures + 1;
        var next = healthy ? ConnectionState.Connected : ConnectionState.Reconnecting;
        if (next == State) return;
        State = next;
        StateChanged?.Invoke(next);
    }

    public void Start()
    {
        if (_loop is not null) return;
        _cts = new CancellationTokenSource();
        var token = _cts.Token;
        _loop = Task.Run(async () =>
        {
            while (!token.IsCancellationRequested)
            {
                try { await CheckOnceAsync(token); await Task.Delay(_interval, token); }
                catch (OperationCanceledException) { break; }
                catch (Exception) { /* a probe must never kill the monitor */ }
            }
        }, token);
    }

    public void Dispose() { _cts?.Cancel(); _cts?.Dispose(); }
}
