using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Storage;
using RobixHost.Desktop.Services;
using RobixHost.Desktop.ViewModels;

namespace RobixHost.Tests;

/// <summary>Scriptable IRobixApi for view-model tests. Records every call so tests can assert what was (not) sent.</summary>
internal sealed class FakeApi : IRobixApi
{
    public List<string> Calls { get; } = new();
    public bool IsSignedIn { get; set; } = true;
    public event Action? SessionExpired;
    public void RaiseSessionExpired() => SessionExpired?.Invoke();

    public HostInfo Host { get; set; } = FakeData.Host();
    public List<VmInfo> Vms { get; set; } = new();
    public List<RetainedVm> Retained { get; set; } = new();
    public List<JobRecord> Jobs { get; set; } = new();
    public List<IpPool> Pools { get; set; } = new();
    public Func<ProvisionRequest, string, SubmitResult>? OnProvision { get; set; }
    public Func<string, JobDetail>? OnGetJob { get; set; }
    public Exception? FailNext { get; set; }
    public string? LastProvisionKey;
    public ProvisionRequest? LastProvision;
    public (string Name, string Confirm)? LastPurge;
    public Func<string, string, Task<LoginResult>>? OnLogin { get; set; }

    private void Hit(string c) { Calls.Add(c); if (FailNext is { } e) { FailNext = null; throw e; } }

    public Task<LoginResult> LoginAsync(string username, string password, CancellationToken ct = default)
    { Hit("login"); return OnLogin?.Invoke(username, password) ?? Task.FromResult(new LoginResult("tok", "Bearer", 3600)); }
    public void SignOut() { Calls.Add("signout"); IsSignedIn = false; }
    public Task<bool> IsHealthyAsync(CancellationToken ct = default) { Calls.Add("health"); return Task.FromResult(Healthy); }
    public bool Healthy { get; set; } = true;
    public Task<StorageReport> GetStorageAsync(CancellationToken ct = default) { Hit("storage"); return Task.FromResult(new StorageReport(new PoolUsage("/", 0, 0, 0, 0, 0, 0, false), [], [])); }
    public Task<HostInfo> GetHostAsync(CancellationToken ct = default) { Hit("host"); return Task.FromResult(Host); }
    public Task<PagedResult<VmInfo>> ListVmsAsync(int limit = 50, int offset = 0, CancellationToken ct = default) { Hit("vms"); return Task.FromResult(new PagedResult<VmInfo>(Vms.Count, Vms.ToList())); }
    public Task<VmInfo> GetVmAsync(string name, CancellationToken ct = default) { Hit("vm:" + name); return Task.FromResult(Vms.First(v => v.Name == name)); }
    public Task<VmInfo> PowerAsync(string name, VmPowerAction action, CancellationToken ct = default)
    {
        Hit($"power:{name}:{action}");
        var cur = Vms.First(v => v.Name == name);
        var next = action switch { VmPowerAction.Start or VmPowerAction.Resume => VmPowerState.Running, VmPowerAction.Pause => VmPowerState.Paused, _ => VmPowerState.Stopped };
        var updated = cur with { State = next }; Vms[Vms.IndexOf(cur)] = updated; return Task.FromResult(updated);
    }
    public Task<SubmitResult> ProvisionAsync(ProvisionRequest request, string idempotencyKey, CancellationToken ct = default)
    { Hit("provision"); LastProvision = request; LastProvisionKey = idempotencyKey; return Task.FromResult(OnProvision?.Invoke(request, idempotencyKey) ?? new SubmitResult("job-1", true, JobState.Queued)); }
    public Task<SubmitResult> TerminateAsync(string name, CancellationToken ct = default) { Hit("terminate:" + name); return Task.FromResult(new SubmitResult("termjob-123456789", true, JobState.Queued)); }
    public Task<IReadOnlyList<RetainedVm>> ListRetainedAsync(CancellationToken ct = default) { Hit("retained"); return Task.FromResult<IReadOnlyList<RetainedVm>>(Retained.ToList()); }
    public Task PurgeAsync(string name, string confirmName, CancellationToken ct = default) { Hit("purge:" + name); LastPurge = (name, confirmName); return Task.CompletedTask; }
    public Task<IReadOnlyList<JobRecord>> ListJobsAsync(JobState? state = null, int limit = 50, int offset = 0, CancellationToken ct = default) { Hit("jobs"); return Task.FromResult<IReadOnlyList<JobRecord>>(Jobs.ToList()); }
    public Task<JobDetail> GetJobAsync(string id, CancellationToken ct = default) { Hit("job:" + id); return Task.FromResult(OnGetJob!(id)); }
    public Task CancelJobAsync(string id, CancellationToken ct = default) { Hit("cancel:" + id); return Task.CompletedTask; }
    public Task RetryJobAsync(string id, CancellationToken ct = default) { Hit("retry:" + id); return Task.CompletedTask; }
    public Task<IReadOnlyList<IpPool>> ListIpPoolsAsync(CancellationToken ct = default) { Hit("pools"); return Task.FromResult<IReadOnlyList<IpPool>>(Pools.ToList()); }
    public Task<IpPool> CreateIpPoolAsync(string name, string cidr, string? gateway, string? dns, int? vlan, CancellationToken ct = default) { Hit("createpool"); var p = new IpPool(Pools.Count + 1, name, cidr, gateway, dns, vlan); Pools.Add(p); return Task.FromResult(p); }
    public Task<IReadOnlyList<IpAllocation>> ListAllocationsAsync(long poolId, bool includeHistory = false, CancellationToken ct = default) => Task.FromResult<IReadOnlyList<IpAllocation>>([]);
    public Task<IReadOnlyList<AuditEvent>> ListAuditAsync(int limit = 100, int offset = 0, string? actor = null, CancellationToken ct = default) { Hit("audit:" + actor); return Task.FromResult<IReadOnlyList<AuditEvent>>([]); }
}

