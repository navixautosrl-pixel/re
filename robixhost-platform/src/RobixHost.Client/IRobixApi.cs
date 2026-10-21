using RobixHost.Core;
using RobixHost.Storage;

namespace RobixHost.Client;

public enum VmPowerAction { Start, Shutdown, Stop, Pause, Resume }

/// <summary>The admin API as the Control Center sees it. View-models depend on this interface, so they are testable without a server.</summary>
public interface IRobixApi
{
    bool IsSignedIn { get; }
    /// <summary>Raised when the server rejects the token (expired / revoked). The UI must return to the sign-in screen.</summary>
    event Action? SessionExpired;

    Task<LoginResult> LoginAsync(string username, string password, CancellationToken ct = default);
    void SignOut();
    Task<bool> IsHealthyAsync(CancellationToken ct = default);

    Task<HostInfo> GetHostAsync(CancellationToken ct = default);

    /// <summary>Virtual capacity vs real consumption per disk and for the pool.</summary>
    Task<StorageReport> GetStorageAsync(CancellationToken ct = default);

    Task<PagedResult<VmInfo>> ListVmsAsync(int limit = 50, int offset = 0, CancellationToken ct = default);
    Task<VmInfo> GetVmAsync(string name, CancellationToken ct = default);
    /// <summary>Returns only after the server's hypervisor has confirmed the new state.</summary>
    Task<VmInfo> PowerAsync(string name, VmPowerAction action, CancellationToken ct = default);
    /// <summary>The idempotency key makes retries safe: the same key never creates a second VM.</summary>
    Task<SubmitResult> ProvisionAsync(ProvisionRequest request, string idempotencyKey, CancellationToken ct = default);
    Task<SubmitResult> TerminateAsync(string name, CancellationToken ct = default);
    /// <summary>Terminated VMs whose disks still occupy storage.</summary>
    Task<IReadOnlyList<RetainedVm>> ListRetainedAsync(CancellationToken ct = default);
    /// <summary>Irreversible. <paramref name="confirmName"/> must equal the VM name; the server enforces it.</summary>
    Task PurgeAsync(string name, string confirmName, CancellationToken ct = default);

    Task<IReadOnlyList<JobRecord>> ListJobsAsync(JobState? state = null, int limit = 50, int offset = 0, CancellationToken ct = default);
    Task<JobDetail> GetJobAsync(string id, CancellationToken ct = default);
    Task CancelJobAsync(string id, CancellationToken ct = default);
    Task RetryJobAsync(string id, CancellationToken ct = default);

    Task<IReadOnlyList<IpPool>> ListIpPoolsAsync(CancellationToken ct = default);
    Task<IpPool> CreateIpPoolAsync(string name, string cidr, string? gateway, string? dns, int? vlan, CancellationToken ct = default);
    Task<IReadOnlyList<IpAllocation>> ListAllocationsAsync(long poolId, bool includeHistory = false, CancellationToken ct = default);

    Task<IReadOnlyList<AuditEvent>> ListAuditAsync(int limit = 100, int offset = 0, string? actor = null, CancellationToken ct = default);
}
