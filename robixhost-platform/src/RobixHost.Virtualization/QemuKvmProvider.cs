using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using RobixHost.Core;

namespace RobixHost.Virtualization;

public sealed class QemuOptions
{
    public required string VmRoot { get; init; }          // per-VM state directories live here
    public required string ImageRoot { get; init; }       // ISOs / cloud images / templates (read-only inputs)
    public string QemuBinary { get; init; } = "qemu-system-x86_64";
    public string QemuImgBinary { get; init; } = "qemu-img";
    /// <summary>
    /// Development-only escape hatch. Without KVM, QEMU falls back to TCG (full software emulation: real
    /// execution, but unsuitable for customers). Production configurations must leave this false.
    /// </summary>
    public bool AllowSoftwareEmulation { get; init; }
}

public sealed class QemuKvmProvider(QemuOptions opt) : IVirtualizationProvider
{
    public string Name => "qemu-kvm";
    private readonly SemaphoreSlim _lifecycle = new(1, 1);   // serialises lifecycle ops on this host (single-node)

    // ---------- capability detection ----------
    public async Task<HostCapabilities> DetectCapabilitiesAsync(CancellationToken ct)
    {
        var warnings = new List<string>(); var errors = new List<string>();
        var cpuinfo = File.Exists("/proc/cpuinfo") ? await File.ReadAllTextAsync("/proc/cpuinfo", ct) : "";
        var feature = cpuinfo.Split('\n').Where(l => l.StartsWith("flags")).Any(l => l.Split(' ').Contains("vmx")) ? "vmx"
                    : cpuinfo.Split('\n').Where(l => l.StartsWith("flags")).Any(l => l.Split(' ').Contains("svm")) ? "svm" : "none";
        var kvmExists = File.Exists("/dev/kvm");
        var kvmOk = false;
        if (kvmExists) { try { using var _ = new FileStream("/dev/kvm", FileMode.Open, FileAccess.ReadWrite); kvmOk = true; } catch { } }

        string? qver = null; var qFound = false;
        try
        {
            var (code, so, _) = await ProcessRunner.RunAsync(opt.QemuBinary, ["--version"], TimeSpan.FromSeconds(10), ct);
            if (code == 0) { qFound = true; qver = so.Split('\n')[0].Trim(); }
        }
        catch (RobixException) { }
        var imgFound = false;
        try { imgFound = (await ProcessRunner.RunAsync(opt.QemuImgBinary, ["--version"], TimeSpan.FromSeconds(10), ct)).ExitCode == 0; } catch (RobixException) { }

        if (feature == "none") errors.Add("CPU does not expose hardware virtualization (vmx/svm). Enable VT-x/AMD-V in firmware, or this host is itself a VM without nested virtualization.");
        if (!kvmExists) errors.Add("/dev/kvm is missing: the kvm kernel module is not loaded or virtualization is unavailable.");
        else if (!kvmOk) errors.Add("/dev/kvm exists but the service account cannot open it. Add the account to the 'kvm' group.");
        if (!qFound) errors.Add($"'{opt.QemuBinary}' not found. Install the qemu-system-x86 package.");
        if (!imgFound) errors.Add($"'{opt.QemuImgBinary}' not found. Install qemu-utils.");
        if (feature == "none" || !kvmExists)
            warnings.Add(opt.AllowSoftwareEmulation
                ? "DEVELOPMENT MODE: software emulation (TCG) is allowed. Do not host customers on this host."
                : "Hardware acceleration unavailable; VM start is refused (software emulation is disabled).");

        long mem = 0;
        if (File.Exists("/proc/meminfo"))
        {
            var l = (await File.ReadAllLinesAsync("/proc/meminfo", ct)).FirstOrDefault(x => x.StartsWith("MemTotal:"));
            if (l is not null && long.TryParse(l.Split(' ', StringSplitOptions.RemoveEmptyEntries)[1], out var kb)) mem = kb * 1024;
        }
        long free = 0;
        try { Directory.CreateDirectory(opt.VmRoot); free = new DriveInfo(Path.GetFullPath(opt.VmRoot)).AvailableFreeSpace; } catch (Exception ex) { warnings.Add($"Cannot read free space: {ex.Message}"); }
        var os = File.Exists("/etc/os-release") ? (File.ReadAllLines("/etc/os-release").FirstOrDefault(x => x.StartsWith("PRETTY_NAME="))?.Split('=', 2)[1].Trim('"') ?? "Linux") : Environment.OSVersion.ToString();

        return new HostCapabilities
        {
            CpuVirtExtensions = feature != "none", CpuVendorFeature = feature,
            KvmDeviceAvailable = kvmExists, KvmDeviceAccessible = kvmOk,
            QemuSystemFound = qFound, QemuVersion = qver, QemuImgFound = imgFound,
            Uefi = Directory.Exists("/usr/share/OVMF") || Directory.Exists("/usr/share/ovmf"),
            LogicalCpus = Environment.ProcessorCount, TotalMemoryBytes = mem, ImageRootFreeBytes = free, HostOs = os,
            Warnings = warnings, Errors = errors,
        };
    }

