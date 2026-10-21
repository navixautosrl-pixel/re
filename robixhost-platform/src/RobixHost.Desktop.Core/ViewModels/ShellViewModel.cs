using RobixHost.Client;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

public sealed class ShellViewModel : ObservableObject, IDisposable
{
    private readonly Localizer _loc;
    private readonly IDialogService _dialogs;
    private readonly Func<NavItem, object?> _pageFactory;
    private readonly SynchronizationContext? _ui = SynchronizationContext.Current;
    private NavItem? _selected;
    private object? _currentPage;
    private ConnectionState _connection = ConnectionState.Unknown;

    public ShellViewModel(IRobixApi api, Localizer loc, IDialogService dialogs, ConnectionMonitor monitor, Func<NavItem, object?> pageFactory)
    {
        _loc = loc; _dialogs = dialogs; _pageFactory = pageFactory; Monitor = monitor;
        api.SessionExpired += OnSessionExpired;
        monitor.StateChanged += s => PostToUi(() => Connection = s);
        loc.LanguageChanged += () => OnPropertyChanged(nameof(ConnectionText));
        SignOutCommand = new AsyncCommand(() => { api.SignOut(); SignedOut?.Invoke(); return Task.CompletedTask; });
        Selected = Nav[0];
    }

    public ConnectionMonitor Monitor { get; }
    public IReadOnlyList<NavItem> Nav { get; } = NavItem.All;
    public AsyncCommand SignOutCommand { get; }
    public event Action? SignedOut;

    public NavItem? Selected
    {
        get => _selected;
        set
        {
            if (!SetProperty(ref _selected, value) || value is null) return;
            CurrentPage = _pageFactory(value) ?? new PlaceholderViewModel(_loc, value);
        }
    }

    public object? CurrentPage { get => _currentPage; private set => SetProperty(ref _currentPage, value); }

    public ConnectionState Connection
    {
        get => _connection;
        private set { if (SetProperty(ref _connection, value)) OnPropertyChanged(nameof(ConnectionText)); }
    }

    public string ConnectionText => _loc[Connection switch { ConnectionState.Connected => "conn.connected", ConnectionState.Reconnecting => "conn.reconnecting", _ => "conn.unknown" }];

    private void OnSessionExpired()
    {
        PostToUi(() => { _dialogs.Toast(ToastKind.Warning, _loc["toast.sessionExpired"]); SignedOut?.Invoke(); });
    }

    // Events from background threads (health probe, HTTP continuations) must not touch bound properties directly.
    private void PostToUi(Action a) { if (_ui is not null) _ui.Post(_ => a(), null); else a(); }

    public void Dispose() => Monitor.Dispose();
}
