using System.Windows;
using RobixHost.ControlCenter.Services;
using RobixHost.Desktop.Services;

namespace RobixHost.ControlCenter;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        var dialogs = new WpfDialogService();
        // Last-resort handlers: report, never crash silently and never swallow without telling the user.
        DispatcherUnhandledException += (_, a) => { dialogs.Toast(ToastKind.Error, a.Exception.Message); a.Handled = true; };
        TaskScheduler.UnobservedTaskException += (_, a) => { dialogs.Toast(ToastKind.Error, a.Exception.GetBaseException().Message); a.SetObserved(); };

        var loc = new Localizer();
        if (System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "ro") loc.Language = Language.Romanian;
        Resources["Loc"] = loc;
        MainWindow = new MainWindow(new MainViewModel(loc, dialogs));
        MainWindow.Show();
    }

    public static void SetTheme(bool dark)
    {
        var d = Current.Resources.MergedDictionaries;
        d[0] = new ResourceDictionary { Source = new Uri(dark ? "Themes/Dark.xaml" : "Themes/Light.xaml", UriKind.Relative) };
    }
}
