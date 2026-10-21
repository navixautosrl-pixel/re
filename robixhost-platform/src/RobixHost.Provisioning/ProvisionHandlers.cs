using System.Text.Json;
using RobixHost.Core;
using RobixHost.Data;
using RobixHost.Jobs;
using RobixHost.Networking;

namespace RobixHost.Provisioning;

/// <summary>
/// DeleteDisks defaults to FALSE: terminating a service retains the customer's disks (recoverable) until an administrator
/// explicitly purges them with name confirmation. A mistaken cancellation must never be instant, irreversible data loss.
/// </summary>
public sealed record VmRefRequest(string VmName, string? ServiceId, bool DeleteDisks = false);

public sealed class VmRegistry(SqliteDb db)
{
    public void Upsert(string name, string? serviceId, VmSpec spec, string desired)
        => db.Exec("INSERT INTO vms(name,service_id,spec_json,desired_state,created_at) VALUES(?,?,?,?,?) ON CONFLICT(name) DO UPDATE SET desired_state=excluded.desired_state",
                   name, serviceId, JsonSerializer.Serialize(spec), desired, DateTimeOffset.UtcNow);
    public string? NameForService(string serviceId) => db.QueryOne("SELECT name FROM vms WHERE service_id=? AND deleted_at IS NULL", r => r.Str(0), serviceId);
    public void SetSuspended(string name, bool suspended) => db.Exec("UPDATE vms SET suspended=? WHERE name=?", suspended, name);
    public void MarkDeleted(string name) => db.Exec("UPDATE vms SET deleted_at=?, service_id=NULL WHERE name=?", DateTimeOffset.UtcNow, name);
    public bool IsSuspended(string name) => db.Scalar("SELECT suspended FROM vms WHERE name=?", name) == 1;
}

/// <summary>Idempotent provisioning. Safe to re-run after timeouts or crashes: each step checks what already exists.</summary>
public sealed class ProvisionVmHandler(IVirtualizationProvider provider, IpPoolService ips, VmRegistry registry) : IJobHandler
{
    public const string JobType = "vm.provision";
    public string Type => JobType;
    public string? ConcurrencyKey(JobRecord job) => "vm:" + JsonSerializer.Deserialize<ProvisionRequest>(job.PayloadJson ?? "")?.Spec.Name;

    public async Task ExecuteAsync(JobContext ctx, CancellationToken ct)
    {
        var req = JsonSerializer.Deserialize<ProvisionRequest>(ctx.Job.PayloadJson ?? "")
                  ?? throw new RobixException("validation.payload", "Provision request is empty or malformed.");
        var spec = req.Spec;
        string? allocated = null;
        try
        {
            ctx.Step(5, "Validating request against host capabilities");
            var caps = await provider.DetectCapabilitiesAsync(ct);
            var problems = VmSpecValidator.Validate(spec, caps, imageRoot: null);
            problems = problems.Where(p => !p.Contains("no image root")).ToList();
            if (problems.Count > 0) throw new RobixException("validation.vm_spec", string.Join("; ", problems));

            if (req.ServiceId is not null && registry.NameForService(req.ServiceId) is { } existingName && existingName != spec.Name)
                throw new RobixException("validation.service_mapped", $"Service {req.ServiceId} is already mapped to VM '{existingName}'.");

            if (req.IpPoolId is { } poolId)
            {
                ctx.Step(20, "Allocating IP address");
                var mine = ips.Allocations(poolId).FirstOrDefault(a => a.VmName == spec.Name);
                allocated = (mine ?? ips.AllocateNext(poolId, spec.Name, req.ServiceId, ctx.Job.RequestedBy)).Address;
                ctx.Info($"IP {allocated} reserved");
            }

            ctx.Step(40, "Creating VM and disk");
            if (await provider.GetAsync(spec.Name, ct) is null) await provider.CreateAsync(spec, ct);
            else ctx.Info("VM already exists (retry); continuing");
            registry.Upsert(spec.Name, req.ServiceId, spec, req.StartAfterCreate ? "Running" : "Stopped");

            if (req.StartAfterCreate)
            {
                ctx.Step(70, "Starting VM");
                await provider.StartAsync(spec.Name, ct);
            }

            ctx.Step(90, "Verifying final state with the hypervisor");
            var vm = await provider.GetAsync(spec.Name, ct) ?? throw new RobixException("provision.verify", "VM disappeared after creation.");
            var want = req.StartAfterCreate ? VmPowerState.Running : VmPowerState.Stopped;
            if (vm.State != want) throw new RobixException("provision.verify", $"Expected {want} but the hypervisor reports {vm.State}.");
            ctx.Step(100, $"Provisioned {spec.Name} ({vm.State}){(allocated is null ? "" : $", IP {allocated}")}");
        }
        catch (Exception) when (ctx.Job.Attempts >= ctx.Job.MaxAttempts)
        {
            // Final failure: do not leave an orphaned reservation behind.
            if (allocated is not null && await provider.GetAsync(spec.Name, CancellationToken.None) is null) ips.Release(allocated, "system");
            throw;
        }
    }
}

