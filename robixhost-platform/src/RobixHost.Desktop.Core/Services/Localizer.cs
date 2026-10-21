using RobixHost.Desktop.Mvvm;

namespace RobixHost.Desktop.Services;

public enum Language { English, Romanian }

public sealed class Localizer : ObservableObject
{
    private Language _language = Language.English;

    public Language Language
    {
        get => _language;
        set { if (SetProperty(ref _language, value)) { OnPropertyChanged("Item[]"); LanguageChanged?.Invoke(); } }
    }

    public event Action? LanguageChanged;

    /// <summary>Text for <paramref name="key"/>; falls back to English, then to the key itself (visible, never a crash).</summary>
    public string this[string key]
    {
        get
        {
            var table = _language == Language.Romanian ? Strings.Ro : Strings.En;
            return table.TryGetValue(key, out var v) ? v : Strings.En.TryGetValue(key, out var e) ? e : key;
        }
    }

    public string Format(string key, params object[] args) => string.Format(System.Globalization.CultureInfo.CurrentCulture, this[key], args);
}
