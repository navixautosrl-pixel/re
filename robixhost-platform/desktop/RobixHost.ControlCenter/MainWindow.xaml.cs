using System.Windows;
using System.Windows.Controls;

namespace RobixHost.ControlCenter;

public partial class MainWindow : Window
{
    public MainWindow(MainViewModel vm) { DataContext = vm; InitializeComponent(); }

    private bool _dark = true;
    private void OnToggleTheme(object s, RoutedEventArgs e) { _dark = !_dark; App.SetTheme(_dark); }
    private void OnToggleLanguage(object s, RoutedEventArgs e)
    {
        var vm = (MainViewModel)DataContext;
        vm.Loc.Language = vm.Loc.Language == Desktop.Services.Language.English ? Desktop.Services.Language.Romanian : Desktop.Services.Language.English;
    }
    private void OnPasswordChanged(object s, RoutedEventArgs e)
    {
        // PasswordBox cannot bind; copy into the view-model (which clears it after the attempt).
        if (s is PasswordBox pb && pb.DataContext is Desktop.ViewModels.LoginViewModel lv) lv.Password = pb.Password;
    }
}