public sealed class SuspendVmHandler(IVirtualizationProvider provider, VmRegistry registry, TimeSpan? gracefulTimeout = null) : IJobHandler
{
    public const string JobType = "vm.suspend";
    public string Type => JobType;
    public string? ConcurrencyKey(JobRecord job) => "vm:" + JsonSerializer.Deserialize<VmRefRequest>(job.PayloadJson ?? "")?.VmName;
    public async Task ExecuteAsync(JobContext ctx, CancellationToken ct)
    {
        var r = JsonSerializer.Deserialize<VmRefRequest>(ctx.Job.PayloadJson ?? "") ?? throw new RobixException("validation.payload", "Malformed request.");
        ctx.Step(30, "Stopping VM for suspension");
        try { await provider.ShutdownAsync(r.VmName, gracefulTimeout ?? TimeSpan.FromSeconds(30), ct); }
        catch (RobixException ex) when (ex.Code == "vm.shutdown_timeout") { ctx.Warn("Graceful shutdown timed out; forcing stop"); await provider.ForceStopAsync(r.VmName, ct); }
        registry.SetSuspended(r.VmName, true);
        var vm = await provider.GetAsync(r.VmName, ct);
        if (vm?.State != VmPowerState.Stopped) throw new RobixException("suspend.verify", "VM is still running after suspend.");
        ctx.Step(100, "Suspended");
    }
}

public sealed class UnsuspendVmHandler(IVirtualizationProvider provider, VmRegistry registry) : IJobHandler
{
    public const string JobType = "vm.unsuspend";
    public string Type => JobType;
    public string? ConcurrencyKey(JobRecord job) => "vm:" + JsonSerializer.Deserialize<VmRefRequest>(job.PayloadJson ?? "")?.VmName;
    public async Task ExecuteAsync(JobContext ctx, CancellationToken ct)
    {
        var r = JsonSerializer.Deserialize<VmRefRequest>(ctx.Job.PayloadJson ?? "") ?? throw new RobixException("validation.payload", "Malformed request.");
        registry.SetSuspended(r.VmName, false);
        ctx.Step(50, "Starting VM");
        await provider.StartAsync(r.VmName, ct);
        if ((await provider.GetAsync(r.VmName, ct))?.State != VmPowerState.Running) throw new RobixException("unsuspend.verify", "VM did not start.");
        ctx.Step(100, "Reactivated");
    }
}

public sealed class TerminateVmHandler(IVirtualizationProvider provider, VmRegistry registry, IpPoolService ips) : IJobHandler
{
    public const string JobType = "vm.terminate";
    public string Type => JobType;
    public string? ConcurrencyKey(JobRecord job) => "vm:" + JsonSerializer.Deserialize<VmRefRequest>(job.PayloadJson ?? "")?.VmName;
    public async Task ExecuteAsync(JobContext ctx, CancellationToken ct)
    {
        var r = JsonSerializer.Deserialize<VmRefRequest>(ctx.Job.PayloadJson ?? "") ?? throw new RobixException("validation.payload", "Malformed request.");
        if (await provider.GetAsync(r.VmName, ct) is { } vm)
        {
            if (vm.State != VmPowerState.Stopped) { ctx.Step(30, "Stopping VM"); await provider.ForceStopAsync(r.VmName, ct); }
            ctx.Step(60, "Deleting VM");
            await provider.DeleteAsync(r.VmName, r.DeleteDisks, ct);
        }
        else ctx.Info("VM already absent (idempotent terminate)");
        if (await provider.GetAsync(r.VmName, ct) is not null) throw new RobixException("terminate.verify", "VM still present after deletion.");
        ips.ReleaseForVm(r.VmName, ctx.Job.RequestedBy);
        registry.MarkDeleted(r.VmName);
        ctx.Step(100, r.DeleteDisks ? "Terminated (disks deleted)" : "Terminated (disks retained; purge to free space)");
    }
}
