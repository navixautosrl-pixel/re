using RobixHost.Core;

namespace RobixHost.Client;

public sealed record LoginResult(string Token, string TokenType, int ExpiresInSeconds);

public sealed record PagedResult<T>(int Total, IReadOnlyList<T> Items);

/// <summary>Real measurements from the host. Null / 0 means "not available", never an invented number.</summary>
public sealed record HostSampleDto(
    DateTimeOffset At, double? CpuPercent, long MemTotalBytes, long MemAvailableBytes,
    long DiskTotalBytes, long DiskFreeBytes, long NetRxBytes, long NetTxBytes, double UptimeSeconds)
{
    public long MemUsedBytes => Math.Max(0, MemTotalBytes - MemAvailableBytes);
    public long DiskUsedBytes => Math.Max(0, DiskTotalBytes - DiskFreeBytes);
}

/// <summary>What has been PROMISED to guests (allocation), not what they use.</summary>
public sealed record CapacityDto(int PhysicalCpus, double AllocatedVcpus, double CpuOvercommit, long PhysicalMemBytes, long AllocatedMemBytes, double MemOvercommit);

public sealed record HostInfo(string Provider, HostCapabilities Capabilities, HostSampleDto Measured, CapacityDto Allocated);

public sealed record JobLogEntry(DateTimeOffset At, string Level, string Message);
public sealed record JobDetail(JobRecord Job, IReadOnlyList<JobLogEntry> Logs);

public sealed record SubmitResult(string JobId, bool Created, JobState State);