internal static class FakeData
{
    public static HostInfo Host(double? cpu = 12.5, bool kvm = true, long rx = 1_000_000, long tx = 500_000, DateTimeOffset? at = null)
        => new("QEMU/KVM",
            new HostCapabilities
            {
                CpuVirtExtensions = kvm, CpuVendorFeature = kvm ? "vmx" : "none", KvmDeviceAvailable = kvm, KvmDeviceAccessible = kvm, QemuSystemFound = true,
                LogicalCpus = 8, TotalMemoryBytes = 16L << 30, Errors = kvm ? new() : new() { "/dev/kvm is missing" }, Warnings = new() { "No bridge" },
            },
            new HostSampleDto(at ?? DateTimeOffset.UtcNow, cpu, 16L << 30, 10L << 30, 500L << 30, 200L << 30, rx, tx, 90_000),
            new CapacityDto(8, 12, 1.5, 16L << 30, 8L << 30, 0.5));

    public static VmInfo Vm(string name, VmPowerState s = VmPowerState.Running, int cpu = 2, int mem = 2048) => new(name, s, cpu, mem, s == VmPowerState.Stopped ? null : 1234, "QEMU/KVM");

    public static JobDetail Job(string id, JobState state, int progress = 0, string? step = null, string? code = null, string? detail = null, params string[] logs)
        => new(new JobRecord { Id = id, Type = "vm.provision", RequestedBy = "t", State = state, Progress = progress, CurrentStep = step, ErrorCode = code, ErrorDetail = detail },
               logs.Select(l => new JobLogEntry(DateTimeOffset.UtcNow, "info", l)).ToList());
}

internal sealed class FakeDialogs : IDialogService
{
    public List<(ToastKind Kind, string Message)> Toasts { get; } = new();
    public List<string> Asked { get; } = new();
    public bool ConfirmAnswer { get; set; } = true;
    /// <summary>What the "user" types in a type-to-confirm dialog.</summary>
    public string? TypedText { get; set; }

    public Task<bool> ConfirmAsync(string title, string message, string confirmLabel, bool destructive) { Asked.Add("confirm:" + title); return Task.FromResult(ConfirmAnswer); }
    public Task<bool> ConfirmByTypingAsync(string title, string message, string expectedText) { Asked.Add("type:" + title); return Task.FromResult(TypedText is not null && TypedText == expectedText); }
    public void Toast(ToastKind kind, string message) => Toasts.Add((kind, message));
}
