using System.Text.Json;
using System.Text.Json.Nodes;
using RobixHost.Virtualization;

namespace RobixHost.Storage;

/// <summary>One virtual disk. Virtual size is what the guest sees; actual size is what it really occupies on the host.</summary>
public sealed record DiskUsage(string VmName, string File, string Format, long VirtualBytes, long ActualBytes, string? BackingFile, bool Retained, string? Error)
{
    /// <summary>Thin = occupies less than its virtual size (space is allocated on write).</summary>
    public bool ThinProvisioned => Error is null && ActualBytes < VirtualBytes;
}

/// <param name="ProvisionedRatio">Sum of virtual disk sizes / pool size. Above 1.0 the pool is over-provisioned: guests could write more than the disk holds.</param>
public sealed record PoolUsage(string Path, long TotalBytes, long FreeBytes, long VirtualProvisionedBytes, long ActualUsedByDisksBytes, long RetainedActualBytes, double ProvisionedRatio, bool OverProvisioned);

/// <summary>Snapshot overhead and backup consumption are NOT included yet: no snapshot or backup feature exists to measure.</summary>
public sealed record StorageReport(PoolUsage Pool, IReadOnlyList<DiskUsage> Disks, IReadOnlyList<string> Notes);

/// <summary>
/// Measures real storage use with <c>qemu-img info</c>. Capacity, provisioning and consumption are reported separately and
/// over-provisioning is shown, never hidden. A disk that cannot be read is listed with its error rather than skipped.
/// </summary>
public sealed class StorageInspector(string vmRoot, string qemuImgBinary = "qemu-img")
{
    public async Task<StorageReport> InspectAsync(CancellationToken ct)
    {
        Directory.CreateDirectory(vmRoot);
        var disks = new List<DiskUsage>();
        foreach (var dir in Directory.EnumerateDirectories(vmRoot).OrderBy(d => d, StringComparer.Ordinal))
        {
            var name = Path.GetFileName(dir);
            var live = File.Exists(Path.Combine(dir, "spec.json"));
            var retained = !live && Directory.EnumerateFiles(dir, "spec.deleted-*.json").Any();
            if (!live && !retained) continue;                                  // not a RobixHost VM directory
            foreach (var file in Directory.EnumerateFiles(dir, "disk*.*").Where(f => !f.EndsWith(".json")).OrderBy(f => f, StringComparer.Ordinal))
                disks.Add(await InspectDiskAsync(name, file, retained, ct));
        }

        long total = 0, free = 0;
        try { var d = new DriveInfo(Path.GetFullPath(vmRoot)); total = d.TotalSize; free = d.AvailableFreeSpace; } catch (Exception) { /* reported via notes */ }
        var ok = disks.Where(d => d.Error is null).ToList();
        var virt = ok.Sum(d => d.VirtualBytes);
        var ratio = total == 0 ? 0 : (double)virt / total;
        var notes = new List<string> { "Snapshot overhead and backup consumption are not measured: those features do not exist yet." };
        if (total == 0) notes.Add("The size of the storage pool could not be read, so the provisioning ratio is unavailable.");
        if (disks.Any(d => d.Error is not null)) notes.Add("Some disks could not be read; see each disk's error. Their sizes are excluded from the totals.");
        var pool = new PoolUsage(Path.GetFullPath(vmRoot), total, free, virt, ok.Where(d => !d.Retained).Sum(d => d.ActualBytes),
                                 ok.Where(d => d.Retained).Sum(d => d.ActualBytes), ratio, ratio > 1.0);
        return new StorageReport(pool, disks, notes);
    }

    private async Task<DiskUsage> InspectDiskAsync(string vm, string file, bool retained, CancellationToken ct)
    {
        try
        {
            // Never let qemu-img probe the format: it silently treats any unrecognised file as a raw disk, so a corrupt
            // "disk0.qcow2" would be reported as a healthy raw image. The extension states what the file must be.
            var declared = Path.GetExtension(file).ToLowerInvariant() switch { ".qcow2" => "qcow2", ".raw" or ".img" => "raw", _ => null };
            if (declared is null) return new DiskUsage(vm, Path.GetFileName(file), "unknown", 0, 0, null, retained, "Unrecognised disk file extension; not inspected.");
            var (code, so, err) = await ProcessRunner.RunAsync(qemuImgBinary, ["info", "--output=json", "-f", declared, "--", file], TimeSpan.FromSeconds(20), ct);
            if (code != 0) return new DiskUsage(vm, Path.GetFileName(file), "unknown", 0, 0, null, retained, $"qemu-img could not read the disk: {err.Trim()}");
            var j = JsonNode.Parse(so)!;
            // "actual-size" is what is really allocated on the host; fall back to the file length only if it is absent.
            var actual = j["actual-size"]?.GetValue<long>() ?? new FileInfo(file).Length;
            return new DiskUsage(vm, Path.GetFileName(file), j["format"]?.GetValue<string>() ?? "unknown", j["virtual-size"]!.GetValue<long>(), actual,
                                 j["full-backing-filename"]?.GetValue<string>() ?? j["backing-filename"]?.GetValue<string>(), retained, null);
        }
        catch (Exception ex) when (ex is JsonException or InvalidOperationException or FormatException or IOException)
        {
            return new DiskUsage(vm, Path.GetFileName(file), "unknown", 0, 0, null, retained, "Unreadable disk information: " + ex.Message);
        }
    }
}
