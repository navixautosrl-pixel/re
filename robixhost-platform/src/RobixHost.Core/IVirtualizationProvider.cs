namespace RobixHost.Core;

/// <summary>
/// RobixHost-owned abstraction over a low-level execution technology (KVM/QEMU first, Hyper-V later).
/// Every method returns only after the provider has confirmed the resulting state.
/// </summary>
public interface IVirtualizationProvider
{
    string Name { get; }
    Task<HostCapabilities> DetectCapabilitiesAsync(CancellationToken ct);
    Task<IReadOnlyList<VmInfo>> ListAsync(CancellationToken ct);
    Task<VmInfo?> GetAsync(string name, CancellationToken ct);

    /// <summary>Creates disk + definition. VM ends in Stopped state. Fails if it already exists.</summary>
    Task<VmInfo> CreateAsync(VmSpec spec, CancellationToken ct);
    Task<VmInfo> StartAsync(string name, CancellationToken ct);
    Task<VmInfo> ShutdownAsync(string name, TimeSpan timeout, CancellationToken ct);   // ACPI, graceful
    Task<VmInfo> ForceStopAsync(string name, CancellationToken ct);
    Task<VmInfo> PauseAsync(string name, CancellationToken ct);
    Task<VmInfo> ResumeAsync(string name, CancellationToken ct);
    /// <summary>Removes the VM definition. With deleteDisks=false the disks are RETAINED on storage (recoverable) until purged.</summary>
    Task DeleteAsync(string name, bool deleteDisks, CancellationToken ct);

    /// <summary>VMs removed with deleteDisks=false whose data still occupies storage (so it can be reviewed and purged).</summary>
    Task<IReadOnlyList<RetainedVm>> ListRetainedAsync(CancellationToken ct);

    /// <summary>
    /// Irreversibly destroys the retained data of a VM that was deleted with deleteDisks=false.
    /// The caller must pass the exact VM name as <paramref name="confirmName"/>; enforced here so no caller can bypass it.
    /// </summary>
    Task PurgeRetainedAsync(string name, string confirmName, CancellationToken ct);
}
