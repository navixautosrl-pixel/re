using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Desktop.Services;
using RobixHost.Desktop.ViewModels;

namespace RobixHost.Tests;

/// <summary>Starts the REAL RobixHost API as a child process (software-emulated QEMU) for end-to-end tests of the client and view-models.</summary>
internal sealed class LiveApi : IDisposable
{
    private readonly Process _proc;
    private readonly string _dir;
    public Uri BaseAddress { get; }
    public string AdminPassword { get; } = "Live-Passw0rd-" + Guid.NewGuid().ToString("N")[..8];
    public string VmRoot => Path.Combine(_dir, "data", "vms");

    private LiveApi(Process p, string dir, Uri uri) { _proc = p; _dir = dir; BaseAddress = uri; }

    public static async Task<LiveApi?> StartAsync()
    {
        var dll = Path.Combine(TestEnv.RepoRoot(), "src", "RobixHost.Api", "bin", "Debug", "net8.0", "RobixHost.Api.dll");
        if (!File.Exists(dll)) return null;
        var dir = TestEnv.NewTempDir();
        var l = new TcpListener(IPAddress.Loopback, 0); l.Start(); var port = ((IPEndPoint)l.LocalEndpoint).Port; l.Stop();
        var self = new LiveApiBuilder(dir, port);
        var psi = new ProcessStartInfo("dotnet", [dll]) { WorkingDirectory = Path.GetDirectoryName(dll)!, RedirectStandardOutput = true, RedirectStandardError = true };
        psi.Environment["RobixHost__DataDir"] = Path.Combine(dir, "data");
        psi.Environment["RobixHost__AllowSoftwareEmulation"] = "true";
        psi.Environment["RobixHost__SuspendGracefulSeconds"] = "3";
        psi.Environment["RobixHost__BootstrapAdminPassword"] = self.Password;
        psi.Environment["ASPNETCORE_URLS"] = $"http://127.0.0.1:{port}";
        var p = Process.Start(psi)!;
        _ = p.StandardOutput.ReadToEndAsync(); _ = p.StandardError.ReadToEndAsync();      // drain so the child never blocks on a full pipe
        var api = new LiveApi(p, dir, new Uri($"http://127.0.0.1:{port}/"), self.Password);
        using var http = new HttpClient();
        for (var i = 0; i < 100; i++)
        {
            try { if ((await http.GetAsync(api.BaseAddress + "health")).IsSuccessStatusCode) return api; } catch (HttpRequestException) { }
            await Task.Delay(200);
        }
        api.Dispose(); throw new Assertion("the API did not start in time");
    }

    private LiveApi(Process p, string dir, Uri uri, string password) : this(p, dir, uri) => AdminPassword = password;
    private sealed record LiveApiBuilder(string Dir, int Port) { public string Password { get; } = "Live-Passw0rd-" + Guid.NewGuid().ToString("N")[..8]; }

    public RobixApiClient NewClient() => new(new HttpClient { BaseAddress = BaseAddress });

    public void Dispose()
    {
        try { if (!_proc.HasExited) { _proc.Kill(true); _proc.WaitForExit(5000); } } catch { }
        try { foreach (var pid in Directory.EnumerateFiles(VmRoot, "qemu.pid", SearchOption.AllDirectories)) { if (int.TryParse(File.ReadAllText(pid).Trim(), out var n)) Process.GetProcessById(n).Kill(); } } catch { }
        try { Directory.Delete(_dir, true); } catch { }
    }
}

