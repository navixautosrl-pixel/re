using System.Globalization;
using System.Windows;
using System.Windows.Data;
using RobixHost.Desktop.Services;

namespace RobixHost.ControlCenter;

/// <summary>Translates a string key using the app-wide localizer. Re-evaluated when the language changes because the nav list is rebuilt on property change.</summary>
public sealed class LocConverter : IValueConverter
{
    public static readonly LocConverter Instance = new();
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        => value is string key && Application.Current.Resources["Loc"] is Localizer l ? l[key] : value;
    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotSupportedException();
}
