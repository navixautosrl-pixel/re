using System.Text.RegularExpressions;
using RobixHost.Client;
using RobixHost.Core;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;
using RobixHost.Desktop.ViewModels;

namespace RobixHost.Tests;

internal sealed class FakeFactory(IRobixApi api) : IApiFactory
{
    public Uri? Created;
    public IRobixApi Create(Uri baseAddress) { Created = baseAddress; return api; }
}

public static class DesktopTests
{
    private static Localizer Loc(Language l = Language.English) => new() { Language = l };

    public static void Register(Runner r)
    {
        // ------------------------------------------------------------ localization & navigation
        r.Add("desktop", "English and Romanian define exactly the same keys, with the same placeholders", () =>
        {
            var en = Strings.En.Keys.ToHashSet(); var ro = Strings.Ro.Keys.ToHashSet();
            Check.True(en.SetEquals(ro), "key parity; only in EN: [" + string.Join(",", en.Except(ro)) + "] only in RO: [" + string.Join(",", ro.Except(en)) + "]");
            foreach (var k in en)
            {
                Check.True(!string.IsNullOrWhiteSpace(Strings.En[k]) && !string.IsNullOrWhiteSpace(Strings.Ro[k]), "non-empty: " + k);
                var ph = new Func<string, string>(s => string.Join(",", Regex.Matches(s, @"\{\d+\}").Select(m => m.Value).OrderBy(x => x)));
                Check.Eq(ph(Strings.En[k]), ph(Strings.Ro[k]), "placeholders match for " + k);
            }
            foreach (var s in Enum.GetNames<VmPowerState>()) Check.True(en.Contains("state." + s), "state label exists: " + s);
            foreach (var n in NavItem.All) Check.True(en.Contains(n.TitleKey), "nav title exists: " + n.Key);
        });

        r.Add("desktop", "navigation has the 19 required sections in order; Localizer switches language and never throws on a missing key", () =>
        {
            Check.Eq(19, NavItem.All.Count, "19 sections");
            Check.Eq("dashboard,vms,createVps,customers,plans,os,templates,storage,networks,ips,servers,backups,monitoring,automation,whmcs,security,audit,settings,diagnostics",
                string.Join(",", NavItem.All.Select(n => n.Key)), "order matches the specification");
            var l = Loc(); var changed = 0; l.LanguageChanged += () => changed++;
            Check.Eq("Dashboard", l["nav.dashboard"], "english"); l.Language = Language.Romanian;
            Check.Eq("Panou de control", l["nav.dashboard"], "romanian"); Check.Eq(1, changed, "change event");
            Check.Eq("no.such.key", l["no.such.key"], "missing key is visible, not a crash");
            Check.Eq("Oprire forțată?", l["confirm.stop.title"], "diacritics preserved");
        });

        // ------------------------------------------------------------ server address
        r.Add("desktop", "server address: https by default; plain http only for loopback/private; no credentials or paths", () =>
        {
            bool Ok(string s, out Uri u) => ServerAddress.TryNormalize(s, out u, out _);
            Check.True(Ok("robix.example.com:8443", out var u1) && u1.ToString() == "https://robix.example.com:8443/", "bare host:port -> https");
            Check.True(Ok("https://h.example.com/", out _), "explicit https");
            foreach (var good in new[] { "http://localhost:5000", "http://127.0.0.1:5000", "http://192.168.1.10:8080", "http://10.0.0.5", "http://172.16.4.4", "http://169.254.1.1", "http://[::1]:5000" })
                Check.True(Ok(good, out _), "http allowed on private/loopback: " + good);
            foreach (var bad in new[] { "http://example.com", "http://8.8.8.8", "http://172.32.0.1", "ftp://x.example.com", "", "   ", "https://user:pw@h.example.com", "https://h.example.com/admin?x=1", "https://" })
                Check.False(Ok(bad, out _), "rejected: '" + bad + "'");
            Check.False(ServerAddress.TryNormalize("", out _, out var key) || key != "login.needServer", "empty gives the 'enter address' message");
        });

        // ------------------------------------------------------------ commands
        r.Add("desktop", "AsyncCommand: no double execution, errors reach the handler instead of crashing, cancellation is not an error", async () =>
        {
            var gate = new TaskCompletionSource(); var runs = 0; Exception? caught = null;
            var cmd = new AsyncCommand(async () => { runs++; await gate.Task; }, onError: e => caught = e);
            var first = cmd.ExecuteAsync(); await cmd.ExecuteAsync();      // second call while running
            Check.Eq(1, runs, "ignored while running"); Check.False(cmd.CanExecute(null), "disabled while running");
            gate.SetResult(); await first; Check.True(cmd.CanExecute(null), "enabled again");

            var bad = new AsyncCommand(() => throw new InvalidOperationException("boom"), onError: e => caught = e);
            await bad.ExecuteAsync(); Check.Eq("boom", caught?.Message, "exception delivered to the handler, not thrown");
            caught = null; var cancelled = new AsyncCommand(ct => Task.Delay(5000, ct), onError: e => caught = e);
            var t = cancelled.ExecuteAsync(); cancelled.Cancel(); await t; Check.True(caught is null, "cancel is not reported as an error");
        });

        // ------------------------------------------------------------ login
        r.Add("desktop", "login: validates before calling the server, shows server errors, always clears the password, raises SignedIn", async () =>
        {
            var api = new FakeApi(); var factory = new FakeFactory(api); var vm = new LoginViewModel(factory, Loc());
            await vm.LoginCommand.ExecuteAsync(); Check.Eq("Enter the server address.", vm.Error, "needs server"); Check.True(factory.Created is null, "no client created");
            vm.Server = "robix.example.com"; await vm.LoginCommand.ExecuteAsync(); Check.Eq("Enter the username and password.", vm.Error, "needs credentials"); Check.Eq(0, api.Calls.Count, "no network call");
            vm.Server = "http://example.com"; vm.Username = "admin"; vm.Password = "x"; await vm.LoginCommand.ExecuteAsync();
            Check.True(vm.Error!.Contains("not valid"), "insecure public http refused: " + vm.Error); Check.Eq(0, api.Calls.Count, "still no call");

            vm.Server = "robix.example.com:8443"; vm.Password = "wrong";
            api.OnLogin = (_, _) => throw new ApiException("auth.invalid_credentials", "Invalid username or password.", 401, "rid-1");
            await vm.LoginCommand.ExecuteAsync();
            Check.True(vm.Error!.Contains("Invalid username or password") && vm.Error.Contains("rid-1"), "server message + request id shown: " + vm.Error); Check.Eq("", vm.Password, "password cleared after failure");

            IRobixApi? got = null; Uri? where = null; vm.SignedIn += (a, u) => { got = a; where = u; };
            api.OnLogin = null; vm.Password = "correct horse battery"; await vm.LoginCommand.ExecuteAsync();
            Check.True(vm.Error is null && ReferenceEquals(got, api), "signed in"); Check.Eq("https://robix.example.com:8443/", where!.ToString(), "normalised address passed on"); Check.Eq("", vm.Password, "password cleared after success");
        });

        // ------------------------------------------------------------ shell
        r.Add("desktop", "shell: built sections get their page, unbuilt ones an honest placeholder; session expiry signs out with a toast", async () =>
        {
            var api = new FakeApi(); var dialogs = new FakeDialogs(); var loc = Loc();
            using var monitor = new ConnectionMonitor(api);
            using var shell = new ShellViewModel(api, loc, dialogs, monitor, item => item.Key == "dashboard" ? new DashboardViewModel(api, loc) : null);
            Check.True(shell.CurrentPage is DashboardViewModel, "starts on the dashboard");
            shell.Selected = NavItem.All.First(n => n.Key == "customers");
            var ph = shell.CurrentPage as PlaceholderViewModel; Check.True(ph is not null, "placeholder for an unbuilt section");
            Check.True(ph!.Body.Contains("Nothing is simulated"), "placeholder says it shows no data"); Check.Eq("Customers", ph.SectionTitle, "title");
            Check.Eq("Connecting…", shell.ConnectionText, "initial connection text");
            await monitor.CheckOnceAsync(); Check.Eq("Connected", shell.ConnectionText, "connected text");
            api.Healthy = false; await monitor.CheckOnceAsync(); Check.Eq("Connection lost, reconnecting…", shell.ConnectionText, "reconnecting text");
            loc.Language = Language.Romanian; Check.Eq("Conexiune pierdută, se reconectează…", shell.ConnectionText, "text follows the language");
            var signedOut = 0; shell.SignedOut += () => signedOut++; api.RaiseSessionExpired();
            Check.Eq(1, signedOut, "signed out"); Check.True(dialogs.Toasts.Any(t => t.Kind == ToastKind.Warning), "user told why");
        });

        // ------------------------------------------------------------ dashboard
        r.Add("desktop", "dashboard: shows measured vs allocated separately, 'n/a' for unmeasured values, real rates from two samples", async () =>
        {
            var t0 = DateTimeOffset.UtcNow; var api = new FakeApi { Host = FakeData.Host(cpu: null, kvm: false, rx: 1_000, tx: 1_000, at: t0) };
            api.Vms = [FakeData.Vm("a"), FakeData.Vm("b", VmPowerState.Stopped), FakeData.Vm("c", VmPowerState.Paused), FakeData.Vm("d")];
            api.Jobs = [new JobRecord { Id = "j1", Type = "vm.provision", RequestedBy = "t", State = JobState.Failed }, new JobRecord { Id = "j2", Type = "vm.provision", RequestedBy = "t", State = JobState.Succeeded }];
            var vm = new DashboardViewModel(api, Loc());
            Check.Eq("n/a", vm.CpuText, "before any data: n/a"); Check.Eq("n/a", vm.AllocatedCpuText, "allocated also n/a");
            await vm.RefreshAsync();
            Check.Eq("n/a", vm.CpuText, "CPU not measurable -> n/a, not 0%"); Check.Eq(0, vm.CpuHistory.Count, "no history point invented");
            Check.Eq("n/a", vm.NetworkInText, "no rate from a single sample");
            Check.Eq("6.0 GB / 16.0 GB", vm.MemoryText, "memory measured"); Check.Eq("300.0 GB / 500.0 GB", vm.StorageText, "storage measured");
            Check.Eq("12 vCPU / 8 CPU  (1.5:1)", vm.AllocatedCpuText, "allocation is promised capacity, shown separately from usage");
            Check.Eq("1d 1h", vm.UptimeText, "uptime");
            Check.Eq(2, vm.RunningCount, "running"); Check.Eq(1, vm.StoppedCount, "stopped"); Check.Eq(1, vm.PausedCount, "paused");
            Check.Eq(1, vm.FailedJobs.Count, "failed jobs surfaced"); Check.Eq(2, vm.RecentJobs.Count, "recent jobs");
            Check.False(vm.AccelerationUsable, "acceleration unusable"); Check.True(vm.HealthSummary.Contains("cannot start"), "health says VMs cannot start: " + vm.HealthSummary);
            Check.True(vm.HealthMessages.Contains("/dev/kvm is missing"), "the host's real error is shown");

            api.Host = FakeData.Host(cpu: 40, kvm: true, rx: 11_000, tx: 6_000, at: t0.AddSeconds(10));
            await vm.RefreshAsync();
            Check.Eq("1000 B/s", vm.NetworkInText, "rate = delta bytes / delta seconds"); Check.Eq("500 B/s", vm.NetworkOutText, "tx rate");
            Check.Eq("40%", vm.CpuText, "cpu"); Check.Eq(1, vm.CpuHistory.Count, "history only holds real samples"); Check.True(vm.AccelerationUsable, "usable now");

            api.Host = FakeData.Host(rx: 5, tx: 5, at: t0.AddSeconds(20)); await vm.RefreshAsync();
            Check.Eq("n/a", vm.NetworkInText, "counter reset (reboot) gives n/a, not a negative rate");
            for (var i = 0; i < 80; i++) { api.Host = FakeData.Host(cpu: i, at: t0.AddSeconds(30 + i)); await vm.RefreshAsync(); }
            Check.Eq(DashboardViewModel.HistoryLength, vm.CpuHistory.Count, "history is bounded");
        });

        r.Add("desktop", "dashboard: a server error is shown, not thrown, and the previous data stays visible", async () =>
        {
            var api = new FakeApi(); var vm = new DashboardViewModel(api, Loc());
            await vm.RefreshCommand.ExecuteAsync(); Check.True(vm.Error is null && vm.Host is not null, "loaded");
            api.FailNext = new ApiException("client.unreachable", "Cannot reach the RobixHost server.", 0, null, true);
            await vm.RefreshCommand.ExecuteAsync();
            Check.Eq("Cannot reach the RobixHost server.", vm.Error, "error surfaced"); Check.True(vm.Host is not null, "last good data retained");
            await vm.RefreshCommand.ExecuteAsync(); Check.True(vm.Error is null, "error clears on recovery");
        });

        // ------------------------------------------------------------ VM list
        r.Add("desktop", "VM list: search, sort, paging, empty state", async () =>
        {
            var api = new FakeApi(); var vm = new VmListViewModel(api, Loc(), new FakeDialogs(), pageSize: 3);
            Check.False(vm.IsEmpty, "not 'empty' before the first load (it is loading)");
            await vm.RefreshAsync(); Check.True(vm.IsEmpty, "empty after load");
            api.Vms = [.. Enumerable.Range(1, 7).Select(i => FakeData.Vm($"vm{i}", i % 2 == 0 ? VmPowerState.Stopped : VmPowerState.Running, cpu: 8 - i))];
            await vm.RefreshAsync();
            Check.Eq(7, vm.Total, "total"); Check.Eq(3, vm.Items.Count, "first page"); Check.Eq(3, vm.PageCount, "3 pages");
            Check.Eq("vm1,vm2,vm3", string.Join(",", vm.Items.Select(i => i.Name)), "sorted by name");
            await vm.NextPageCommand.ExecuteAsync(); Check.Eq("vm4,vm5,vm6", string.Join(",", vm.Items.Select(i => i.Name)), "page 2");
            await vm.NextPageCommand.ExecuteAsync(); await vm.NextPageCommand.ExecuteAsync(); Check.Eq("vm7", string.Join(",", vm.Items.Select(i => i.Name)), "last page; cannot go past it");
            vm.SortBy(VmSortColumn.VCpus); vm.PageIndex = 0; Check.Eq("vm7,vm6,vm5", string.Join(",", vm.Items.Select(i => i.Name)), "sorted by vCPU ascending");
            vm.SortBy(VmSortColumn.VCpus); Check.Eq("vm1,vm2,vm3", string.Join(",", vm.Items.Select(i => i.Name)), "second click reverses");
            vm.Search = "VM5"; Check.Eq("vm5", string.Join(",", vm.Items.Select(i => i.Name)), "case-insensitive search; back on page 1"); Check.Eq(1, vm.PageCount, "paging follows the filter");
            vm.Search = "stopped"; Check.Eq(3, vm.FilteredTotal, "search also matches state");
        });

        r.Add("desktop", "VM list: actions are only enabled in valid states", async () =>
        {
            var api = new FakeApi { Vms = [FakeData.Vm("run"), FakeData.Vm("stop", VmPowerState.Stopped), FakeData.Vm("pau", VmPowerState.Paused)] };
            var vm = new VmListViewModel(api, Loc(), new FakeDialogs()); await vm.RefreshAsync();
            var run = vm.Items.First(i => i.Name == "run"); var stop = vm.Items.First(i => i.Name == "stop"); var pau = vm.Items.First(i => i.Name == "pau");
            Check.True(!run.StartCommand.CanExecute(null) && run.ShutdownCommand.CanExecute(null) && run.PauseCommand.CanExecute(null) && run.StopCommand.CanExecute(null), "running VM");
            Check.True(stop.StartCommand.CanExecute(null) && !stop.ShutdownCommand.CanExecute(null) && !stop.StopCommand.CanExecute(null) && !stop.PauseCommand.CanExecute(null), "stopped VM");
            Check.True(pau.ResumeCommand.CanExecute(null) && pau.StopCommand.CanExecute(null) && !pau.PauseCommand.CanExecute(null), "paused VM");
        });

        r.Add("desktop", "VM list: force stop needs confirmation (declined = nothing sent); success updates the row", async () =>
        {
            var api = new FakeApi { Vms = [FakeData.Vm("web")] }; var dialogs = new FakeDialogs { ConfirmAnswer = false };
            var vm = new VmListViewModel(api, Loc(), dialogs); await vm.RefreshAsync(); var row = vm.Items[0];
            await row.StopCommand.ExecuteAsync();
            Check.False(api.Calls.Any(c => c.StartsWith("power:")), "declined: the server was never contacted"); Check.Eq(VmPowerState.Running, row.State, "unchanged");
            Check.True(dialogs.Asked.Contains("confirm:Force stop?"), "the user was asked");
            dialogs.ConfirmAnswer = true; await row.StopCommand.ExecuteAsync();
            Check.True(api.Calls.Contains("power:web:Stop"), "confirmed: sent"); Check.Eq(VmPowerState.Stopped, row.State, "row shows the state the server confirmed");
            Check.True(dialogs.Toasts.Any(t => t.Kind == ToastKind.Success), "success toast"); Check.False(row.IsBusy, "busy cleared");
            await row.StartCommand.ExecuteAsync(); Check.Eq(VmPowerState.Running, row.State, "start (no confirmation needed)");
            Check.Eq(2, dialogs.Asked.Count(a => a.StartsWith("confirm:")), "force stop was asked about twice (declined, then confirmed); start never asks");
        });

        r.Add("desktop", "VM list: server failure -> error toast with request id; the row recovers (no crash, not stuck busy)", async () =>
        {
            var api = new FakeApi { Vms = [FakeData.Vm("web")] }; var dialogs = new FakeDialogs();
            var vm = new VmListViewModel(api, Loc(), dialogs); await vm.RefreshAsync(); var row = vm.Items[0];
            api.FailNext = new ApiException("vm.shutdown_timeout", "The guest did not shut down within 60s. Use force stop if appropriate.", 502, "rid-42");
            await row.ShutdownCommand.ExecuteAsync();
            var toast = dialogs.Toasts.Last(); Check.Eq(ToastKind.Error, toast.Kind, "error toast");
            Check.True(toast.Message.Contains("did not shut down") && toast.Message.Contains("rid-42"), "real reason and request id shown: " + toast.Message);
            Check.Eq(VmPowerState.Running, row.State, "state NOT changed on failure"); Check.False(row.IsBusy, "not stuck busy"); Check.True(row.ShutdownCommand.CanExecute(null), "can try again");
        });

        r.Add("desktop", "terminate/purge safeguards: running VM needs the name typed; purge needs the exact name; wrong text sends nothing", async () =>
        {
            var api = new FakeApi { Vms = [FakeData.Vm("live"), FakeData.Vm("idle", VmPowerState.Stopped)], Retained = [new RetainedVm("old", DateTimeOffset.UtcNow, 5_000_000)] };
            var dialogs = new FakeDialogs(); var vm = new VmListViewModel(api, Loc(), dialogs); await vm.RefreshAsync();
            Check.Eq(1, vm.Retained.Count, "retained data is listed so it can be managed");
            var live = vm.Items.First(i => i.Name == "live"); var idle = vm.Items.First(i => i.Name == "idle");

            dialogs.TypedText = "nope"; await live.TerminateCommand.ExecuteAsync();
            Check.False(api.Calls.Any(c => c.StartsWith("terminate:")), "wrong typed name: nothing sent"); Check.Contains(dialogs.Asked, "type:Terminate VM?", "running VM uses type-to-confirm");
            dialogs.TypedText = "live"; await live.TerminateCommand.ExecuteAsync(); Check.True(api.Calls.Contains("terminate:live"), "typed name: sent");

            dialogs.ConfirmAnswer = false; await idle.TerminateCommand.ExecuteAsync();
            Check.False(api.Calls.Contains("terminate:idle"), "stopped VM: plain confirmation declined -> nothing sent");
            dialogs.ConfirmAnswer = true; await idle.TerminateCommand.ExecuteAsync(); Check.True(api.Calls.Contains("terminate:idle"), "confirmed -> sent");

            var old = vm.Retained[0];
            dialogs.TypedText = "OLD"; await vm.PurgeAsync(old); Check.True(api.LastPurge is null, "case mismatch: nothing sent"); Check.Eq(1, vm.Retained.Count, "still listed");
            dialogs.TypedText = "old"; await vm.PurgeAsync(old);
            Check.Eq(("old", "old"), api.LastPurge, "exact name sent as the confirmation"); Check.Eq(0, vm.Retained.Count, "removed from the list");
        });

        // ------------------------------------------------------------ wizard
        r.Add("desktop", "wizard: validates against the host, needs an explicit confirmation, resets it when the config is edited", async () =>
        {
            var api = new FakeApi { Pools = [new IpPool(1, "lab", "192.0.2.0/28", "192.0.2.1", null, null)] };
            var vm = new CreateVpsViewModel(api, Loc(), new FakeDialogs(), (_, _) => Task.CompletedTask); await vm.LoadAsync();
            Check.Eq(1, vm.Pools.Count, "pools loaded");
            vm.Name = "Bad Name!"; await vm.NextCommand.ExecuteAsync();
            Check.Eq(WizardStep.Details, vm.Step, "invalid name blocks the step"); Check.True(vm.Errors.Any(e => e.StartsWith("name")), "reason shown");
            vm.Name = "web-01"; vm.MemoryMb = 99_999_999; await vm.NextCommand.ExecuteAsync(); Check.Eq(WizardStep.Details, vm.Step, "memory above the host's total is refused locally");
            Check.True(vm.Errors.Any(e => e.Contains("larger than total host memory")), "uses the host's REAL memory: " + string.Join(";", vm.Errors));
            vm.MemoryMb = 2048; vm.VCpus = 2; await vm.NextCommand.ExecuteAsync(); Check.Eq(WizardStep.Network, vm.Step, "valid -> next");
            vm.SelectedPool = vm.Pools[0]; await vm.NextCommand.ExecuteAsync(); Check.Eq(WizardStep.Review, vm.Step, "review");
            Check.False(vm.DeployCommand.CanExecute(null), "cannot deploy before confirming");
            await vm.DeployCommand.ExecuteAsync(); Check.False(api.Calls.Contains("provision"), "nothing sent without confirmation");
            vm.IsConfirmed = true; Check.True(vm.DeployCommand.CanExecute(null), "enabled after explicit confirmation");
            await vm.BackCommand.ExecuteAsync(); Check.False(vm.IsConfirmed, "going back revokes the confirmation");
            vm.Os = GuestOs.Windows; Check.True(vm.ShowWindowsLicenceNotice, "Windows shows the licence notice");
        });

        r.Add("desktop", "wizard: deploys, follows the real job, and reports success", async () =>
        {
            var api = new FakeApi(); var dialogs = new FakeDialogs(); var polls = 0;
            api.OnGetJob = _ => ++polls switch
            {
                1 => FakeData.Job("job-1", JobState.Running, 40, "Creating VM and disk", logs: "Creating VM and disk"),
                _ => FakeData.Job("job-1", JobState.Succeeded, 100, "Provisioned web-01 (Running), IP 192.0.2.2", logs: ["Allocating", "Provisioned"]),
            };
            var vm = new CreateVpsViewModel(api, Loc(), dialogs, (_, _) => Task.CompletedTask); await vm.LoadAsync();
            vm.Name = "web-01"; await vm.NextCommand.ExecuteAsync(); await vm.NextCommand.ExecuteAsync(); vm.IsConfirmed = true;
            await vm.DeployCommand.ExecuteAsync();
            Check.Eq(WizardStep.Deploy, vm.Step, "on the deployment step"); Check.Eq(JobState.Succeeded, vm.JobState, "job state is the server's"); Check.True(vm.Completed, "completed");
            Check.Eq(100, vm.Progress, "progress from the job"); Check.Eq(2, vm.LogLines.Count, "job log shown"); Check.Eq("web-01", api.LastProvision!.Spec.Name, "the configured spec was sent");
            Check.False(string.IsNullOrEmpty(api.LastProvisionKey), "an idempotency key was sent"); Check.True(dialogs.Toasts.Any(t => t.Kind == ToastKind.Success), "success toast");
        });

        r.Add("desktop", "wizard: a failed job shows the real code and failing step; Retry resumes the SAME job", async () =>
        {
            var api = new FakeApi(); var dialogs = new FakeDialogs();
            api.OnGetJob = _ => FakeData.Job("job-1", JobState.Failed, 70, "Starting VM", "provider.no_kvm", "Hardware virtualization (KVM) is not usable on this host.");
            var vm = new CreateVpsViewModel(api, Loc(), dialogs, (_, _) => Task.CompletedTask); await vm.LoadAsync();
            vm.Name = "web-02"; await vm.NextCommand.ExecuteAsync(); await vm.NextCommand.ExecuteAsync(); vm.IsConfirmed = true;
            await vm.DeployCommand.ExecuteAsync();
            Check.Eq(JobState.Failed, vm.JobState, "failed"); Check.False(vm.Completed, "not completed"); Check.Eq("provider.no_kvm", vm.FailureCode, "real error code");
            Check.True(vm.FailureDetail!.Contains("Starting VM") && vm.FailureDetail.Contains("KVM"), "failing step + reason: " + vm.FailureDetail);
            Check.True(vm.RetryCommand.CanExecute(null), "retry offered");
            api.OnGetJob = _ => api.Calls.Contains("retry:job-1") ? FakeData.Job("job-1", JobState.Succeeded, 100, "done") : FakeData.Job("job-1", JobState.Failed, 70, "Starting VM", "provider.no_kvm", "x");
            await vm.RetryCommand.ExecuteAsync();
            Check.True(api.Calls.Contains("retry:job-1"), "retried the same job id (no second VM)"); Check.Eq(1, api.Calls.Count(c => c == "provision"), "provision was NOT submitted again");
            Check.True(vm.Completed && vm.FailureCode is null, "completed after retry; failure cleared");
        });

        r.Add("desktop", "wizard: Back is only offered from Deployment once the job is final; a changed request gets a NEW idempotency key", async () =>
        {
            var api = new FakeApi(); var keys = new List<string>(); var running = true;
            api.OnProvision = (_, k) => { keys.Add(k); return new SubmitResult("j" + keys.Count, true, JobState.Queued); };
            api.OnGetJob = id => FakeData.Job(id, running ? JobState.Running : JobState.Succeeded, running ? 50 : 100);
            var vm = new CreateVpsViewModel(api, Loc(), new FakeDialogs(), async (_, _) => { running = false; await Task.Yield(); }); await vm.LoadAsync();
            vm.Name = "a1"; await vm.NextCommand.ExecuteAsync(); await vm.NextCommand.ExecuteAsync(); vm.IsConfirmed = true;
            var deploy = vm.DeployCommand.ExecuteAsync();
            Check.False(vm.BackCommand.CanExecute(null) && vm.JobState == JobState.Running, "no Back while the job is still running (would orphan it)");
            await deploy;
            Check.Eq(1, keys.Count, "one provision"); Check.True(vm.Completed, "first VPS done"); Check.True(vm.BackCommand.CanExecute(null), "Back offered after the job is final");

            await vm.BackCommand.ExecuteAsync();
            Check.Eq(WizardStep.Review, vm.Step, "back to review"); Check.False(vm.IsConfirmed, "confirmation revoked"); Check.False(vm.Completed, "outcome reset"); Check.True(vm.JobState is null, "job state cleared");
            await vm.BackCommand.ExecuteAsync(); await vm.BackCommand.ExecuteAsync(); Check.Eq(WizardStep.Details, vm.Step, "all the way back to details");

            vm.Name = "a2"; running = true; await vm.NextCommand.ExecuteAsync(); await vm.NextCommand.ExecuteAsync(); vm.IsConfirmed = true; await vm.DeployCommand.ExecuteAsync();
            Check.Eq(2, keys.Count, "second provision"); Check.True(keys[0] != keys[1], "a different request must not reuse the previous idempotency key");
            Check.Eq("a2", api.LastProvision!.Spec.Name, "the edited spec was sent");
        });
    }
}

