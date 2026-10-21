using System.Globalization;

namespace RobixHost.Desktop.Services;

public static class Format
{
    public const string NotAvailable = "n/a";

    public static string Bytes(long bytes)
    {
        string[] unit = ["B", "KB", "MB", "GB", "TB", "PB"];
        double v = bytes; var i = 0;
        while (v >= 1024 && i < unit.Length - 1) { v /= 1024; i++; }
        return string.Create(CultureInfo.InvariantCulture, $"{(i == 0 ? v.ToString("0") : v.ToString("0.0"))} {unit[i]}");
    }

    public static string Percent(double? v) => v is null ? NotAvailable : string.Create(CultureInfo.InvariantCulture, $"{v.Value:0.#}%");

    public static string Ratio(double v) => string.Create(CultureInfo.InvariantCulture, $"{v:0.##}:1");

    public static string Uptime(double seconds)
    {
        var t = TimeSpan.FromSeconds(Math.Max(0, seconds));
        return t.TotalDays >= 1 ? $"{(int)t.TotalDays}d {t.Hours}h" : t.TotalHours >= 1 ? $"{(int)t.TotalHours}h {t.Minutes}m" : $"{t.Minutes}m {t.Seconds}s";
    }

    /// <summary>Bytes per second; null when fewer than two samples exist (a rate cannot be invented).</summary>
    public static string Rate(double? bytesPerSecond) => bytesPerSecond is null ? NotAvailable : Bytes((long)bytesPerSecond.Value) + "/s";
}
