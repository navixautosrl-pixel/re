using System.Text.Json;
using RobixHost.Auth;
using RobixHost.Core;
using RobixHost.Data;
using RobixHost.Jobs;
using RobixHost.Monitoring;
using RobixHost.Networking;
using RobixHost.Provisioning;
using RobixHost.Whmcs;

namespace RobixHost.Tests;

public static class UnitTests
{
    private static (SqliteDb Db, AuditStore Audit, string Dir) NewDb()
    {
        var dir = TestEnv.NewTempDir();
        var db = new SqliteDb(Path.Combine(dir, "t.db"));
        Migrations.Apply(db);
        return (db, new AuditStore(db), dir);
    }

    public static void Register(Runner r)
    {
        // ---------- data ----------
        r.Add("data", "migrations apply once and are idempotent", () =>
        {
            var (db, _, _) = NewDb();
            Check.Eq(4, (int)db.Scalar("SELECT MAX(version) FROM schema_migrations"), "schema version");
            Check.Eq(4, Migrations.Apply(db), "second apply returns current version");
            Check.Eq(4L, db.Scalar("SELECT COUNT(*) FROM schema_migrations"), "no duplicate rows");
        });
        r.Add("data", "audit redacts secrets before storing", () =>
        {
            var (db, audit, _) = NewDb();
            audit.Write("a", "x", "t", "password=hunter2 token: abc123 \"apiKey\":\"zzz\" ok=1");
            var d = audit.Recent(1)[0].Detail!;
            Check.False(d.Contains("hunter2") || d.Contains("abc123") || d.Contains("zzz"), "secret leaked: " + d);
            Check.True(d.Contains("ok=1"), "non-secret content preserved");
        });

        // ---------- auth ----------
        r.Add("auth", "password hash verifies and rejects wrong password", () =>
        {
            var h = PasswordHasher.Hash("correct horse battery staple");
            Check.True(PasswordHasher.Verify("correct horse battery staple", h), "correct");
            Check.False(PasswordHasher.Verify("wrong", h), "wrong");
            Check.False(h.Contains("correct"), "hash must not contain password");
            Check.False(PasswordHasher.Hash("same") == PasswordHasher.Hash("same"), "salted");
            Check.True(PasswordHasher.PolicyViolation("short") is not null, "policy: short rejected");
        });
        r.Add("auth", "token: valid, tampered, expired, unknown role", () =>
        {
            var ts = new TokenService(new byte[32].Select((_, i) => (byte)(i + 1)).ToArray());
            var t = ts.Issue("alice", Roles.Operator, TimeSpan.FromMinutes(5));
            Check.Eq("alice", ts.Validate(t)?.Subject, "valid token subject");
            var parts = t.Split('.');
            Check.True(ts.Validate(parts[0] + "." + parts[1][..^2] + "AA") is null, "bad signature rejected");
            var forgedPayload = Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(new { sub = "alice", role = "owner", exp = 4102444800L })).TrimEnd('=');
            Check.True(ts.Validate(forgedPayload + "." + parts[1]) is null, "role-escalation forgery rejected");
            Check.True(ts.Validate(t, DateTimeOffset.UtcNow.AddHours(1)) is null, "expired rejected");
            var other = new TokenService(new byte[32]);
            Check.True(other.Validate(t) is null, "token from another installation rejected");
            Check.True(ts.Validate(ts.Issue("x", "root", TimeSpan.FromMinutes(1))) is null, "unknown role rejected");
            Check.True(ts.Validate("garbage") is null && ts.Validate(null) is null && ts.Validate("") is null, "garbage rejected");
        });
        r.Add("auth", "login locks account after 5 failures and audits", () =>
        {
            var (db, audit, _) = NewDb();
            var users = new UserStore(db); users.Create("bob", PasswordHasher.Hash("a-long-password-1"), Roles.Viewer);
            var svc = new LoginService(users, audit, new TokenService(new byte[32]));
            for (var i = 0; i < 5; i++) Check.True(svc.Login("bob", "nope", null) is null, "bad login " + i);
            Check.True(svc.Login("bob", "a-long-password-1", null) is null, "correct password refused while locked");
            Check.True(audit.Recent(50).Any(e => e.Action == "auth.login_blocked"), "block audited");
            Check.True(svc.Login("ghost", "x", null) is null, "unknown user returns null");
        });
        r.Add("auth", "RBAC matrix", () =>
        {
            Check.True(Roles.Has(Roles.Owner, Perm.UserManage), "owner manages users");
            Check.False(Roles.Has(Roles.Operator, Perm.VmDelete), "operator cannot delete");
            Check.False(Roles.Has(Roles.Viewer, Perm.VmCreate), "viewer cannot create");
            Check.False(Roles.Has(Roles.Viewer, Perm.VmPower), "viewer cannot power");
            Check.True(Roles.Has(Roles.WhmcsService, Perm.Provision), "whmcs may provision");
            Check.False(Roles.Has(Roles.WhmcsService, Perm.HostRead), "whmcs cannot browse host");
            Check.False(Roles.Has(Roles.WhmcsService, Perm.VmPower), "whmcs cannot power-control arbitrary VMs");
            Check.False(Roles.Has("nonexistent", Perm.VmRead), "unknown role has nothing");
        });

