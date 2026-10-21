using System.Collections.ObjectModel;
using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

public enum WizardStep { Details, Network, Review, Deploy }

/// <summary>
/// Creation wizard. Validates against the host's REAL capabilities, requires an explicit confirmation before anything is
/// sent, then follows the server-side job and reports the real outcome (including the step that failed).
/// Not yet covered: template / ISO selection and the access-and-security step. They need server endpoints that do not exist yet.
/// </summary>
public sealed class CreateVpsViewModel : ObservableObject
{
    private readonly IRobixApi _api;
    private readonly Localizer _loc;
    private readonly IDialogService _dialogs;
    private readonly Func<TimeSpan, CancellationToken, Task> _delay;
    private HostCapabilities? _caps;
    private string _name = "";
    private GuestOs _os = GuestOs.Linux;
    private int _vcpus = 1, _memoryMb = 1024, _diskGb = 20;
    private IpPool? _pool;
    private WizardStep _step = WizardStep.Details;
    private bool _confirmed, _completed;
    private string _runKey = Guid.NewGuid().ToString("N");
    private string? _jobId, _currentStepText, _failureCode, _failureDetail;
    private int _progress;
    private JobState? _jobState;

    public CreateVpsViewModel(IRobixApi api, Localizer loc, IDialogService dialogs, Func<TimeSpan, CancellationToken, Task>? delay = null)
    {
        (_api, _loc, _dialogs) = (api, loc, dialogs);
        _delay = delay ?? ((t, ct) => Task.Delay(t, ct));
        LoadCommand = new AsyncCommand(LoadAsync, onError: ReportError);
        NextCommand = new AsyncCommand(() => { Next(); return Task.CompletedTask; }, () => Step is WizardStep.Details or WizardStep.Network);
        BackCommand = new AsyncCommand(() => { Back(); return Task.CompletedTask; }, () => Step is WizardStep.Network or WizardStep.Review || (Step == WizardStep.Deploy && JobState is Core.JobState.Succeeded or Core.JobState.Failed or Core.JobState.Cancelled));
        DeployCommand = new AsyncCommand(DeployAsync, () => Step == WizardStep.Review && IsConfirmed, ReportError);
        RetryCommand = new AsyncCommand(RetryAsync, () => JobState == Core.JobState.Failed, ReportError);
    }

    public ObservableCollection<IpPool> Pools { get; } = new();
    public ObservableCollection<string> Errors { get; } = new();
    public ObservableCollection<string> LogLines { get; } = new();
    public AsyncCommand LoadCommand { get; }
    public AsyncCommand NextCommand { get; }
    public AsyncCommand BackCommand { get; }
    public AsyncCommand DeployCommand { get; }
    public AsyncCommand RetryCommand { get; }

    public string Name { get => _name; set => SetProperty(ref _name, value.Trim().ToLowerInvariant()); }
    public GuestOs Os { get => _os; set { if (SetProperty(ref _os, value)) OnPropertyChanged(nameof(ShowWindowsLicenceNotice)); } }
    public int VCpus { get => _vcpus; set => SetProperty(ref _vcpus, value); }
    public int MemoryMb { get => _memoryMb; set => SetProperty(ref _memoryMb, value); }
    public int DiskGb { get => _diskGb; set => SetProperty(ref _diskGb, value); }
    public IpPool? SelectedPool { get => _pool; set => SetProperty(ref _pool, value); }
    public bool ShowWindowsLicenceNotice => Os == GuestOs.Windows;

    public WizardStep Step
    {
        get => _step;
        private set { if (SetProperty(ref _step, value)) RaiseCommands(); }
    }

    /// <summary>Must be set by the user on the Review step before deployment is possible.</summary>
    public bool IsConfirmed { get => _confirmed; set { if (SetProperty(ref _confirmed, value)) RaiseCommands(); } }

    public JobState? JobState { get => _jobState; private set { if (SetProperty(ref _jobState, value)) RaiseCommands(); } }
    public int Progress { get => _progress; private set => SetProperty(ref _progress, value); }
    public string? CurrentStepText { get => _currentStepText; private set => SetProperty(ref _currentStepText, value); }
    public string? FailureCode { get => _failureCode; private set => SetProperty(ref _failureCode, value); }
    public string? FailureDetail { get => _failureDetail; private set => SetProperty(ref _failureDetail, value); }
    public bool Completed { get => _completed; private set => SetProperty(ref _completed, value); }

