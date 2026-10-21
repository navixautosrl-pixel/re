using System.Net.Http;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using RobixHost.Client;
using RobixHost.Desktop.Services;
using RobixHost.Desktop.ViewModels;

namespace RobixHost.ControlCenter.Services;

/// <summary>Real HTTP client per server. TLS validation stays on; there is deliberately no "ignore certificate errors" switch.</summary>
public sealed class ApiFactory : IApiFactory
{
    public IRobixApi Create(Uri baseAddress) => new RobixApiClient(new HttpClient { BaseAddress = baseAddress });
}

public sealed record ToastItem(ToastKind Kind, string Message);

public sealed class WpfDialogService : IDialogService
{
    public ObservableCollection<ToastItem> Toasts { get; } = new();

    public Task<bool> ConfirmAsync(string title, string message, string confirmLabel, bool destructive)
    {
        var r = MessageBox.Show(Application.Current.MainWindow, message + "\n\n[" + confirmLabel + "]", title, MessageBoxButton.OKCancel,
                                destructive ? MessageBoxImage.Warning : MessageBoxImage.Question, MessageBoxResult.Cancel);
        return Task.FromResult(r == MessageBoxResult.OK);
    }

    public Task<bool> ConfirmByTypingAsync(string title, string message, string expectedText)
    {
        var box = new TextBox { Margin = new Thickness(0, 8, 0, 12), MinWidth = 280 };
        var ok = new Button { Content = "OK", IsEnabled = false, IsDefault = true };
        var cancel = new Button { Content = "Cancel", IsCancel = true };
        var panel = new StackPanel { Margin = new Thickness(16) };
        panel.Children.Add(new TextBlock { Text = message, TextWrapping = TextWrapping.Wrap, MaxWidth = 420 });
        panel.Children.Add(box);
        var row = new StackPanel { Orientation = Orientation.Horizontal, HorizontalAlignment = HorizontalAlignment.Right };
        row.Children.Add(ok); row.Children.Add(cancel); panel.Children.Add(row);
        var win = new Window { Title = title, Content = panel, SizeToContent = SizeToContent.WidthAndHeight, WindowStartupLocation = WindowStartupLocation.CenterOwner, Owner = Application.Current.MainWindow, ResizeMode = ResizeMode.NoResize };
        // Exact, case-sensitive match: this guards irreversible deletion.
        box.TextChanged += (_, _) => ok.IsEnabled = string.Equals(box.Text, expectedText, StringComparison.Ordinal);
        ok.Click += (_, _) => win.DialogResult = true;
        return Task.FromResult(win.ShowDialog() == true);
    }

    public void Toast(ToastKind kind, string message)
    {
        void Add()
        {
            var t = new ToastItem(kind, message);
            Toasts.Add(t);
            var timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(kind == ToastKind.Error ? 12 : 5) };
            timer.Tick += (_, _) => { timer.Stop(); Toasts.Remove(t); };
            timer.Start();
        }
        if (Application.Current.Dispatcher.CheckAccess()) Add(); else Application.Current.Dispatcher.BeginInvoke(Add);
    }
}