    // ---------- inventory ----------
    public async Task<IReadOnlyList<VmInfo>> ListAsync(CancellationToken ct)
    {
        Directory.CreateDirectory(opt.VmRoot);
        var list = new List<VmInfo>();
        foreach (var dir in Directory.EnumerateDirectories(opt.VmRoot).OrderBy(d => d))
            if (File.Exists(Path.Combine(dir, "spec.json")) && await GetAsync(Path.GetFileName(dir), ct) is { } vm) list.Add(vm);
        return list;
    }

    public async Task<VmInfo?> GetAsync(string name, CancellationToken ct)
    {
        var dir = DirOf(name);
        if (!File.Exists(Path.Combine(dir, "spec.json"))) return null;
        var spec = await ReadSpecAsync(dir, ct);
        var pid = LivePid(dir);
        if (pid is null) { CleanStale(dir); return new VmInfo(name, VmPowerState.Stopped, spec.VCpus, spec.MemoryMb, null, Name); }
        try
        {
            using var q = await QmpClient.ConnectAsync(Path.Combine(dir, "qmp.sock"), TimeSpan.FromSeconds(3), ct);
            var st = (await q.ExecuteAsync("query-status", null, ct))?["status"]?.GetValue<string>();
            var state = st switch { "running" => VmPowerState.Running, "paused" or "prelaunch" or "suspended" => VmPowerState.Paused, "shutdown" => VmPowerState.Stopped, _ => VmPowerState.Error };
            return new VmInfo(name, state, spec.VCpus, spec.MemoryMb, pid, Name);
        }
        catch (RobixException) { return new VmInfo(name, VmPowerState.Error, spec.VCpus, spec.MemoryMb, pid, Name); }
    }

    // ---------- lifecycle ----------
    public async Task<VmInfo> CreateAsync(VmSpec spec, CancellationToken ct)
    {
        var caps = await DetectCapabilitiesAsync(ct);
        var problems = VmSpecValidator.Validate(spec, caps, opt.ImageRoot);
        if (problems.Count > 0) throw new RobixException("validation.vm_spec", string.Join("; ", problems));
        if (!caps.QemuImgFound) throw new RobixException("provider.not_ready", "qemu-img is not installed on this host.");

        await _lifecycle.WaitAsync(ct);
        try
        {
            var dir = DirOf(spec.Name);
            if (Directory.Exists(dir))
                throw HasRetainedData(dir)
                    ? new RobixException("conflict.vm_retained", $"The name '{spec.Name}' is held by retained data of a deleted VM. Restore it or purge it (irreversible) before reusing the name.")
                    : new RobixException("conflict.vm_exists", $"A VM named '{spec.Name}' already exists.");
            Directory.CreateDirectory(dir);
            try
            {
                var disk = Path.Combine(dir, "disk0." + spec.DiskFormat);
                var args = new List<string> { "create", "-f", spec.DiskFormat };
                if (spec.BackingImagePath is not null) { args.AddRange(["-b", Path.GetFullPath(spec.BackingImagePath), "-F", await ProbeFormatAsync(spec.BackingImagePath, ct)]); }
                args.AddRange(["--", disk, $"{spec.DiskGb}G"]);
                var (code, _, err) = await ProcessRunner.RunAsync(opt.QemuImgBinary, args, TimeSpan.FromMinutes(2), ct);
                if (code != 0 || !File.Exists(disk)) throw new RobixException("provider.disk_create_failed", $"qemu-img failed: {err.Trim()}");
                await File.WriteAllTextAsync(Path.Combine(dir, "spec.json"), JsonSerializer.Serialize(spec), ct);   // written last = commit marker
            }
            catch { TryDeleteDir(dir); throw; }                                                                    // no half-created VMs
            return (await GetAsync(spec.Name, ct))!;
        }
        finally { _lifecycle.Release(); }
    }