public static class LiveTests
{
    public static void Register(Runner r)
    {
        r.Add("live", "client + view-models against the REAL API: sign-in, real host data, honest health", async () =>
        {
            using var live = await LiveApi.StartAsync() ?? throw new Skip("API is not built");
            using var api = live.NewClient(); var loc = new Localizer();
            var ex = await ClientTests.Assert<ApiException>(() => api.LoginAsync("admin", "definitely-wrong"));
            Check.Eq("auth.invalid_credentials", ex.Code, "wrong password"); Check.False(api.IsSignedIn, "not signed in");
            var ex2 = await ClientTests.Assert<ApiException>(() => api.GetHostAsync()); Check.True(ex2.IsAuth, "protected endpoints need a token");

            var login = new LoginViewModel(new Factory(api), loc) { Server = live.BaseAddress.ToString(), Username = "admin", Password = live.AdminPassword };
            IRobixApi? signed = null; login.SignedIn += (a, _) => signed = a;
            await login.LoginCommand.ExecuteAsync();
            Check.True(login.Error is null && signed is not null && api.IsSignedIn, "signed in through the view-model: " + login.Error);

            var dash = new DashboardViewModel(api, loc); await dash.RefreshAsync(); await Task.Delay(400); await dash.RefreshAsync();
            Check.True(dash.Host!.Measured.MemTotalBytes > 1L << 28, "real memory total reported"); Check.True(dash.Host.Capabilities.LogicalCpus >= 1, "real CPU count");
            Check.True(dash.CpuText != "n/a", "CPU is measured by the second sample: " + dash.CpuText);
            Check.Eq(File.Exists("/dev/kvm"), dash.Host.Capabilities.KvmDeviceAvailable, "KVM availability matches the host's filesystem");
            if (!dash.AccelerationUsable) Check.True(dash.HealthSummary.Contains("cannot start") && dash.HealthMessages.Count > 0, "unusable acceleration is reported with the host's own explanation");
            Console.WriteLine($"      live host: cpu={dash.CpuText} mem={dash.MemoryText} accel={dash.AccelerationUsable}");
        });

        r.Add("live", "full lifecycle through the client: provision, power, safeguarded terminate, purge", async () =>
        {
            using var live = await LiveApi.StartAsync() ?? throw new Skip("API is not built");
            var qemu = await new RobixHost.Virtualization.QemuKvmProvider(new RobixHost.Virtualization.QemuOptions { VmRoot = live.VmRoot, ImageRoot = live.VmRoot }).DetectCapabilitiesAsync(default);
            if (!qemu.QemuSystemFound || !qemu.QemuImgFound) throw new Skip("qemu not installed");

            using var api = live.NewClient(); await api.LoginAsync("admin", live.AdminPassword);
            var dialogs = new FakeDialogs(); var loc = new Localizer();
            var pool = await api.CreateIpPoolAsync("lab", "192.0.2.0/28", "192.0.2.1", null, null);

            // --- wizard end to end, with the real server and real QEMU
            var wiz = new CreateVpsViewModel(api, loc, dialogs, (t, ct) => Task.Delay(300, ct)); await wiz.LoadAsync();
            wiz.Name = "live-vm"; wiz.VCpus = 1; wiz.MemoryMb = 256; wiz.DiskGb = 1;
            await wiz.NextCommand.ExecuteAsync(); wiz.SelectedPool = wiz.Pools[0]; await wiz.NextCommand.ExecuteAsync(); wiz.IsConfirmed = true;
            await wiz.DeployCommand.ExecuteAsync();
            Check.Eq(JobState.Succeeded, wiz.JobState, "real job succeeded: " + wiz.FailureCode + " " + wiz.FailureDetail); Check.True(wiz.Completed, "completed");
            Check.True(wiz.LogLines.Any(l => l.Contains("Verifying")), "the server's verification step is in the log shown to the user");

            // --- list, power
            var list = new VmListViewModel(api, loc, dialogs); await list.RefreshAsync();
            var row = list.Items.Single(i => i.Name == "live-vm"); Check.Eq(VmPowerState.Running, row.State, "hypervisor says running"); Check.Eq(256, row.MemoryMb, "real allocation");
            Check.Eq(1, (await api.ListAllocationsAsync(pool.Id)).Count, "one IP allocated");
            await row.PauseCommand.ExecuteAsync(); Check.Eq(VmPowerState.Paused, row.State, "paused (confirmed by QMP)");
            await row.ResumeCommand.ExecuteAsync(); Check.Eq(VmPowerState.Running, row.State, "resumed");
            dialogs.ConfirmAnswer = false; await row.StopCommand.ExecuteAsync();
            Check.Eq(VmPowerState.Running, (await api.GetVmAsync("live-vm")).State, "declined force-stop did nothing on the real VM");
            dialogs.ConfirmAnswer = true; await row.StopCommand.ExecuteAsync(); Check.Eq(VmPowerState.Stopped, row.State, "force stop confirmed by the hypervisor; toasts: " + string.Join(" | ", dialogs.Toasts.Select(t => t.Kind + ":" + t.Message)));

            // --- idempotency: the same key never creates a second VM
            var again = await api.ProvisionAsync(new ProvisionRequest(new VmSpec { Name = "live-vm", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, pool.Id, null), "same-key");
            var again2 = await api.ProvisionAsync(new ProvisionRequest(new VmSpec { Name = "live-vm", Os = GuestOs.Linux, DiskGb = 1, MemoryMb = 256 }, pool.Id, null), "same-key");
            Check.Eq(again.JobId, again2.JobId, "same idempotency key -> same job"); Check.False(again2.Created, "second submission not created");

            // --- terminate retains data; purge needs the exact name
            await row.TerminateCommand.ExecuteAsync();                      // stopped VM: plain confirmation (already true)
            await UnitTests.WaitFor(() => api.ListJobsAsync(null, 50).GetAwaiter().GetResult().Any(j => j.Type == "vm.terminate" && j.State == JobState.Succeeded), 60);
            await list.RefreshAsync();
            Check.False(list.Items.Any(i => i.Name == "live-vm"), "VM no longer in the inventory");
            Check.Eq(1, list.Retained.Count, "disk is retained and visible"); Check.True(list.Retained[0].DiskBytesOnStorage > 0, "size reported");
            Check.Eq(0, (await api.ListAllocationsAsync(pool.Id)).Count, "IP released by terminate");
            dialogs.TypedText = "LIVE-VM"; await list.PurgeAsync(list.Retained[0]); Check.Eq(1, list.Retained.Count, "wrong name: nothing purged");
            var serverSide = await ClientTests.Assert<ApiException>(() => api.PurgeAsync("live-vm", "wrong"));
            Check.Eq("validation.confirmation", serverSide.Code, "the SERVER also refuses a wrong confirmation (not only the UI)"); Check.Eq(400, serverSide.Status, "HTTP 400");
            dialogs.TypedText = "live-vm"; await list.PurgeAsync(list.Retained[0]); await list.RefreshAsync();
            Check.Eq(0, list.Retained.Count, "purged"); Check.False(Directory.Exists(Path.Combine(live.VmRoot, "live-vm")), "files really gone");

            var audit = new AuditViewModel(api, loc); await audit.RefreshAsync();
            foreach (var action in new[] { "vm.stop", "job.submit", "vm.purge" }) Check.True(audit.Events.Any(e => e.Action == action), "audited: " + action);
        });

        r.Add("live", "a signed-out client gets auth errors; viewer-level permission failures are reported as forbidden", async () =>
        {
            using var live = await LiveApi.StartAsync() ?? throw new Skip("API is not built");
            using var api = live.NewClient(); await api.LoginAsync("admin", live.AdminPassword);
            var expired = 0; api.SessionExpired += () => expired++;
            var ok = await api.ListVmsAsync(); Check.Eq(0, ok.Total, "empty inventory on a fresh host (no invented VMs)");
            api.SignOut();
            var ex = await ClientTests.Assert<ApiException>(() => api.ListVmsAsync()); Check.True(ex.IsAuth, "after sign-out");
            Check.True(await api.IsHealthyAsync(), "health needs no token");
        });
    }

    private sealed class Factory(IRobixApi api) : IApiFactory { public IRobixApi Create(Uri baseAddress) => api; }
}