        // ---------- core validation ----------
        r.Add("core", "VM spec validation rejects unsafe input", () =>
        {
            VmSpec Ok() => new() { Name = "vm-1", Os = GuestOs.Linux };
            Check.Eq(0, VmSpecValidator.Validate(Ok()).Count, "baseline valid");
            foreach (var bad in new[] { "VM1", "-a", "a-", "a b", "a;rm -rf /", "../x", "a/b", "", new string('a', 60), "a\nb" })
                Check.True(VmSpecValidator.Validate(Ok() with { Name = bad }).Count > 0, $"name '{bad.Replace("\n", "\\n")}' must be rejected");
            Check.True(VmSpecValidator.Validate(Ok() with { VCpus = 0 }).Count > 0, "0 vcpu");
            Check.True(VmSpecValidator.Validate(Ok() with { MemoryMb = 1 }).Count > 0, "1MB memory");
            Check.True(VmSpecValidator.Validate(Ok() with { DiskFormat = "vmdk;x" }).Count > 0, "disk format");
            Check.True(VmSpecValidator.Validate(Ok() with { MacAddress = "zz" }).Count > 0, "mac");
            Check.True(VmSpecValidator.Validate(Ok() with { Bridge = "br0;reboot" }).Count > 0, "bridge injection");
            Check.True(VmSpecValidator.Validate(Ok() with { BootIsoPath = "/etc/passwd" }, null, "/srv/images").Count > 0, "iso outside root");
            Check.True(VmSpecValidator.Validate(Ok() with { BootIsoPath = "/srv/images/../../etc/shadow" }, null, "/srv/images").Count > 0, "path traversal");
            Check.Eq(0, VmSpecValidator.Validate(Ok() with { BootIsoPath = "/srv/images/ubuntu.iso" }, null, "/srv/images").Count, "iso inside root ok");
            var host = new HostCapabilities { LogicalCpus = 2, TotalMemoryBytes = 4L << 30 };
            Check.True(VmSpecValidator.Validate(Ok() with { MemoryMb = 8192 }, host).Count > 0, "more memory than host");
        });
        r.Add("core", "PathGuard blocks symlink escape", () =>
        {
            var root = TestEnv.NewTempDir(); var outside = TestEnv.NewTempDir();
            File.WriteAllText(Path.Combine(outside, "secret.iso"), "x");
            File.CreateSymbolicLink(Path.Combine(root, "link.iso"), Path.Combine(outside, "secret.iso"));
            Check.False(PathGuard.IsInside(root, Path.Combine(root, "link.iso")), "symlink to outside rejected");
            File.WriteAllText(Path.Combine(root, "real.iso"), "x");
            Check.True(PathGuard.IsInside(root, Path.Combine(root, "real.iso")), "real file accepted");
            Check.False(PathGuard.IsInside(root, root + "-evil/x"), "prefix-sibling directory rejected");
        });

