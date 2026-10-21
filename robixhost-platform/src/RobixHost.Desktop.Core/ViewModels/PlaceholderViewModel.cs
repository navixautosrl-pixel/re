using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

/// <summary>Shown for sections that are not built yet. It states that plainly; it never displays sample data.</summary>
public sealed class PlaceholderViewModel(Localizer loc, NavItem item) : ObservableObject
{
    public string SectionTitle => loc[item.TitleKey];
    public string Title => loc["placeholder.title"];
    public string Body => loc["placeholder.body"];
}
