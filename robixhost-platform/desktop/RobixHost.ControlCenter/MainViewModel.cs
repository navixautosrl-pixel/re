using RobixHost.Client;
using RobixHost.ControlCenter.Services;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;
using RobixHost.Desktop.ViewModels;

namespace RobixHost.ControlCenter;

/// <summary>Owns the current screen: sign-in or the shell. Page view-models are created lazily per navigation.</summary>
public sealed class MainViewModel : ObservableObject
{
    private readonly Localizer _loc;
    private readonly WpfDialogService _dialogs;
    private readonly ApiFactory _factory = new();
    private object? _screen;
    private ShellViewModel? _shell;
    private IDisposable? _livePage;

    public MainViewModel(Localizer loc, WpfDialogService dialogs)
    {
        _loc = loc; _dialogs = dialogs;
        ShowLogin();
    }

    public Localizer Loc => _loc;
    public WpfDialogService Dialogs => _dialogs;
    public object? Screen { get => _screen; private set => SetProperty(ref _screen, value); }

    private void ShowLogin()
    {
        _livePage?.Dispose(); _livePage = null; _shell?.Dispose(); _shell = null;
        var login = new LoginViewModel(_factory, _loc);
        login.SignedIn += (api, _) => ShowShell(api);
        Screen = login;
    }

    private void ShowShell(IRobixApi api)
    {
        var monitor = new ConnectionMonitor(api);
        _shell = new ShellViewModel(api, _loc, _dialogs, monitor, item => CreatePage(api, item));
        _shell.SignedOut += ShowLogin;
        monitor.Start();
        Screen = _shell;
    }

    private object? CreatePage(IRobixApi api, NavItem item)
    {
        _livePage?.Dispose(); _livePage = null;   // stop the previous page's auto-refresh before leaving it
        switch (item.Key)
        {
            case "dashboard":
                var d = new DashboardViewModel(api, _loc); _livePage = d; d.StartAutoRefresh(TimeSpan.FromSeconds(5)); Fire(d.RefreshAsync()); return d;
            case "vms": var v = new VmListViewModel(api, _loc, _dialogs); Fire(v.RefreshAsync()); return v;
            case "createVps": var c = new CreateVpsViewModel(api, _loc, _dialogs); Fire(c.LoadAsync()); return c;
            case "audit": var a = new AuditViewModel(api, _loc); Fire(a.RefreshAsync()); return a;
            default: return null;   // shell shows the honest "not built yet" placeholder
        }
    }

    /// <summary>Background loads must never surface as unhandled exceptions.</summary>
    private void Fire(Task t) => t.ContinueWith(x => _dialogs.Toast(ToastKind.Error, x.Exception?.GetBaseException().Message ?? "?"), TaskContinuationOptions.OnlyOnFaulted);
}