        // ---------- networking ----------
        r.Add("network", "allocation: sequential, unique, skips network/broadcast/gateway", () =>
        {
            var (db, audit, _) = NewDb(); var ips = new IpPoolService(db, audit);
            var p = ips.CreatePool("p", "192.0.2.0/29", "192.0.2.1", "1.1.1.1", null, "t");
            var got = Enumerable.Range(0, 5).Select(_ => ips.AllocateNext(p.Id, "vm", null, "t").Address).ToList();
            Check.Eq("192.0.2.2,192.0.2.3,192.0.2.4,192.0.2.5,192.0.2.6", string.Join(",", got), "usable range of /29 minus gateway");
            Check.Code("capacity.ip_exhausted", () => ips.AllocateNext(p.Id, "vm", null, "t"), "pool exhausted");
        });
        r.Add("network", "duplicate and out-of-pool allocation refused; release allows reuse; history kept", () =>
        {
            var (db, audit, _) = NewDb(); var ips = new IpPoolService(db, audit);
            var p = ips.CreatePool("p", "198.51.100.0/24", "198.51.100.1", null, null, "t");
            ips.AllocateSpecific(p.Id, "198.51.100.50", "a", null, "t");
            Check.Code("conflict.ip_in_use", () => ips.AllocateSpecific(p.Id, "198.51.100.50", "b", null, "t"), "duplicate");
            Check.Code("validation.address", () => ips.AllocateSpecific(p.Id, "203.0.113.5", "b", null, "t"), "outside pool");
            Check.Code("validation.address", () => ips.AllocateSpecific(p.Id, "198.51.100.1", "b", null, "t"), "gateway");
            Check.Code("validation.address", () => ips.AllocateSpecific(p.Id, "198.51.100.0", "b", null, "t"), "network addr");
            Check.Code("validation.address", () => ips.AllocateSpecific(p.Id, "198.51.100.255", "b", null, "t"), "broadcast");
            Check.True(ips.Release("198.51.100.50", "t"), "release");
            ips.AllocateSpecific(p.Id, "198.51.100.50", "c", null, "t");
            Check.Eq(2, ips.Allocations(p.Id, true).Count(a => a.Address == "198.51.100.50"), "both allocations in history");
            Check.Eq(1, ips.Allocations(p.Id).Count, "only one active");
        });
        r.Add("network", "100 concurrent allocations never duplicate an address", async () =>
        {
            var (db, audit, _) = NewDb(); var ips = new IpPoolService(db, audit);
            var p = ips.CreatePool("p", "10.9.0.0/24", "10.9.0.1", null, null, "t");
            var results = await Task.WhenAll(Enumerable.Range(0, 100).Select(i => Task.Run(() => ips.AllocateNext(p.Id, $"vm{i}", null, "t").Address)));
            Check.Eq(100, results.Distinct().Count(), "all unique");
        });
        r.Add("network", "pool validation + IPv6 rules", () =>
        {
            var (db, audit, _) = NewDb(); var ips = new IpPoolService(db, audit);
            Check.Code("validation.cidr", () => ips.CreatePool("x", "not-a-cidr", null, null, null, "t"), "bad cidr");
            Check.Code("validation.gateway", () => ips.CreatePool("x", "10.0.0.0/24", "10.1.0.1", null, null, "t"), "gateway outside");
            Check.Code("validation.vlan", () => ips.CreatePool("x", "10.0.0.0/24", null, null, 5000, "t"), "vlan range");
            var v6 = ips.CreatePool("v6", "2001:db8::/64", "2001:db8::1", null, null, "t");
            Check.Code("validation.ipv6_sequential", () => ips.AllocateNext(v6.Id, "a", null, "t"), "no sequential v6");
            Check.Eq("2001:db8::10", ips.AllocateSpecific(v6.Id, "2001:db8::10", "a", null, "t").Address, "explicit v6 ok");
            Check.Code("conflict.pool", () => ips.CreatePool("v6", "2001:db8:1::/64", null, null, null, "t"), "duplicate pool name");
        });

