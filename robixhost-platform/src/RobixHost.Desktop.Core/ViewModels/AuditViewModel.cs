using System.Collections.ObjectModel;
using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

public sealed class AuditViewModel : ObservableObject
{
    private readonly IRobixApi _api;
    private string _actor = "";
    private string? _error;

    public AuditViewModel(IRobixApi api, Localizer loc)
    {
        _api = api;
        _ = loc;
        RefreshCommand = new AsyncCommand(RefreshAsync, onError: ex => Error = ex is ApiException a ? a.Detailed : ex.Message);
    }

    public ObservableCollection<AuditEvent> Events { get; } = new();
    public AsyncCommand RefreshCommand { get; }
    public string Actor { get => _actor; set => SetProperty(ref _actor, value); }
    public string? Error { get => _error; private set => SetProperty(ref _error, value); }

    public async Task RefreshAsync(CancellationToken ct = default)
    {
        Error = null;
        var items = await _api.ListAuditAsync(200, 0, string.IsNullOrWhiteSpace(Actor) ? null : Actor.Trim(), ct);
        Events.Clear(); foreach (var e in items) Events.Add(e);
    }
}