    public async Task<VmInfo> StartAsync(string name, CancellationToken ct)
    {
        await _lifecycle.WaitAsync(ct);
        try
        {
            var vm = await GetAsync(name, ct) ?? throw NotFound(name);
            if (vm.State == VmPowerState.Running) return vm;                                // idempotent
            if (vm.State is VmPowerState.Paused) return await ResumeCoreAsync(name, ct);
            if (vm.State == VmPowerState.Error) throw new RobixException("provider.vm_error", "The VM process exists but its monitor is not responding.");

            var caps = await DetectCapabilitiesAsync(ct);
            if (!caps.QemuSystemFound) throw new RobixException("provider.not_ready", "qemu-system-x86_64 is not installed on this host.");
            var accel = caps.HardwareAccelerationUsable ? "kvm" : null;
            if (accel is null && !opt.AllowSoftwareEmulation)
                throw new RobixException("provider.no_kvm", "Hardware virtualization (KVM) is not usable on this host, and software emulation is disabled. " + string.Join(" ", caps.Errors));

            var dir = DirOf(name);
            var spec = await ReadSpecAsync(dir, ct);
            foreach (var f in new[] { "qmp.sock", "vnc.sock", "qemu.pid" }) TryDeleteFile(Path.Combine(dir, f));
            var args = BuildArgs(spec, dir, accel);
            var (code, _, err) = await ProcessRunner.RunAsync(opt.QemuBinary, args, TimeSpan.FromSeconds(30), ct);   // -daemonize: returns after the VM process is set up
            if (code != 0) throw new RobixException("provider.start_failed", $"QEMU refused to start the VM: {err.Trim()}");

            var info = await WaitForStateAsync(name, VmPowerState.Running, TimeSpan.FromSeconds(20), ct);
            return info ?? throw new RobixException("provider.start_unconfirmed", "QEMU started but the VM did not reach the running state.");
        }
        finally { _lifecycle.Release(); }
    }

    public async Task<VmInfo> ShutdownAsync(string name, TimeSpan timeout, CancellationToken ct)
    {
        await _lifecycle.WaitAsync(ct);
        try
        {
            var vm = await GetAsync(name, ct) ?? throw NotFound(name);
            if (vm.State == VmPowerState.Stopped) return vm;
            var dir = DirOf(name);
            using (var q = await QmpClient.ConnectAsync(Path.Combine(dir, "qmp.sock"), TimeSpan.FromSeconds(5), ct))
                await q.ExecuteAsync("system_powerdown", null, ct);                         // ACPI power button
            var stopped = await WaitForStateAsync(name, VmPowerState.Stopped, timeout, ct);
            if (stopped is not null && vm.Pid is { } exitPid && !await WaitForProcessExitAsync(exitPid, TimeSpan.FromSeconds(10), ct))
                throw new RobixException("provider.stop_unconfirmed", "The guest powered off but the QEMU process did not exit.");
            // A guest that ignores ACPI is NOT reported as stopped; the caller decides whether to force.
            return stopped ?? throw new RobixException("vm.shutdown_timeout", $"The guest did not shut down within {timeout.TotalSeconds:0}s. Use force stop if appropriate.");
        }
        finally { _lifecycle.Release(); }
    }