        // ---------- jobs ----------
        r.Add("jobs", "idempotency key returns the original job", () =>
        {
            var (db, _, _) = NewDb(); var js = new JobStore(db);
            var (a, c1) = js.Enqueue("t", "u", "{}", "key-1"); var (b, c2) = js.Enqueue("t", "u", "{}", "key-1");
            Check.True(c1 && !c2, "first created, second not"); Check.Eq(a.Id, b.Id, "same job");
            Check.True(js.Enqueue("t", "u", "{}", "key-2").Created, "different key -> new job");
            Check.True(js.Enqueue("other", "u", "{}", "key-1").Created, "key scoped by type");
            Check.True(js.Enqueue("t", "u", "{}", null).Created && js.Enqueue("t", "u", "{}", null).Created, "null keys never collide");
        });
        r.Add("jobs", "runner: success, retry-then-fail, no retry on validation, manual retry, secrets redacted", async () =>
        {
            var (db, audit, _) = NewDb(); var js = new JobStore(db);
            var flaky = new TestHandler("flaky", (ctx, _) => { ctx.Step(50, "half"); if (ctx.Job.Attempts < 2) throw new IOException("transient"); return Task.CompletedTask; });
            var bad = new TestHandler("bad", (_, _) => throw new RobixException("validation.nope", "invalid input password=s3cret"));
            var always = new TestHandler("always", (_, _) => throw new InvalidOperationException("boom"));
            using var runner = new JobRunner(js, [flaky, bad, always], audit);
            runner.Start();
            var j1 = runner.Submit("flaky", "t", null, null).Job.Id; var j2 = runner.Submit("bad", "t", null, null).Job.Id; var j3 = runner.Submit("always", "t", null, null).Job.Id;
            await WaitFor(() => new[] { j1, j2, j3 }.All(i => js.Get(i)!.State is JobState.Succeeded or JobState.Failed));
            Check.Eq(JobState.Succeeded, js.Get(j1)!.State, "flaky succeeds on 2nd attempt"); Check.Eq(2, js.Get(j1)!.Attempts, "attempts");
            Check.Eq(100, js.Get(j1)!.Progress, "progress 100");
            Check.Eq(JobState.Failed, js.Get(j2)!.State, "validation fails"); Check.Eq(1, js.Get(j2)!.Attempts, "validation not retried");
            Check.False(js.Get(j2)!.ErrorDetail!.Contains("s3cret"), "secret redacted from stored error");
            Check.Eq(JobState.Failed, js.Get(j3)!.State, "unhandled fails after max attempts"); Check.Eq(3, js.Get(j3)!.Attempts, "3 attempts");
            Check.True(js.Logs(j3).Any(l => l.Level == "error"), "error logged");
            Check.True(js.Retry(j3), "manual retry accepted"); runner.Notify();
            await WaitFor(() => js.Get(j3)!.Attempts >= 4 && js.Get(j3)!.State == JobState.Failed);
            Check.Eq(4, js.Get(j3)!.Attempts, "manual retry granted exactly one more attempt");
            Check.Code("job.unknown_type", () => runner.Submit("nope", "t", null, null), "unknown type");
        });
        r.Add("jobs", "jobs sharing a concurrency key run one at a time, in submission order; different keys run in parallel", async () =>
        {
            var (db, audit, _) = NewDb(); var js = new JobStore(db);
            var events = new List<string>(); int running = 0, maxOnA = 0;
            void Log(string e) { lock (events) events.Add(e); }
            var handler = new TestHandler("lifecycle", async (ctx, ct) =>
            {
                var tag = ctx.Job.PayloadJson!;
                Log("start-" + tag);
                if (tag[0] == 'A') { var n = Interlocked.Increment(ref running); lock (events) maxOnA = Math.Max(maxOnA, n); }
                await Task.Delay(tag == "A1" ? 700 : 40, ct);          // the FIRST job is the slow one, like a long ACPI shutdown
                if (tag[0] == 'A') Interlocked.Decrement(ref running);
                Log("end-" + tag);
            }, job => "vm:" + job.PayloadJson![0]);
            using var runner = new JobRunner(js, [handler], audit);
            runner.Start();
            var ids = new[] { "A1", "A2", "A3", "B1" }.Select(t => runner.Submit("lifecycle", "t", t, null).Job.Id).ToArray();
            await WaitFor(() => ids.All(i => js.Get(i)!.State is JobState.Succeeded or JobState.Failed), 30);
            Check.True(ids.All(i => js.Get(i)!.State == JobState.Succeeded), "all four succeeded");
            Check.Eq(1, maxOnA, "jobs for the same key never overlapped");
            var aOnly = events.Where(e => e.EndsWith("A1") || e.EndsWith("A2") || e.EndsWith("A3")).ToList();
            Check.Eq("start-A1,end-A1,start-A2,end-A2,start-A3,end-A3", string.Join(",", aOnly), "same-key jobs ran strictly in submission order, slow first job included");
            Check.True(events.IndexOf("start-B1") < events.IndexOf("end-A1"), "a job with a different key started while A1 was still running (no head-of-line blocking)");
        });

