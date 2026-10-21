namespace RobixHost.Monitoring;

public sealed record HostSample(
    DateTimeOffset At, double? CpuPercent, long MemTotalBytes, long MemAvailableBytes,
    long DiskTotalBytes, long DiskFreeBytes, long NetRxBytes, long NetTxBytes, double UptimeSeconds);

/// <summary>Reads real measurements from /proc. Nothing here is synthesized; unavailable values are null/0.</summary>
public sealed class HostMetrics(string diskPath)
{
    private (long Busy, long Total)? _prevCpu;

    public HostSample Sample()
    {
        double? cpu = null;
        var cur = ReadCpu();
        if (cur is { } c && _prevCpu is { } p && c.Total > p.Total) cpu = 100.0 * (c.Busy - p.Busy) / (c.Total - p.Total);
        _prevCpu = cur;

        long total = 0, avail = 0;
        if (File.Exists("/proc/meminfo"))
            foreach (var l in File.ReadLines("/proc/meminfo"))
            {
                if (l.StartsWith("MemTotal:")) total = Kb(l);
                else if (l.StartsWith("MemAvailable:")) avail = Kb(l);
            }

        long dTotal = 0, dFree = 0;
        try { var d = new DriveInfo(Path.GetFullPath(diskPath)); dTotal = d.TotalSize; dFree = d.AvailableFreeSpace; } catch { }

        long rx = 0, tx = 0;
        if (File.Exists("/proc/net/dev"))
            foreach (var l in File.ReadLines("/proc/net/dev").Skip(2))
            {
                var parts = l.Split(':', 2);
                if (parts.Length != 2 || parts[0].Trim() == "lo") continue;
                var f = parts[1].Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (f.Length >= 9 && long.TryParse(f[0], out var r) && long.TryParse(f[8], out var t)) { rx += r; tx += t; }
            }

        double up = 0;
        if (File.Exists("/proc/uptime") && double.TryParse(File.ReadAllText("/proc/uptime").Split(' ')[0], System.Globalization.CultureInfo.InvariantCulture, out var u)) up = u;

        return new HostSample(DateTimeOffset.UtcNow, cpu, total, avail, dTotal, dFree, rx, tx, up);
    }

    private static long Kb(string line) => long.Parse(line.Split(' ', StringSplitOptions.RemoveEmptyEntries)[1]) * 1024;

    private static (long Busy, long Total)? ReadCpu()
    {
        if (!File.Exists("/proc/stat")) return null;
        var f = File.ReadLines("/proc/stat").First().Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).Select(long.Parse).ToArray();
        var total = f.Sum(); var idle = f[3] + (f.Length > 4 ? f[4] : 0);
        return (total - idle, total);
    }
}

/// <summary>Capacity accounting: allocated (promised to guests) is always reported separately from measured usage.</summary>
public static class CapacityMath
{
    public sealed record Capacity(int PhysicalCpus, double AllocatedVcpus, double CpuOvercommit, long PhysicalMemBytes, long AllocatedMemBytes, double MemOvercommit);

    public static Capacity Compute(int physicalCpus, long physicalMem, IEnumerable<(int VCpus, int MemoryMb)> vms)
    {
        var list = vms.ToList();
        var vcpus = list.Sum(v => v.VCpus); var mem = list.Sum(v => (long)v.MemoryMb * 1024 * 1024);
        return new Capacity(physicalCpus, vcpus, physicalCpus == 0 ? 0 : (double)vcpus / physicalCpus,
                            physicalMem, mem, physicalMem == 0 ? 0 : (double)mem / physicalMem);
    }

    /// <summary>Refuses placement that would exceed the configured overcommit policy. Never overcommits silently.</summary>
    public static string? CheckPlacement(Capacity c, int addVcpus, int addMemMb, double maxCpuOvercommit, double maxMemOvercommit)
    {
        if (c.PhysicalCpus > 0 && (c.AllocatedVcpus + addVcpus) / c.PhysicalCpus > maxCpuOvercommit)
            return $"CPU overcommit would exceed {maxCpuOvercommit:0.##}:1 ({(c.AllocatedVcpus + addVcpus) / c.PhysicalCpus:0.##}:1).";
        var mem = (c.AllocatedMemBytes + (long)addMemMb * 1024 * 1024) / (double)Math.Max(1, c.PhysicalMemBytes);
        if (mem > maxMemOvercommit) return $"Memory overcommit would exceed {maxMemOvercommit:0.##}:1 ({mem:0.##}:1).";
        return null;
    }
}