    public async Task<VmInfo> ForceStopAsync(string name, CancellationToken ct)
    {
        await _lifecycle.WaitAsync(ct);
        try
        {
            var vm = await GetAsync(name, ct) ?? throw NotFound(name);
            if (vm.State == VmPowerState.Stopped) return vm;
            var dir = DirOf(name);
            try { using var q = await QmpClient.ConnectAsync(Path.Combine(dir, "qmp.sock"), TimeSpan.FromSeconds(3), ct); await q.ExecuteAsync("quit", null, ct); }
            catch (RobixException) { /* monitor dead: fall through to kill */ }
            var stopped = await WaitForStateAsync(name, VmPowerState.Stopped, TimeSpan.FromSeconds(8), ct);
            if (stopped is null && vm.Pid is { } pid)
            {
                try { Process.GetProcessById(pid).Kill(); } catch (ArgumentException) { }
                stopped = await WaitForStateAsync(name, VmPowerState.Stopped, TimeSpan.FromSeconds(8), ct);
            }
            // QEMU removes its pidfile BEFORE the process has fully exited, so "Stopped" alone is not proof. Confirm the OS process is gone.
            if (stopped is not null && vm.Pid is { } livePid && !await WaitForProcessExitAsync(livePid, TimeSpan.FromSeconds(8), ct))
            {
                try { Process.GetProcessById(livePid).Kill(); } catch (ArgumentException) { }
                if (!await WaitForProcessExitAsync(livePid, TimeSpan.FromSeconds(5), ct)) stopped = null;
            }
            return stopped ?? throw new RobixException("provider.stop_failed", "The VM process could not be terminated.");
        }
        finally { _lifecycle.Release(); }
    }

    public async Task<VmInfo> PauseAsync(string name, CancellationToken ct) => await QmpToggleAsync(name, "stop", VmPowerState.Paused, ct);
    public async Task<VmInfo> ResumeAsync(string name, CancellationToken ct) { await _lifecycle.WaitAsync(ct); try { return await ResumeCoreAsync(name, ct); } finally { _lifecycle.Release(); } }
    private Task<VmInfo> ResumeCoreAsync(string name, CancellationToken ct) => QmpToggleCoreAsync(name, "cont", VmPowerState.Running, ct);

    public async Task DeleteAsync(string name, bool deleteDisks, CancellationToken ct)
    {
        await _lifecycle.WaitAsync(ct);
        try
        {
            var vm = await GetAsync(name, ct) ?? throw NotFound(name);
            if (vm.State != VmPowerState.Stopped) throw new RobixException("conflict.vm_running", "Stop the VM before deleting it.");
            var dir = DirOf(name);
            if (deleteDisks) TryDeleteDir(dir);
            else File.Move(Path.Combine(dir, "spec.json"), Path.Combine(dir, $"spec.deleted-{DateTime.UtcNow:yyyyMMddHHmmss}.json"));
            if (deleteDisks && Directory.Exists(dir)) throw new RobixException("provider.delete_failed", "VM files could not be fully removed.");
        }
        finally { _lifecycle.Release(); }
    }

    public async Task PurgeRetainedAsync(string name, string confirmName, CancellationToken ct)
    {
        var dir = DirOf(name);                                                   // validates the name (no path separators)
        if (!string.Equals(name, confirmName, StringComparison.Ordinal))
            throw new RobixException("validation.confirmation", "Confirmation does not match the VM name. Nothing was deleted.");
        await _lifecycle.WaitAsync(ct);
        try
        {
            if (File.Exists(Path.Combine(dir, "spec.json")))
                throw new RobixException("conflict.vm_exists", "The VM still exists. Terminate it first; purge only applies to retained data of deleted VMs.");
            if (!Directory.Exists(dir) || !HasRetainedData(dir))
                throw new RobixException("notfound.retained", $"There is no retained data for '{name}'.");
            TryDeleteDir(dir);
            if (Directory.Exists(dir)) throw new RobixException("provider.delete_failed", "Retained files could not be fully removed.");
        }
        finally { _lifecycle.Release(); }
    }

