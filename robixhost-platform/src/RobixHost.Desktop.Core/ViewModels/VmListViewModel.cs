using System.Collections.ObjectModel;
using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

public sealed class VmRowViewModel : ObservableObject
{
    private VmInfo _info;
    private bool _busy;

    public VmRowViewModel(VmInfo info, VmListViewModel owner)
    {
        _info = info;
        StartCommand = Make(() => owner.PowerAsync(this, VmPowerAction.Start), () => State == VmPowerState.Stopped);
        ResumeCommand = Make(() => owner.PowerAsync(this, VmPowerAction.Resume), () => State == VmPowerState.Paused);
        PauseCommand = Make(() => owner.PowerAsync(this, VmPowerAction.Pause), () => State == VmPowerState.Running);
        ShutdownCommand = Make(() => owner.PowerAsync(this, VmPowerAction.Shutdown), () => State == VmPowerState.Running);
        StopCommand = Make(() => owner.PowerAsync(this, VmPowerAction.Stop), () => State is VmPowerState.Running or VmPowerState.Paused);
        TerminateCommand = Make(() => owner.TerminateAsync(this), () => State != VmPowerState.Error);
        AsyncCommand Make(Func<Task> run, Func<bool> can) => new(run, () => !IsBusy && can(), owner.ReportError);
    }

    public VmInfo Info
    {
        get => _info;
        set { _info = value; OnPropertyChanged(); OnPropertyChanged(nameof(State)); RaiseAll(); }
    }

    public string Name => _info.Name;
    public VmPowerState State => _info.State;
    public int VCpus => _info.VCpus;
    public int MemoryMb => _info.MemoryMb;
    public bool IsBusy { get => _busy; set { if (SetProperty(ref _busy, value)) RaiseAll(); } }

    public AsyncCommand StartCommand { get; }
    public AsyncCommand ResumeCommand { get; }
    public AsyncCommand PauseCommand { get; }
    public AsyncCommand ShutdownCommand { get; }
    public AsyncCommand StopCommand { get; }
    public AsyncCommand TerminateCommand { get; }

    private void RaiseAll()
    {
        foreach (var c in new[] { StartCommand, ResumeCommand, PauseCommand, ShutdownCommand, StopCommand, TerminateCommand }) c.RaiseCanExecuteChanged();
    }
}

public enum VmSortColumn { Name, State, VCpus, Memory }

public sealed class VmListViewModel : ObservableObject
{
    private readonly IRobixApi _api;
    private readonly Localizer _loc;
    private readonly IDialogService _dialogs;
    private List<VmInfo> _all = [];
    private string _search = "";
    private VmSortColumn _sort = VmSortColumn.Name;
    private bool _descending;
    private int _pageIndex;
    private bool _loaded, _loading;

    public VmListViewModel(IRobixApi api, Localizer loc, IDialogService dialogs, int pageSize = 25)
    {
        (_api, _loc, _dialogs, PageSize) = (api, loc, dialogs, pageSize);
        RefreshCommand = new AsyncCommand(RefreshAsync, onError: ReportError);
        NextPageCommand = new AsyncCommand(() => { PageIndex++; return Task.CompletedTask; }, () => PageIndex < PageCount - 1);
        PreviousPageCommand = new AsyncCommand(() => { PageIndex--; return Task.CompletedTask; }, () => PageIndex > 0);
    }

    public int PageSize { get; }
    public ObservableCollection<VmRowViewModel> Items { get; } = new();
    public ObservableCollection<RetainedVm> Retained { get; } = new();
    public AsyncCommand RefreshCommand { get; }
    public AsyncCommand NextPageCommand { get; }
    public AsyncCommand PreviousPageCommand { get; }

    public bool IsLoading { get => _loading; private set => SetProperty(ref _loading, value); }
    /// <summary>True once the first load completed; lets the view tell "loading" from "genuinely empty".</summary>
    public bool IsEmpty => _loaded && _all.Count == 0;
    public int Total => _all.Count;
    public int FilteredTotal => Filtered().Count();
    public int PageCount => Math.Max(1, (int)Math.Ceiling(FilteredTotal / (double)PageSize));

    public string Search { get => _search; set { if (SetProperty(ref _search, value)) { _pageIndex = 0; Rebuild(); } } }
    public VmSortColumn SortColumn => _sort;
    public bool SortDescending => _descending;
    public int PageIndex
    {
        get => _pageIndex;
        set { var v = Math.Clamp(value, 0, PageCount - 1); if (SetProperty(ref _pageIndex, v)) Rebuild(); }
    }

    public void SortBy(VmSortColumn column)
    {
        if (_sort == column) _descending = !_descending; else { _sort = column; _descending = false; }
        OnPropertyChanged(nameof(SortColumn)); OnPropertyChanged(nameof(SortDescending));
        Rebuild();
    }

