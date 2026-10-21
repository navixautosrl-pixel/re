namespace RobixHost.Core;

public enum VmPowerState { Unknown, Stopped, Running, Paused, Suspended, Error }

public enum JobState { Queued, Running, Succeeded, Failed, Cancelled }

public enum GuestOs { Linux, Windows }

/// <summary>Desired configuration of a VM. Validated by <see cref="VmSpecValidator"/> before any provider call.</summary>
public sealed record VmSpec
{
    public required string Name { get; init; }          // [a-z0-9-], 1..48, also used as provider identifier
    public required GuestOs Os { get; init; }
    public int VCpus { get; init; } = 1;
    public int MemoryMb { get; init; } = 1024;
    public int DiskGb { get; init; } = 10;
    public string DiskFormat { get; init; } = "qcow2";
    public string? BootIsoPath { get; init; }            // must live under the configured image root
    public string? BackingImagePath { get; init; }       // cloud image / template (copy-on-write overlay)
    public string Bridge { get; init; } = "";            // empty => user-mode networking (dev only)
    public string? MacAddress { get; init; }
}

/// <summary>Request body of POST /api/v1/vms. Lives in Core so the API, the job handlers and the desktop client share one definition.</summary>
public sealed record ProvisionRequest(VmSpec Spec, long? IpPoolId, string? ServiceId, bool StartAfterCreate = true);

/// <summary>Disk data of a VM that was terminated but not yet purged. It still consumes storage.</summary>
public sealed record RetainedVm(string Name, DateTimeOffset DeletedAt, long DiskBytesOnStorage);

public sealed record VmInfo(string Name, VmPowerState State, int VCpus, int MemoryMb, int? Pid, string Provider);

public sealed record HostCapabilities
{
    public bool CpuVirtExtensions { get; init; }
    public string CpuVendorFeature { get; init; } = "none"; // vmx | svm | none
    public bool KvmDeviceAvailable { get; init; }
    public bool KvmDeviceAccessible { get; init; }
    public bool QemuSystemFound { get; init; }
    public string? QemuVersion { get; init; }
    public bool QemuImgFound { get; init; }
    public bool Uefi { get; init; }
    public int LogicalCpus { get; init; }
    public long TotalMemoryBytes { get; init; }
    public long ImageRootFreeBytes { get; init; }
    public string HostOs { get; init; } = "";
    public bool HardwareAccelerationUsable => CpuVirtExtensions && KvmDeviceAvailable && KvmDeviceAccessible && QemuSystemFound;
    public List<string> Warnings { get; init; } = new();
    public List<string> Errors { get; init; } = new();
}

public sealed record JobRecord
{
    public required string Id { get; init; }
    public required string Type { get; init; }
    public required string RequestedBy { get; init; }
    public string? IdempotencyKey { get; init; }
    public JobState State { get; init; } = JobState.Queued;
    public int Progress { get; init; }
    public string? CurrentStep { get; init; }
    public string? PayloadJson { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorDetail { get; init; }
    public int Attempts { get; init; }
    public int MaxAttempts { get; init; } = 3;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? StartedAt { get; init; }
    public DateTimeOffset? FinishedAt { get; init; }
}

public sealed record IpPool(long Id, string Name, string Cidr, string? Gateway, string? Dns, int? Vlan);

public sealed record IpAllocation(long Id, long PoolId, string Address, string? VmName, string? ServiceId, DateTimeOffset AllocatedAt, DateTimeOffset? ReleasedAt);

public sealed record AuditEvent(long Id, DateTimeOffset At, string Actor, string Action, string? Target, string? Detail, string? RequestId);

/// <summary>Structured, user-presentable failure.</summary>
public sealed class RobixException : Exception
{
    public string Code { get; }
    public RobixException(string code, string message, Exception? inner = null) : base(message, inner) => Code = code;
}