    public Task<IReadOnlyList<RetainedVm>> ListRetainedAsync(CancellationToken ct)
    {
        Directory.CreateDirectory(opt.VmRoot);
        var list = new List<RetainedVm>();
        foreach (var dir in Directory.EnumerateDirectories(opt.VmRoot).OrderBy(d => d, StringComparer.Ordinal))
        {
            if (File.Exists(Path.Combine(dir, "spec.json"))) continue;                      // a live VM, not retained data
            var marker = Directory.EnumerateFiles(dir, "spec.deleted-*.json").OrderBy(f => f, StringComparer.Ordinal).LastOrDefault();
            if (marker is null) continue;
            var bytes = Directory.EnumerateFiles(dir).Sum(f => new FileInfo(f).Length);
            list.Add(new RetainedVm(Path.GetFileName(dir), File.GetLastWriteTimeUtc(marker), bytes));
        }
        return Task.FromResult<IReadOnlyList<RetainedVm>>(list);
    }

    private static bool HasRetainedData(string dir) => Directory.EnumerateFiles(dir, "spec.deleted-*.json").Any();

    // ---------- helpers ----------
    private async Task<VmInfo> QmpToggleAsync(string name, string cmd, VmPowerState expect, CancellationToken ct)
    {
        await _lifecycle.WaitAsync(ct);
        try { return await QmpToggleCoreAsync(name, cmd, expect, ct); } finally { _lifecycle.Release(); }
    }

    private async Task<VmInfo> QmpToggleCoreAsync(string name, string cmd, VmPowerState expect, CancellationToken ct)
    {
        var vm = await GetAsync(name, ct) ?? throw NotFound(name);
        if (vm.State == expect) return vm;
        if (vm.State is VmPowerState.Stopped or VmPowerState.Error) throw new RobixException("conflict.vm_not_running", $"VM is {vm.State}; cannot {cmd}.");
        using (var q = await QmpClient.ConnectAsync(Path.Combine(DirOf(name), "qmp.sock"), TimeSpan.FromSeconds(5), ct))
            await q.ExecuteAsync(cmd, null, ct);
        return await WaitForStateAsync(name, expect, TimeSpan.FromSeconds(10), ct)
               ?? throw new RobixException("provider.state_unconfirmed", $"'{cmd}' was sent but the VM did not reach {expect}.");
    }

    private async Task<VmInfo?> WaitForStateAsync(string name, VmPowerState want, TimeSpan timeout, CancellationToken ct)
    {
        var deadline = DateTime.UtcNow + timeout;
        do
        {
            var vm = await GetAsync(name, ct);
            if (vm?.State == want) return vm;
            await Task.Delay(250, ct);
        } while (DateTime.UtcNow < deadline);
        return null;
    }

    internal static List<string> BuildArgs(VmSpec s, string dir, string? accel)
    {
        var win = s.Os == GuestOs.Windows;
        var disk = Path.Combine(dir, "disk0." + s.DiskFormat);
        var a = new List<string>
        {
            "-name", s.Name, "-machine", "q35", "-accel", accel ?? "tcg",
            "-cpu", accel is null ? "qemu64" : "host", "-smp", s.VCpus.ToString(), "-m", s.MemoryMb.ToString(),
            "-display", "none", "-vnc", $"unix:{Path.Combine(dir, "vnc.sock")}",
            "-qmp", $"unix:{Path.Combine(dir, "qmp.sock")},server=on,wait=off",
            "-pidfile", Path.Combine(dir, "qemu.pid"), "-serial", $"file:{Path.Combine(dir, "console.log")}",
            "-drive", $"file={disk},format={s.DiskFormat},if={(win ? "ide" : "virtio")},cache=none,aio=threads",
        };
        if (s.BootIsoPath is not null) { a.AddRange(["-drive", $"file={Path.GetFullPath(s.BootIsoPath)},media=cdrom,readonly=on,format=raw", "-boot", "order=dc"]); }
        var nic = win ? "e1000e" : "virtio-net-pci";   // Windows installers have no virtio drivers by default
        var mac = string.IsNullOrEmpty(s.MacAddress) ? "" : $",mac={s.MacAddress}";
        a.AddRange(["-netdev", string.IsNullOrEmpty(s.Bridge) ? "user,id=n0" : $"bridge,id=n0,br={s.Bridge}", "-device", $"{nic},netdev=n0{mac}"]);
        if (win) a.AddRange(["-rtc", "base=localtime", "-device", "qemu-xhci", "-device", "usb-tablet"]);
        a.Add("-daemonize");
        return a;
    }