        r.Add("jobs", "runner: cancel running job; recover interrupted job after restart", async () =>
        {
            var (db, audit, _) = NewDb(); var js = new JobStore(db);
            var started = new TaskCompletionSource();
            var slow = new TestHandler("slow", async (_, ct) => { started.TrySetResult(); await Task.Delay(TimeSpan.FromSeconds(30), ct); });
            using (var runner = new JobRunner(js, [slow], audit))
            {
                runner.Start();
                var id = runner.Submit("slow", "t", null, null).Job.Id;
                await started.Task.WaitAsync(TimeSpan.FromSeconds(10));
                Check.True(runner.Cancel(id, "t"), "cancel accepted");
                await WaitFor(() => js.Get(id)!.State == JobState.Cancelled);
            }
            var (stuck, _) = js.Enqueue("slow", "t", null, null);
            db.Exec("UPDATE jobs SET state='Running' WHERE id=?", stuck.Id);   // simulates a crash mid-run
            Check.Eq(1, js.RecoverInterrupted(), "one job recovered");
            Check.Eq(JobState.Queued, js.Get(stuck.Id)!.State, "back in queue");
        });

        // ---------- whmcs ----------
        r.Add("whmcs", "request signature: valid, tampered, replay, stale, wrong secret", () =>
        {
            var secret = new byte[32].Select((_, i) => (byte)(i * 7)).ToArray();
            var v = new WhmcsRequestVerifier(secret); var now = DateTimeOffset.UtcNow; var ts = now.ToUnixTimeSeconds();
            const string body = "{\"serviceId\":\"42\"}";
            var sig = WhmcsRequestVerifier.Sign(secret, ts, "n1", body);
            Check.True(v.Verify(ts.ToString(), "n1", sig, body, now), "valid accepted");
            Check.False(v.Verify(ts.ToString(), "n1", sig, body, now), "replayed nonce rejected");
            Check.False(v.Verify(ts.ToString(), "n2", WhmcsRequestVerifier.Sign(secret, ts, "n2", body), body + " ", now), "tampered body rejected");
            Check.False(v.Verify(ts.ToString(), "n3", WhmcsRequestVerifier.Sign(new byte[32], ts, "n3", body), body, now), "wrong secret rejected");
            var old = now.AddMinutes(-30).ToUnixTimeSeconds();
            Check.False(v.Verify(old.ToString(), "n4", WhmcsRequestVerifier.Sign(secret, old, "n4", body), body, now), "stale timestamp rejected");
            Check.False(v.Verify(null, null, null, body, now), "missing headers rejected");
        });

