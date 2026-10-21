using System.Text.RegularExpressions;

namespace RobixHost.Core;

public static partial class VmSpecValidator
{
    [GeneratedRegex("^[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?$")]
    private static partial Regex NameRx();
    [GeneratedRegex("^([0-9a-f]{2}:){5}[0-9a-f]{2}$")]
    private static partial Regex MacRx();
    [GeneratedRegex("^[a-zA-Z0-9_.-]{1,15}$")]
    private static partial Regex BridgeRx();

    public static IReadOnlyList<string> Validate(VmSpec s, HostCapabilities? host = null, string? imageRoot = null)
    {
        var e = new List<string>();
        if (!NameRx().IsMatch(s.Name)) e.Add("name: use 1-48 chars of a-z, 0-9 and '-', not starting/ending with '-'");
        if (s.VCpus is < 1 or > 128) e.Add("vcpus: must be 1..128");
        if (host is { LogicalCpus: > 0 } && s.VCpus > host.LogicalCpus * 4) e.Add($"vcpus: exceeds 4x the host's {host.LogicalCpus} logical CPUs");
        if (s.MemoryMb is < 128 or > 1_048_576) e.Add("memoryMb: must be 128..1048576");
        if (host is { TotalMemoryBytes: > 0 } && (long)s.MemoryMb * 1024 * 1024 > host.TotalMemoryBytes) e.Add("memoryMb: larger than total host memory");
        if (s.DiskGb is < 1 or > 65536) e.Add("diskGb: must be 1..65536");
        if (s.DiskFormat is not ("qcow2" or "raw")) e.Add("diskFormat: supported values are qcow2, raw");
        if (!string.IsNullOrEmpty(s.MacAddress) && !MacRx().IsMatch(s.MacAddress)) e.Add("macAddress: expected aa:bb:cc:dd:ee:ff");
        if (!string.IsNullOrEmpty(s.Bridge) && !BridgeRx().IsMatch(s.Bridge)) e.Add("bridge: invalid interface name");
        foreach (var (label, path) in new[] { ("bootIsoPath", s.BootIsoPath), ("backingImagePath", s.BackingImagePath) })
        {
            if (string.IsNullOrEmpty(path)) continue;
            if (imageRoot is null) { e.Add($"{label}: no image root configured"); continue; }
            if (!PathGuard.IsInside(imageRoot, path)) e.Add($"{label}: must be inside the configured image directory");
        }
        return e;
    }
}

public static class PathGuard
{
    /// <summary>True only if <paramref name="candidate"/> resolves (after normalisation and symlink-free comparison) inside <paramref name="root"/>.</summary>
    public static bool IsInside(string root, string candidate)
    {
        if (candidate.Contains('\0')) return false;
        var r = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        var c = Path.GetFullPath(candidate);
        if (!c.StartsWith(r, StringComparison.Ordinal)) return false;
        // resolve symlinks of the existing prefix to defeat link escapes
        var info = new FileInfo(c);
        var target = info.Exists ? info.ResolveLinkTarget(true) : null;
        if (target is not null && !target.FullName.StartsWith(Path.GetFullPath(root), StringComparison.Ordinal)) return false;
        return true;
    }
}