    public async Task RefreshAsync(CancellationToken ct = default)
    {
        IsLoading = true;
        try
        {
            var page = await _api.ListVmsAsync(200, 0, ct);    // 200 is the server's page cap; a single node never approaches it
            var retained = await _api.ListRetainedAsync(ct);
            _all = [.. page.Items]; _loaded = true;
            Retained.Clear(); foreach (var r in retained) Retained.Add(r);
            Rebuild();
        }
        finally { IsLoading = false; }
    }

    private IEnumerable<VmInfo> Filtered()
    {
        var q = _search.Trim();
        var src = q.Length == 0 ? _all : _all.Where(v => v.Name.Contains(q, StringComparison.OrdinalIgnoreCase) || v.State.ToString().Contains(q, StringComparison.OrdinalIgnoreCase));
        Func<VmInfo, IComparable> key = _sort switch
        {
            VmSortColumn.State => v => v.State, VmSortColumn.VCpus => v => v.VCpus, VmSortColumn.Memory => v => v.MemoryMb, _ => v => v.Name,
        };
        return _descending ? src.OrderByDescending(key).ThenBy(v => v.Name) : src.OrderBy(key).ThenBy(v => v.Name);
    }

    private void Rebuild()
    {
        if (_pageIndex >= PageCount) _pageIndex = PageCount - 1;
        var rows = Filtered().Skip(_pageIndex * PageSize).Take(PageSize).ToList();
        Items.Clear();
        foreach (var info in rows) Items.Add(new VmRowViewModel(info, this));
        foreach (var n in new[] { nameof(Total), nameof(FilteredTotal), nameof(PageCount), nameof(PageIndex), nameof(IsEmpty) }) OnPropertyChanged(n);
        NextPageCommand.RaiseCanExecuteChanged(); PreviousPageCommand.RaiseCanExecuteChanged();
    }

    // ------------------------------- actions -------------------------------
    public async Task PowerAsync(VmRowViewModel row, VmPowerAction action)
    {
        if (action == VmPowerAction.Stop &&
            !await _dialogs.ConfirmAsync(_loc["confirm.stop.title"], _loc.Format("confirm.stop.body", row.Name), _loc["act.stop"], destructive: true))
            return;                                                      // declined: nothing is sent to the server

        row.IsBusy = true;
        try
        {
            var updated = await _api.PowerAsync(row.Name, action, CancellationToken.None);    // returns after the hypervisor confirmed the state
            row.Info = updated;
            var i = _all.FindIndex(v => v.Name == updated.Name); if (i >= 0) _all[i] = updated;
            _dialogs.Toast(ToastKind.Success, _loc.Format("toast.done", _loc["act." + action.ToString().ToLowerInvariant()] + " " + row.Name));
        }
        finally { row.IsBusy = false; }
    }

    /// <summary>
    /// Terminate retains the disk. A running VM is customer-facing, so it needs the stronger type-the-name confirmation.
    /// </summary>
    public async Task TerminateAsync(VmRowViewModel row)
    {
        var ok = row.State == VmPowerState.Running
            ? await _dialogs.ConfirmByTypingAsync(_loc["confirm.terminate.title"], _loc.Format("confirm.terminate.body", row.Name), row.Name)
            : await _dialogs.ConfirmAsync(_loc["confirm.terminate.title"], _loc.Format("confirm.terminate.body", row.Name), _loc["act.terminate"], destructive: true);
        if (!ok) return;

        row.IsBusy = true;
        try
        {
            var job = await _api.TerminateAsync(row.Name);
            _dialogs.Toast(ToastKind.Info, _loc.Format("toast.done", _loc["act.terminate"] + " " + row.Name + " (" + job.JobId[..Math.Min(8, job.JobId.Length)] + ")"));
        }
        finally { row.IsBusy = false; }
    }

    /// <summary>Irreversible: only after the administrator types the exact VM name.</summary>
    public async Task PurgeAsync(RetainedVm retained)
    {
        if (!await _dialogs.ConfirmByTypingAsync(_loc["confirm.purge.title"], _loc.Format("confirm.purge.body", retained.Name), retained.Name)) return;
        try
        {
            await _api.PurgeAsync(retained.Name, retained.Name);
            Retained.Remove(retained);
            _dialogs.Toast(ToastKind.Success, _loc.Format("toast.done", _loc["act.purge"] + " " + retained.Name));
        }
        catch (Exception ex) { ReportError(ex); }
    }

    public void ReportError(Exception ex)
        => _dialogs.Toast(ToastKind.Error, _loc.Format("toast.failed", ex is ApiException a ? a.Detailed : ex.Message));
}