        r.Add("whmcs", "terminate is idempotent and works for services with no VM; suspend of an unknown service still fails", async () =>
        {
            var dir = TestEnv.NewTempDir(); var db = new SqliteDb(Path.Combine(dir, "t.db")); Migrations.Apply(db);
            var audit = new AuditStore(db); var js = new JobStore(db); var reg = new VmRegistry(db);
            using var runner = new JobRunner(js, Array.Empty<IJobHandler>(), audit);
            var gw = new WhmcsGateway(runner, reg, db, _ => null);
            var res = gw.Terminate("never-had-a-vm");
            Check.Eq(nameof(JobState.Succeeded), res.State, "terminate of unmapped service reports success");
            Check.Eq("", res.JobId, "and creates no job");
            Check.Eq(0, js.List().Count, "no job was queued");
            Check.Code("notfound.service", () => gw.Suspend("never-had-a-vm"), "suspend of unmapped service is still an error");
            Check.Code("notfound.service", () => gw.Unsuspend("never-had-a-vm"), "unsuspend of unmapped service is still an error");
            await Task.CompletedTask;
        });

        // ---------- monitoring ----------
        r.Add("monitoring", "host metrics are real measurements", () =>
        {
            var m = new HostMetrics("/");
            var s1 = m.Sample(); Thread.Sleep(300); var s2 = m.Sample();
            Check.True(s1.MemTotalBytes > 0 && s1.MemAvailableBytes > 0 && s1.MemAvailableBytes <= s1.MemTotalBytes, "memory sane");
            Check.True(s1.DiskTotalBytes > 0 && s1.DiskFreeBytes <= s1.DiskTotalBytes, "disk sane");
            Check.True(s1.UptimeSeconds > 0, "uptime");
            Check.True(s1.CpuPercent is null, "first sample has no CPU% (needs a delta) - not invented");
            Check.True(s2.CpuPercent is >= 0 and <= 100, "second sample CPU% in range");
        });
        r.Add("monitoring", "capacity math and overcommit policy", () =>
        {
            var cap = CapacityMath.Compute(4, 8L << 30, [(4, 4096), (4, 2048)]);
            Check.Eq(2.0, cap.CpuOvercommit, "cpu ratio 8/4"); Check.Eq(0.75, cap.MemOvercommit, "mem ratio 6/8");
            Check.True(CapacityMath.CheckPlacement(cap, 8, 512, 2.0, 1.0) is { } msg && msg.Contains("CPU"), "cpu limit enforced");
            Check.True(CapacityMath.CheckPlacement(cap, 0, 4096, 4.0, 1.0)?.Contains("Memory") == true, "memory limit enforced");
            Check.True(CapacityMath.CheckPlacement(cap, 1, 512, 4.0, 1.0) is null, "within policy ok");
        });
    }

    internal static async Task WaitFor(Func<bool> cond, int seconds = 20)
    {
        var end = DateTime.UtcNow.AddSeconds(seconds);
        while (!cond()) { if (DateTime.UtcNow > end) throw new Assertion("timed out waiting for condition"); await Task.Delay(50); }
    }
}

internal sealed class TestHandler(string type, Func<JobContext, CancellationToken, Task> body, Func<JobRecord, string?>? key = null) : IJobHandler
{
    public string Type => type;
    public string? ConcurrencyKey(JobRecord job) => key?.Invoke(job);
    public Task ExecuteAsync(JobContext ctx, CancellationToken ct) => body(ctx, ct);
}
