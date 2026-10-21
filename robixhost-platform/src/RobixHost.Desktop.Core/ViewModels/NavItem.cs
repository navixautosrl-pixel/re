namespace RobixHost.Desktop.ViewModels;

/// <param name="Key">Stable id; also the suffix of the localization key "nav.&lt;Key&gt;".</param>
/// <param name="Icon">Name of an SVG in brand/svg/icons.</param>
/// <param name="IsBuilt">False for sections that exist in the navigation but are not implemented; they show an honest placeholder.</param>
public sealed record NavItem(string Key, string Icon, bool IsBuilt)
{
    public string TitleKey => "nav." + Key;

    /// <summary>The 19 sections required by the product specification, in order.</summary>
    public static IReadOnlyList<NavItem> All { get; } =
    [
        new("dashboard", "dashboard", true), new("vms", "vm", true), new("createVps", "plus", true), new("customers", "customers", false),
        new("plans", "plans", false), new("os", "os", false), new("templates", "template", false), new("storage", "storage", false),
        new("networks", "network", false), new("ips", "ip", false), new("servers", "server", false), new("backups", "backup", false),
        new("monitoring", "monitoring", false), new("automation", "automation", false), new("whmcs", "whmcs", false), new("security", "security", false),
        new("audit", "audit", true), new("settings", "settings", false), new("diagnostics", "diagnostics", false),
    ];
}