    public VmSpec BuildSpec() => new() { Name = Name, Os = Os, VCpus = VCpus, MemoryMb = MemoryMb, DiskGb = DiskGb };

    public async Task LoadAsync(CancellationToken ct = default)
    {
        var host = await _api.GetHostAsync(ct);
        _caps = host.Capabilities;
        var pools = await _api.ListIpPoolsAsync(ct);
        Pools.Clear(); foreach (var p in pools) Pools.Add(p);
    }

    /// <summary>Validates against the host's real capabilities; returns false and fills <see cref="Errors"/> when invalid.</summary>
    public bool Validate()
    {
        Errors.Clear();
        foreach (var e in VmSpecValidator.Validate(BuildSpec(), _caps)) Errors.Add(e);
        return Errors.Count == 0;
    }

    private void Next()
    {
        if (Step == WizardStep.Details) { if (Validate()) Step = WizardStep.Network; }
        else if (Step == WizardStep.Network) { if (Validate()) { IsConfirmed = false; Step = WizardStep.Review; } }
    }

    private void Back()
    {
        // Editing a reviewed configuration invalidates the confirmation and the idempotency key: a changed VPS is a new request.
        IsConfirmed = false; _runKey = Guid.NewGuid().ToString("N");
        if (Step == WizardStep.Deploy) { _jobId = null; Completed = false; ResetOutcome(); Step = WizardStep.Review; }   // only reachable once the job reached a final state
        else Step = Step == WizardStep.Review ? WizardStep.Network : WizardStep.Details;
    }

    private async Task DeployAsync(CancellationToken ct)
    {
        if (!Validate()) return;                                  // never send a request the client already knows is invalid
        Step = WizardStep.Deploy; Completed = false; ResetOutcome();
        var submit = await _api.ProvisionAsync(new ProvisionRequest(BuildSpec(), SelectedPool?.Id, null), _runKey, ct);
        _jobId = submit.JobId;
        _dialogs.Toast(ToastKind.Info, _loc.Format("toast.deploying", Name));
        await FollowJobAsync(ct);
    }

    private async Task RetryAsync(CancellationToken ct)
    {
        if (_jobId is null) return;
        ResetOutcome();
        await _api.RetryJobAsync(_jobId, ct);
        await FollowJobAsync(ct);
    }

    private async Task FollowJobAsync(CancellationToken ct)
    {
        while (true)
        {
            var d = await _api.GetJobAsync(_jobId!, ct);
            JobState = d.Job.State; Progress = d.Job.Progress; CurrentStepText = d.Job.CurrentStep;
            LogLines.Clear(); foreach (var l in d.Logs) LogLines.Add($"{l.At.ToLocalTime():HH:mm:ss} {l.Level}: {l.Message}");

            if (d.Job.State == Core.JobState.Succeeded)
            {
                Completed = true; _dialogs.Toast(ToastKind.Success, _loc.Format("toast.deployed", Name)); return;
            }
            if (d.Job.State is Core.JobState.Failed or Core.JobState.Cancelled)
            {
                // Report the REAL failure, with the step it happened at, instead of a generic error.
                FailureCode = d.Job.ErrorCode ?? d.Job.State.ToString();
                FailureDetail = $"{_loc["wiz.failedAt"]}: {d.Job.CurrentStep ?? "?"}. {d.Job.ErrorDetail}";
                return;
            }
            await _delay(TimeSpan.FromSeconds(1), ct);
        }
    }

    private void ResetOutcome() { FailureCode = FailureDetail = null; Progress = 0; CurrentStepText = null; LogLines.Clear(); JobState = null; }

    private void RaiseCommands()
    {
        NextCommand.RaiseCanExecuteChanged(); BackCommand.RaiseCanExecuteChanged();
        DeployCommand.RaiseCanExecuteChanged(); RetryCommand.RaiseCanExecuteChanged();
    }

    private void ReportError(Exception ex)
        => _dialogs.Toast(ToastKind.Error, _loc.Format("toast.failed", ex is ApiException a ? a.Detailed : ex.Message));
}
