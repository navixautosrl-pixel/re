using System.Windows.Input;

namespace RobixHost.Desktop.Mvvm;

/// <summary>
/// ICommand for async work. It never blocks the caller, disables itself while running (no double-submit), and routes every
/// exception to <see cref="OnError"/>: an exception thrown inside an async-void command would otherwise crash the app.
/// </summary>
public sealed class AsyncCommand : ICommand
{
    private readonly Func<CancellationToken, Task> _run;
    private readonly Func<bool>? _canExecute;
    private CancellationTokenSource? _cts;

    public AsyncCommand(Func<CancellationToken, Task> run, Func<bool>? canExecute = null, Action<Exception>? onError = null)
        => (_run, _canExecute, OnError) = (run, canExecute, onError);

    public AsyncCommand(Func<Task> run, Func<bool>? canExecute = null, Action<Exception>? onError = null)
        : this(_ => run(), canExecute, onError) { }

    public Action<Exception>? OnError { get; set; }
    public bool IsRunning { get; private set; }
    public event EventHandler? CanExecuteChanged;

    public bool CanExecute(object? parameter) => !IsRunning && (_canExecute?.Invoke() ?? true);
    public void Execute(object? parameter) => _ = ExecuteAsync();
    public void RaiseCanExecuteChanged() => CanExecuteChanged?.Invoke(this, EventArgs.Empty);
    public void Cancel() => _cts?.Cancel();

    /// <summary>Awaitable entry point (tests and code-behind). Returns when the work has finished or failed.</summary>
    public async Task ExecuteAsync()
    {
        if (!CanExecute(null)) return;
        _cts = new CancellationTokenSource();
        IsRunning = true; RaiseCanExecuteChanged();
        try { await _run(_cts.Token); }
        catch (OperationCanceledException) { /* user cancelled: not an error */ }
        catch (Exception ex) { OnError?.Invoke(ex); }
        finally { IsRunning = false; _cts.Dispose(); _cts = null; RaiseCanExecuteChanged(); }
    }
}