    private string DirOf(string name)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(name, "^[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?$"))
            throw new RobixException("validation.vm_name", "Invalid VM name.");
        return Path.Combine(Path.GetFullPath(opt.VmRoot), name);
    }

    private static async Task<VmSpec> ReadSpecAsync(string dir, CancellationToken ct)
        => JsonSerializer.Deserialize<VmSpec>(await File.ReadAllTextAsync(Path.Combine(dir, "spec.json"), ct))!;

    private async Task<string> ProbeFormatAsync(string path, CancellationToken ct)
    {
        var (code, so, err) = await ProcessRunner.RunAsync(opt.QemuImgBinary, ["info", "--output=json", "--", Path.GetFullPath(path)], TimeSpan.FromSeconds(20), ct);
        if (code != 0) throw new RobixException("validation.backing_image", $"Backing image is not a valid disk image: {err.Trim()}");
        var format = JsonNode.Parse(so)!["format"]!.GetValue<string>();
        // qemu-img reports ANY unrecognised file as "raw", so a raw backing image cannot be verified as a disk image
        // (a text file would pass). Templates must be a self-describing format; convert raw images to qcow2 first.
        if (!VerifiableBackingFormats.Contains(format))
            throw new RobixException("validation.backing_image", $"Backing image format '{format}' is not accepted. Use a self-describing format ({string.Join(", ", VerifiableBackingFormats)}); convert raw images with 'qemu-img convert -O qcow2'.");
        return format;
    }

    private static readonly HashSet<string> VerifiableBackingFormats = new(StringComparer.Ordinal) { "qcow2", "vmdk", "vpc", "vhdx" };

    private static int? LivePid(string dir)
    {
        var f = Path.Combine(dir, "qemu.pid");
        if (!File.Exists(f) || !int.TryParse(File.ReadAllText(f).Trim(), out var pid)) return null;
        return ProcessAlive(pid, requireQemu: true) ? pid : null;      // requireQemu guards against PID reuse
    }

    /// <summary>
    /// True if the process exists and is not dead. /proc/&lt;pid&gt;/stat is "pid (comm) S ..." - comm may contain
    /// spaces/parentheses, so the state is read after the LAST ')'. A zombie (killed, not yet reaped) is NOT alive.
    /// </summary>
    public static bool ProcessAlive(int pid, bool requireQemu = false)
    {
        try
        {
            var stat = File.ReadAllText($"/proc/{pid}/stat");
            var close = stat.LastIndexOf(')');
            if (close < 0 || close + 2 >= stat.Length) return false;
            if (stat[close + 2] is 'Z' or 'X' or 'x') return false;
            return !requireQemu || stat[(stat.IndexOf('(') + 1)..close].StartsWith("qemu", StringComparison.Ordinal);
        }
        catch (IOException) { return false; }
    }

    private static async Task<bool> WaitForProcessExitAsync(int pid, TimeSpan timeout, CancellationToken ct)
    {
        var deadline = DateTime.UtcNow + timeout;
        while (ProcessAlive(pid))
        {
            if (DateTime.UtcNow >= deadline) return false;
            await Task.Delay(100, ct);
        }
        return true;
    }

    private static void CleanStale(string dir) { foreach (var f in new[] { "qmp.sock", "vnc.sock", "qemu.pid" }) TryDeleteFile(Path.Combine(dir, f)); }
    private static void TryDeleteFile(string p) { try { File.Delete(p); } catch { } }
    private static void TryDeleteDir(string p) { try { Directory.Delete(p, true); } catch { } }
    private static RobixException NotFound(string n) => new("notfound.vm", $"VM '{n}' does not exist.");
}
