using System.Collections.ObjectModel;
using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

/// <summary>
/// Everything shown here is either measured by the server right now or counted from real data. A value the server could
/// not measure is shown as "n/a", never as an invented number. "Allocated" (promised to guests) and "Measured" (really
/// used) are kept visibly separate. Chart history only covers the time this window has been open, and says so.
/// </summary>
public sealed class DashboardViewModel : ObservableObject, IDisposable
{
    public const int HistoryLength = 60;
    private readonly IRobixApi _api;
    private readonly Localizer _loc;
    private CancellationTokenSource? _auto;
    private HostSampleDto? _previous;
    private HostInfo? _host;
    private string? _error;
    private double? _netRxRate, _netTxRate;
    private int _running, _stopped, _paused;
    private IReadOnlyList<JobRecord> _recent = [], _failed = [];

    public DashboardViewModel(IRobixApi api, Localizer loc)
    {
        _api = api; _loc = loc;
        RefreshCommand = new AsyncCommand(RefreshAsync, onError: ex => Error = ex is ApiException a ? a.Detailed : ex.Message);
    }

    public AsyncCommand RefreshCommand { get; }
    public ObservableCollection<double> CpuHistory { get; } = new();
    public ObservableCollection<double> MemoryHistory { get; } = new();

    public HostInfo? Host { get => _host; private set => SetProperty(ref _host, value); }
    public string? Error { get => _error; private set => SetProperty(ref _error, value); }

    // ---- measured ----
    public string CpuText => Format.Percent(Host?.Measured.CpuPercent);
    public string MemoryText => Host is { } h ? $"{Format.Bytes(h.Measured.MemUsedBytes)} / {Format.Bytes(h.Measured.MemTotalBytes)}" : Format.NotAvailable;
    public string StorageText => Host is { } h ? $"{Format.Bytes(h.Measured.DiskUsedBytes)} / {Format.Bytes(h.Measured.DiskTotalBytes)}" : Format.NotAvailable;
    public string UptimeText => Host is { } h ? Format.Uptime(h.Measured.UptimeSeconds) : Format.NotAvailable;
    public string NetworkInText => Format.Rate(_netRxRate);
    public string NetworkOutText => Format.Rate(_netTxRate);

    // ---- allocated (promised) ----
    public string AllocatedCpuText => Host is { } h ? $"{h.Allocated.AllocatedVcpus:0.#} vCPU / {h.Allocated.PhysicalCpus} CPU  ({Format.Ratio(h.Allocated.CpuOvercommit)})" : Format.NotAvailable;
    public string AllocatedMemoryText => Host is { } h ? $"{Format.Bytes(h.Allocated.AllocatedMemBytes)} / {Format.Bytes(h.Allocated.PhysicalMemBytes)}  ({Format.Ratio(h.Allocated.MemOvercommit)})" : Format.NotAvailable;

    // ---- VM counts ----
    public int RunningCount { get => _running; private set => SetProperty(ref _running, value); }
    public int StoppedCount { get => _stopped; private set => SetProperty(ref _stopped, value); }
    public int PausedCount { get => _paused; private set => SetProperty(ref _paused, value); }

    // ---- health: derived only from what the host reported ----
    public bool AccelerationUsable => Host?.Capabilities.HardwareAccelerationUsable ?? false;
    public IReadOnlyList<string> HealthMessages => Host is null ? [] : [.. Host.Capabilities.Errors, .. Host.Capabilities.Warnings];
    public string HealthSummary => Host is null ? Format.NotAvailable : AccelerationUsable ? _loc["dash.healthy"] : _loc["dash.noAccel"];

    public IReadOnlyList<JobRecord> RecentJobs { get => _recent; private set => SetProperty(ref _recent, value); }
    public IReadOnlyList<JobRecord> FailedJobs { get => _failed; private set => SetProperty(ref _failed, value); }

    public async Task RefreshAsync(CancellationToken ct = default)
    {
        Error = null;
        var host = await _api.GetHostAsync(ct);
        var vms = await _api.ListVmsAsync(200, 0, ct);
        var jobs = await _api.ListJobsAsync(null, 20, 0, ct);

        // A rate needs two samples; the first refresh honestly has none.
        if (_previous is { } p && host.Measured.At > p.At)
        {
            var dt = (host.Measured.At - p.At).TotalSeconds;
            _netRxRate = host.Measured.NetRxBytes >= p.NetRxBytes ? (host.Measured.NetRxBytes - p.NetRxBytes) / dt : null;
            _netTxRate = host.Measured.NetTxBytes >= p.NetTxBytes ? (host.Measured.NetTxBytes - p.NetTxBytes) / dt : null;
        }
        _previous = host.Measured;

        if (host.Measured.CpuPercent is { } cpu) Push(CpuHistory, cpu);
        if (host.Measured.MemTotalBytes > 0) Push(MemoryHistory, 100.0 * host.Measured.MemUsedBytes / host.Measured.MemTotalBytes);

        RunningCount = vms.Items.Count(v => v.State == VmPowerState.Running);
        PausedCount = vms.Items.Count(v => v.State == VmPowerState.Paused);
        StoppedCount = vms.Items.Count(v => v.State == VmPowerState.Stopped);
        RecentJobs = jobs.Take(10).ToList();
        FailedJobs = jobs.Where(j => j.State == JobState.Failed).ToList();
        Host = host;
        foreach (var n in new[] { nameof(CpuText), nameof(MemoryText), nameof(StorageText), nameof(UptimeText), nameof(NetworkInText), nameof(NetworkOutText),
                                  nameof(AllocatedCpuText), nameof(AllocatedMemoryText), nameof(AccelerationUsable), nameof(HealthMessages), nameof(HealthSummary) })
            OnPropertyChanged(n);
    }

    /// <summary>Refreshes periodically until disposed. Failures are shown in <see cref="Error"/>, never thrown.</summary>
    public void StartAutoRefresh(TimeSpan interval)
    {
        _auto?.Cancel();
        _auto = new CancellationTokenSource();
        var token = _auto.Token;
        _ = Task.Run(async () =>
        {
            while (!token.IsCancellationRequested)
            {
                await RefreshCommand.ExecuteAsync();
                try { await Task.Delay(interval, token); } catch (OperationCanceledException) { break; }
            }
        }, token);
    }

    private static void Push(ObservableCollection<double> series, double v)
    {
        series.Add(v);
        while (series.Count > HistoryLength) series.RemoveAt(0);
    }

    public void Dispose() { _auto?.Cancel(); _auto?.Dispose(); }
}
