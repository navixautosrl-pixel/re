using System.Text.Json;
using RobixHost.Core;
using RobixHost.Data;
using RobixHost.Jobs;
using RobixHost.Networking;
using RobixHost.Provisioning;
using RobixHost.Virtualization;

namespace RobixHost.Tests;

/// <summary>
/// These tests drive the REAL qemu-system-x86_64 / qemu-img binaries. In this development workspace there is no /dev/kvm,
/// so VMs run under TCG (software emulation, AllowSoftwareEmulation=true). That validates the provider's process control,
/// QMP handling and state verification - it does NOT validate KVM performance or device behaviour.
/// </summary>
public static class IntegrationTests
{
    private static QemuKvmProvider NewProvider(string dir, bool allowTcg)
        => new(new QemuOptions { VmRoot = Path.Combine(dir, "vms"), ImageRoot = Path.Combine(dir, "images"), AllowSoftwareEmulation = allowTcg });

    private static bool ProcessRunning(int pid) => QemuKvmProvider.ProcessAlive(pid);

    private static async Task RequireQemu(QemuKvmProvider p)
    {
        var c = await p.DetectCapabilitiesAsync(default);
        if (!c.QemuSystemFound || !c.QemuImgFound) throw new Skip("qemu not installed");
    }

    public static void Register(Runner r)
    {
        r.Add("provider", "capability detection reports reality, with actionable errors", async () =>
        {
            var p = NewProvider(TestEnv.NewTempDir(), false); await RequireQemu(p);
            var c = await p.DetectCapabilitiesAsync(default);
            Check.True(c.QemuVersion!.StartsWith("QEMU emulator"), "qemu version parsed: " + c.QemuVersion);
            Check.True(c.LogicalCpus > 0 && c.TotalMemoryBytes > 0 && c.ImageRootFreeBytes > 0, "hardware numbers present");
            Check.Eq(File.Exists("/dev/kvm"), c.KvmDeviceAvailable, "kvm availability matches filesystem");
            if (!c.HardwareAccelerationUsable) Check.True(c.Errors.Count > 0 && c.Warnings.Count > 0, "unusable acceleration produces errors+warnings");
            Console.WriteLine($"      host: virt={c.CpuVendorFeature} kvm={c.KvmDeviceAvailable} accel-usable={c.HardwareAccelerationUsable}");
        });

        r.Add("provider", "start is REFUSED when KVM is unusable and emulation is disabled (production default)", async () =>
        {
            var dir = TestEnv.NewTempDir(); var p = NewProvider(dir, false); await RequireQemu(p);
            if ((await p.DetectCapabilitiesAsync(default)).HardwareAccelerationUsable) throw new Skip("host has usable KVM; refusal path not reachable here");
            await p.CreateAsync(new VmSpec { Name = "nokvm", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, default);
            await Check.CodeAsync("provider.no_kvm", () => p.StartAsync("nokvm", default), "start without KVM");
            Check.Eq(VmPowerState.Stopped, (await p.GetAsync("nokvm", default))!.State, "VM stays stopped");
        });

        r.Add("provider", "create validates input, builds a real disk, rejects duplicates, cleans up on failure", async () =>
        {
            var dir = TestEnv.NewTempDir(); var p = NewProvider(dir, true); await RequireQemu(p);
            await Check.CodeAsync("validation.vm_spec", () => p.CreateAsync(new VmSpec { Name = "Bad Name", Os = GuestOs.Linux }, default), "bad name");
            await Check.CodeAsync("validation.vm_spec", () => p.CreateAsync(new VmSpec { Name = "ok", Os = GuestOs.Linux, BootIsoPath = "/etc/passwd" }, default), "iso outside image root");
            var vm = await p.CreateAsync(new VmSpec { Name = "disk-test", Os = GuestOs.Linux, DiskGb = 2, MemoryMb = 256, VCpus = 1 }, default);
            Check.Eq(VmPowerState.Stopped, vm.State, "created stopped");
            var disk = Path.Combine(dir, "vms", "disk-test", "disk0.qcow2");
            Check.True(File.Exists(disk), "disk file exists");
            var (code, so, _) = await ProcessRunner.RunAsync("qemu-img", ["info", "--output=json", disk], TimeSpan.FromSeconds(10), default);
            Check.True(code == 0 && so.Contains("2147483648"), "qemu-img confirms 2 GiB virtual size");
            await Check.CodeAsync("conflict.vm_exists", () => p.CreateAsync(new VmSpec { Name = "disk-test", Os = GuestOs.Linux }, default), "duplicate name");
            // backing image that is not a disk image -> failure and no half-created VM left behind
            Directory.CreateDirectory(Path.Combine(dir, "images")); File.WriteAllText(Path.Combine(dir, "images", "junk.img"), "not a disk");
            await Check.CodeAsync("validation.backing_image", () => p.CreateAsync(new VmSpec { Name = "junk", Os = GuestOs.Linux, BackingImagePath = Path.Combine(dir, "images", "junk.img") }, default), "junk backing image");
            Check.False(Directory.Exists(Path.Combine(dir, "vms", "junk")), "failed create leaves no directory");
            Check.Eq(1, (await p.ListAsync(default)).Count, "inventory shows only the real VM");
        });

        r.Add("provider", "full lifecycle on real QEMU: start, pause, resume, honest shutdown timeout, force stop, delete", async () =>
        {
            var dir = TestEnv.NewTempDir(); var p = NewProvider(dir, true); await RequireQemu(p);
            await p.CreateAsync(new VmSpec { Name = "life", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, default);
            try
            {
                var started = await p.StartAsync("life", default);
                Check.Eq(VmPowerState.Running, started.State, "running after start"); Check.True(started.Pid > 0, "pid reported");
                Check.True(File.Exists($"/proc/{started.Pid}/comm"), "OS process really exists");
                Check.Eq(started.Pid, (await p.StartAsync("life", default)).Pid, "start is idempotent (same process)");
                await Check.CodeAsync("conflict.vm_running", () => p.DeleteAsync("life", true, default), "cannot delete running VM");
                Check.Eq(VmPowerState.Paused, (await p.PauseAsync("life", default)).State, "paused (confirmed by QMP)");
                Check.Eq(VmPowerState.Running, (await p.ResumeAsync("life", default)).State, "resumed");
                // This VM has no OS to honour the ACPI power button, so success must NOT be claimed.
                await Check.CodeAsync("vm.shutdown_timeout", () => p.ShutdownAsync("life", TimeSpan.FromSeconds(3), default), "graceful shutdown of a guest with no OS");
                Check.Eq(VmPowerState.Running, (await p.GetAsync("life", default))!.State, "still running: failure was reported honestly");
                var pid = started.Pid!.Value;
                Check.Eq(VmPowerState.Stopped, (await p.ForceStopAsync("life", default)).State, "force stop confirmed");
                Check.False(ProcessRunning(pid), "OS process is no longer running");
                var again = await p.StartAsync("life", default);
                Check.Eq(VmPowerState.Running, again.State, "restart works"); await p.ForceStopAsync("life", default);
                await p.DeleteAsync("life", true, default);
                Check.True(await p.GetAsync("life", default) is null, "gone after delete"); Check.False(Directory.Exists(Path.Combine(dir, "vms", "life")), "files removed");
            }
            finally { try { await p.ForceStopAsync("life", default); } catch { } }
        });

        r.Add("provider", "external kill is detected (state reconciles with reality, not with our records)", async () =>
        {
            var dir = TestEnv.NewTempDir(); var p = NewProvider(dir, true); await RequireQemu(p);
            await p.CreateAsync(new VmSpec { Name = "killed", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, default);
            var vm = await p.StartAsync("killed", default);
            System.Diagnostics.Process.GetProcessById(vm.Pid!.Value).Kill(); await Task.Delay(800);
            Check.Eq(VmPowerState.Stopped, (await p.GetAsync("killed", default))!.State, "reports Stopped after out-of-band kill");
            Check.Eq(VmPowerState.Running, (await p.StartAsync("killed", default)).State, "can start again (stale sockets cleaned)");
            await p.ForceStopAsync("killed", default);
        });

        r.Add("provisioning", "job provisions VM+IP; retry/duplicate submission creates nothing twice; terminate cleans up", async () =>
        {
            var dir = TestEnv.NewTempDir(); var p = NewProvider(dir, true); await RequireQemu(p);
            var db = new SqliteDb(Path.Combine(dir, "t.db")); Migrations.Apply(db);
            var audit = new AuditStore(db); var ips = new IpPoolService(db, audit); var reg = new VmRegistry(db); var js = new JobStore(db);
            var pool = ips.CreatePool("lab", "192.0.2.0/28", "192.0.2.1", null, null, "t");
            using var runner = new JobRunner(js, [new ProvisionVmHandler(p, ips, reg), new TerminateVmHandler(p, reg, ips)], audit); runner.Start();
            try
            {
                var req = JsonSerializer.Serialize(new ProvisionRequest(new VmSpec { Name = "prov1", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, pool.Id, "SVC-9"));
                var (job, created) = runner.Submit(ProvisionVmHandler.JobType, "t", req, "k-prov1");
                var (dup, createdAgain) = runner.Submit(ProvisionVmHandler.JobType, "t", req, "k-prov1");
                Check.True(created && !createdAgain && dup.Id == job.Id, "duplicate request collapses to one job");
                await UnitTests.WaitFor(() => js.Get(job.Id)!.State is JobState.Succeeded or JobState.Failed, 60);
                var done = js.Get(job.Id)!; Check.Eq(JobState.Succeeded, done.State, "job succeeded: " + done.ErrorDetail);
                Check.Eq(VmPowerState.Running, (await p.GetAsync("prov1", default))!.State, "hypervisor confirms running");
                Check.Eq(1, ips.Allocations(pool.Id).Count(a => a.VmName == "prov1"), "exactly one IP allocated");
                Check.Eq("prov1", reg.NameForService("SVC-9"), "service mapped");
                Check.True(js.Logs(job.Id).Any(l => l.Message.Contains("Verifying")), "verification step logged");

                // Re-running the handler after a simulated lost response must not duplicate anything.
                var (rerun, _) = runner.Submit(ProvisionVmHandler.JobType, "t", req, "k-prov1-rerun");
                await UnitTests.WaitFor(() => js.Get(rerun.Id)!.State is JobState.Succeeded or JobState.Failed, 60);
                Check.Eq(JobState.Succeeded, js.Get(rerun.Id)!.State, "rerun succeeds idempotently");
                Check.Eq(1, ips.Allocations(pool.Id).Count(a => a.VmName == "prov1"), "still exactly one IP");
                Check.Eq(1, (await p.ListAsync(default)).Count, "still exactly one VM");

                // service mapped to a different VM name is refused
                var clash = JsonSerializer.Serialize(new ProvisionRequest(new VmSpec { Name = "other", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, pool.Id, "SVC-9"));
                var (cj, _) = runner.Submit(ProvisionVmHandler.JobType, "t", clash, "k-clash");
                await UnitTests.WaitFor(() => js.Get(cj.Id)!.State == JobState.Failed, 30);
                Check.Eq("validation.service_mapped", js.Get(cj.Id)!.ErrorCode, "clash rejected without retries"); Check.Eq(1, js.Get(cj.Id)!.Attempts, "no retry");

                // invalid spec fails permanently and allocates nothing
                var bad = JsonSerializer.Serialize(new ProvisionRequest(new VmSpec { Name = "x", Os = GuestOs.Linux, VCpus = 9999 }, pool.Id, "SVC-10"));
                var (bj, _) = runner.Submit(ProvisionVmHandler.JobType, "t", bad, null);
                await UnitTests.WaitFor(() => js.Get(bj.Id)!.State == JobState.Failed, 30);
                Check.Eq(1, ips.Allocations(pool.Id).Count, "failed validation allocated no IP");

                var (tj, _) = runner.Submit(TerminateVmHandler.JobType, "t", JsonSerializer.Serialize(new VmRefRequest("prov1", "SVC-9")), null);
                await UnitTests.WaitFor(() => js.Get(tj.Id)!.State is JobState.Succeeded or JobState.Failed, 60);
                Check.Eq(JobState.Succeeded, js.Get(tj.Id)!.State, "terminate ok: " + js.Get(tj.Id)!.ErrorDetail);
                Check.True(await p.GetAsync("prov1", default) is null, "VM removed"); Check.Eq(0, ips.Allocations(pool.Id).Count, "IP released");

                // Cancellation safeguard: terminate RETAINS the customer's disk; destroying it is a separate, confirmed act.
                var vmDir = Path.Combine(dir, "vms", "prov1");
                Check.True(File.Exists(Path.Combine(vmDir, "disk0.qcow2")), "disk is retained after terminate");
                var retained = await p.ListRetainedAsync(default);
                Check.Eq(1, retained.Count, "retained data is listed"); Check.Eq("prov1", retained[0].Name, "retained VM name");
                Check.True(retained[0].DiskBytesOnStorage > 0, "retained size is reported");
                await Check.CodeAsync("conflict.vm_retained", () => p.CreateAsync(new VmSpec { Name = "prov1", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, default), "name stays reserved while data is retained");
                await Check.CodeAsync("validation.confirmation", () => p.PurgeRetainedAsync("prov1", "PROV1", default), "purge with wrong confirmation");
                await Check.CodeAsync("validation.confirmation", () => p.PurgeRetainedAsync("prov1", "", default), "purge with empty confirmation");
                Check.True(File.Exists(Path.Combine(vmDir, "disk0.qcow2")), "refused purge deleted nothing");
                await Check.CodeAsync("notfound.retained", () => p.PurgeRetainedAsync("never-existed", "never-existed", default), "purge of unknown VM");
                await p.PurgeRetainedAsync("prov1", "prov1", default);
                Check.False(Directory.Exists(vmDir), "confirmed purge removes the retained data");
                Check.Eq(0, (await p.ListRetainedAsync(default)).Count, "nothing is listed after the purge");
            }
            finally { try { await p.ForceStopAsync("prov1", default); } catch { } }
        });
    }
}
