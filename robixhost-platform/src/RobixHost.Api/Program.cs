using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;
using RobixHost.Api;
using RobixHost.Auth;
using RobixHost.Core;
using RobixHost.Data;
using RobixHost.Jobs;
using RobixHost.Monitoring;
using RobixHost.Networking;
using RobixHost.Provisioning;
using RobixHost.Storage;
using RobixHost.Virtualization;
using RobixHost.Whmcs;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration.GetSection("RobixHost");
var dataDir = Path.GetFullPath(cfg["DataDir"] ?? "./data");
Directory.CreateDirectory(Path.Combine(dataDir, "secrets"));

var db = new SqliteDb(Path.Combine(dataDir, "robixhost.db"));
Migrations.Apply(db);
var audit = new AuditStore(db);
var users = new UserStore(db);
var tokens = new TokenService(TokenService.LoadOrCreateKey(Path.Combine(dataDir, "secrets", "token.key")));
var whmcsSecretPath = Path.Combine(dataDir, "secrets", "whmcs.secret");
var whmcsSecret = TokenService.LoadOrCreateKey(whmcsSecretPath);
Bootstrap.EnsureAdmin(users, audit, dataDir, cfg["BootstrapAdminPassword"]);

var provider = new QemuKvmProvider(new QemuOptions
{
    VmRoot = cfg["VmRoot"] ?? Path.Combine(dataDir, "vms"),
    ImageRoot = cfg["ImageRoot"] ?? Path.Combine(dataDir, "images"),
    AllowSoftwareEmulation = cfg.GetValue("AllowSoftwareEmulation", false),
});
var ips = new IpPoolService(db, audit);
var registry = new VmRegistry(db);
var jobStore = new JobStore(db);
var imageRoot = cfg["ImageRoot"] ?? Path.Combine(dataDir, "images");
Directory.CreateDirectory(imageRoot);
var runner = new JobRunner(jobStore, new IJobHandler[]
{
    new ProvisionVmHandler(provider, ips, registry), new SuspendVmHandler(provider, registry, TimeSpan.FromSeconds(cfg.GetValue("SuspendGracefulSeconds", 30))),
    new UnsuspendVmHandler(provider, registry), new TerminateVmHandler(provider, registry, ips),
}, audit, m => Console.WriteLine($"[jobs] {m}"));
var whmcs = new WhmcsGateway(runner, registry, db, os =>
{
    // OS templates are files in <ImageRoot>/templates named <key>.qcow2 ; the key is validated (no path separators).
    if (!System.Text.RegularExpressions.Regex.IsMatch(os, "^[a-zA-Z0-9._-]{1,64}$")) return null;
    var p = Path.Combine(imageRoot, "templates", os + ".qcow2");
    return File.Exists(p) ? p : null;
});
var verifier = new WhmcsRequestVerifier(whmcsSecret);
var login = new LoginService(users, audit, tokens);
var metrics = new HostMetrics(dataDir);

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.AddPolicy("login", ctx => RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString() ?? "?",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
});
builder.Services.ConfigureHttpJsonOptions(o => { o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; o.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()); });

var app = builder.Build();
app.UseRateLimiter();
runner.Start();
app.Lifetime.ApplicationStopping.Register(() => { runner.Dispose(); db.Dispose(); });

// ---- cross-cutting: request id, security headers, structured errors ----
app.Use(async (ctx, next) =>
{
    var rid = ctx.Request.Headers["X-Request-Id"].FirstOrDefault();
    if (rid is null || rid.Length > 64 || !rid.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_')) rid = Guid.NewGuid().ToString("N");
    ctx.Items["rid"] = rid; ctx.Response.Headers["X-Request-Id"] = rid;
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff"; ctx.Response.Headers["Cache-Control"] = "no-store";
    try { await next(); }
    catch (RobixException ex) { await Problem.Write(ctx, Problem.StatusFor(ex.Code), ex.Code, ex.Message); }
    catch (BadHttpRequestException) { await Problem.Write(ctx, 400, "validation.body", "Malformed request body."); }
    catch (JsonException) { await Problem.Write(ctx, 400, "validation.body", "Malformed JSON."); }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[error] rid={rid} {ex}");
        await Problem.Write(ctx, 500, "internal", "An internal error occurred. Quote the request id to the administrator.");
    }
});

TokenClaims Require(HttpContext ctx, string perm)
{
    var h = ctx.Request.Headers.Authorization.ToString();
    var claims = h.StartsWith("Bearer ", StringComparison.Ordinal) ? tokens.Validate(h[7..]) : null;
    if (claims is null) throw new RobixException("auth.unauthenticated", "Authentication required.");
    if (!Roles.Has(claims.Role, perm))
    {
        audit.Write(claims.Subject, "auth.denied", ctx.Request.Path, perm, (string?)ctx.Items["rid"]);
        throw new RobixException("auth.forbidden", "You do not have permission to perform this action.");
    }
    ctx.Items["actor"] = claims.Subject;
    return claims;
}
string Rid(HttpContext c) => (string?)c.Items["rid"] ?? "";

// ---- public ----
app.MapGet("/health", () => Results.Ok(new { status = "ok", version = "0.1.0" }));
app.MapPost("/api/v1/auth/login", (HttpContext ctx, LoginRequest r) =>
{
    var t = login.Login(r.Username ?? "", r.Password ?? "", Rid(ctx));
    return t is null ? throw new RobixException("auth.invalid_credentials", "Invalid username or password.") : Results.Ok(new { token = t, tokenType = "Bearer", expiresInSeconds = 8 * 3600 });
}).RequireRateLimiting("login");

// ---- host ----
app.MapGet("/api/v1/host", async (HttpContext ctx, CancellationToken ct) =>
{
    Require(ctx, Perm.HostRead);
    var caps = await provider.DetectCapabilitiesAsync(ct);
    var vms = await provider.ListAsync(ct);
    var cap = CapacityMath.Compute(caps.LogicalCpus, caps.TotalMemoryBytes, vms.Select(v => (v.VCpus, v.MemoryMb)));
    return Results.Ok(new { provider = provider.Name, capabilities = caps, measured = metrics.Sample(), allocated = cap });
});

// ---- VMs ----
app.MapGet("/api/v1/vms", async (HttpContext ctx, CancellationToken ct, int limit = 50, int offset = 0) =>
{
    Require(ctx, Perm.VmRead);
    var all = await provider.ListAsync(ct);   // state comes from the hypervisor, not from the database
    return Results.Ok(new { total = all.Count, items = all.Skip(Math.Max(0, offset)).Take(Math.Clamp(limit, 1, 200)) });
});
app.MapGet("/api/v1/vms/{name}", async (HttpContext ctx, string name, CancellationToken ct) =>
{
    Require(ctx, Perm.VmRead);
    return await provider.GetAsync(name, ct) is { } vm ? Results.Ok(vm) : throw new RobixException("notfound.vm", $"VM '{name}' does not exist.");
});
app.MapPost("/api/v1/vms", (HttpContext ctx, ProvisionRequest r) =>
{
    var c = Require(ctx, Perm.VmCreate);
    var key = ctx.Request.Headers["Idempotency-Key"].FirstOrDefault();
    var (job, created) = runner.Submit(ProvisionVmHandler.JobType, c.Subject, JsonSerializer.Serialize(r), key);
    return Results.Json(new { jobId = job.Id, created, state = job.State }, statusCode: created ? 202 : 200);
});
app.MapDelete("/api/v1/vms/{name}", (HttpContext ctx, string name) =>
{
    var c = Require(ctx, Perm.VmDelete);
    var (job, created) = runner.Submit(TerminateVmHandler.JobType, c.Subject, JsonSerializer.Serialize(new VmRefRequest(name, null)), null);
    return Results.Json(new { jobId = job.Id, created }, statusCode: 202);
});
// Terminated VMs whose disks still occupy storage. Without this list, retained data would be invisible and unmanageable.
app.MapGet("/api/v1/retained-vms", async (HttpContext ctx, CancellationToken ct) => { Require(ctx, Perm.VmRead); return Results.Ok(await provider.ListRetainedAsync(ct)); });
// Irreversible: destroys the retained disks of a terminated VM. Requires typing the VM name (enforced by the provider too).
app.MapPost("/api/v1/vms/{name}/purge", async (HttpContext ctx, string name, PurgeRequest r, CancellationToken ct) =>
{
    var c = Require(ctx, Perm.VmDelete);
    audit.Write(c.Subject, "vm.purge", name, r.ConfirmName == name ? "confirmed" : "confirmation mismatch", Rid(ctx));
    await provider.PurgeRetainedAsync(name, r.ConfirmName ?? "", ct);
    return Results.NoContent();
});
foreach (var action in new[] { "start", "shutdown", "stop", "pause", "resume" })
    app.MapPost($"/api/v1/vms/{{name}}/{action}", async (HttpContext ctx, string name, CancellationToken ct) =>
    {
        var c = Require(ctx, Perm.VmPower);
        if (action == "start" && registry.IsSuspended(name)) throw new RobixException("conflict.vm_suspended", "VM is suspended for billing reasons.");
        audit.Write(c.Subject, $"vm.{action}", name, null, Rid(ctx));
        var vm = action switch
        {
            "start" => await provider.StartAsync(name, ct),
            "shutdown" => await provider.ShutdownAsync(name, TimeSpan.FromSeconds(60), ct),
            "stop" => await provider.ForceStopAsync(name, ct),
            "pause" => await provider.PauseAsync(name, ct),
            _ => await provider.ResumeAsync(name, ct),
        };
        return Results.Ok(vm);   // returned only after the provider confirmed the new state
    });

// ---- storage: virtual capacity vs real consumption, measured with qemu-img ----
var storageInspector = new StorageInspector(cfg["VmRoot"] ?? Path.Combine(dataDir, "vms"));
app.MapGet("/api/v1/storage", async (HttpContext ctx, CancellationToken ct) => { Require(ctx, Perm.HostRead); return Results.Ok(await storageInspector.InspectAsync(ct)); });

// ---- jobs ----
app.MapGet("/api/v1/jobs", (HttpContext ctx, string? state, int limit = 50, int offset = 0) =>
{
    Require(ctx, Perm.JobRead);
    JobState? st = Enum.TryParse<JobState>(state, true, out var s) ? s : null;
    return Results.Ok(jobStore.List(st, limit, offset));
});
app.MapGet("/api/v1/jobs/{id}", (HttpContext ctx, string id) =>
{
    Require(ctx, Perm.JobRead);
    var j = jobStore.Get(id) ?? throw new RobixException("notfound.job", "Job not found.");
    return Results.Ok(new { job = j, logs = jobStore.Logs(id).Select(l => new { at = l.At, level = l.Level, message = l.Message }) });
});
app.MapPost("/api/v1/jobs/{id}/cancel", (HttpContext ctx, string id) => { var c = Require(ctx, Perm.VmCreate); return runner.Cancel(id, c.Subject) ? Results.Accepted() : throw new RobixException("conflict.job_state", "Job is not cancellable."); });
app.MapPost("/api/v1/jobs/{id}/retry", (HttpContext ctx, string id) =>
{
    var c = Require(ctx, Perm.VmCreate);
    if (!jobStore.Retry(id)) throw new RobixException("conflict.job_state", "Only failed jobs can be retried.");
    audit.Write(c.Subject, "job.retry", id); runner.Notify(); return Results.Accepted();
});

// ---- IP pools ----
app.MapGet("/api/v1/ip-pools", (HttpContext ctx) => { Require(ctx, Perm.IpManage); return Results.Ok(ips.ListPools()); });
app.MapPost("/api/v1/ip-pools", (HttpContext ctx, PoolRequest r) => { var c = Require(ctx, Perm.IpManage); return Results.Ok(ips.CreatePool(r.Name, r.Cidr, r.Gateway, r.Dns, r.Vlan, c.Subject)); });
app.MapGet("/api/v1/ip-pools/{id:long}/allocations", (HttpContext ctx, long id, bool history = false) => { Require(ctx, Perm.IpManage); return Results.Ok(ips.Allocations(id, history)); });
app.MapPost("/api/v1/ip-pools/{id:long}/allocate", (HttpContext ctx, long id, AllocateRequest r) =>
{
    var c = Require(ctx, Perm.IpManage);
    return Results.Ok(r.Address is null ? ips.AllocateNext(id, r.VmName, r.ServiceId, c.Subject) : ips.AllocateSpecific(id, r.Address, r.VmName, r.ServiceId, c.Subject));
});
app.MapPost("/api/v1/ip-allocations/release", (HttpContext ctx, ReleaseRequest r) => { var c = Require(ctx, Perm.IpManage); return ips.Release(r.Address, c.Subject) ? Results.NoContent() : throw new RobixException("notfound.allocation", "No active allocation for that address."); });

// ---- audit ----
app.MapGet("/api/v1/audit", (HttpContext ctx, int limit = 100, int offset = 0, string? actor = null) => { Require(ctx, Perm.AuditRead); return Results.Ok(audit.Recent(limit, offset, actor)); });

// ---- WHMCS (machine-to-machine; HMAC-signed, separate from admin tokens, limited to provisioning) ----
async Task<(string Body, T Req)> ReadSigned<T>(HttpContext ctx)
{
    using var reader = new StreamReader(ctx.Request.Body, Encoding.UTF8);
    var body = await reader.ReadToEndAsync();
    if (body.Length > 16_384) throw new RobixException("validation.body", "Request too large.");
    var h = ctx.Request.Headers;
    if (!verifier.Verify(h["X-Robix-Timestamp"], h["X-Robix-Nonce"], h["X-Robix-Signature"], body))
    {
        audit.Write("whmcs", "whmcs.rejected", ctx.Request.Path, "signature/timestamp/nonce invalid", Rid(ctx));
        throw new RobixException("auth.unauthenticated", "Request signature is invalid.");
    }
    return (body, JsonSerializer.Deserialize<T>(body, new JsonSerializerOptions(JsonSerializerDefaults.Web))!);
}
app.MapPost("/api/v1/whmcs/create", async (HttpContext ctx) => { var (_, r) = await ReadSigned<WhmcsCreateRequest>(ctx); audit.Write("whmcs", "whmcs.create", r.ServiceId, null, Rid(ctx)); return Results.Json(whmcs.Create(r), statusCode: 202); });
foreach (var verb in new[] { "suspend", "unsuspend", "terminate" })
    app.MapPost($"/api/v1/whmcs/{verb}", async (HttpContext ctx) =>
    {
        var (_, r) = await ReadSigned<WhmcsServiceRef>(ctx);
        audit.Write("whmcs", $"whmcs.{verb}", r.ServiceId, null, Rid(ctx));
        return Results.Json(verb switch { "suspend" => whmcs.Suspend(r.ServiceId), "unsuspend" => whmcs.Unsuspend(r.ServiceId), _ => whmcs.Terminate(r.ServiceId) }, statusCode: 202);
    });
// Manual / scheduled synchronisation: reports what the HYPERVISOR says right now (not what our database remembers).
app.MapPost("/api/v1/whmcs/service", async (HttpContext ctx, CancellationToken ct) =>
{
    var (_, r) = await ReadSigned<WhmcsServiceRef>(ctx);
    var vm = registry.NameForService(r.ServiceId) ?? throw new RobixException("notfound.service", $"No VM is mapped to WHMCS service {r.ServiceId}.");
    var info = await provider.GetAsync(vm, ct);
    return Results.Ok(new
    {
        serviceId = r.ServiceId, vmName = vm,
        powerState = info?.State.ToString() ?? "Missing",     // "Missing" = recorded in the database but absent from the hypervisor
        suspended = registry.IsSuspended(vm),
        ipAddresses = ips.AddressesForVm(vm),
    });
});
app.MapPost("/api/v1/whmcs/status", async (HttpContext ctx) =>
{
    var (_, r) = await ReadSigned<WhmcsJobRef>(ctx);
    var j = jobStore.Get(r.JobId) ?? throw new RobixException("notfound.job", "Job not found.");
    if (j.RequestedBy != "whmcs") throw new RobixException("auth.forbidden", "Job does not belong to the billing integration.");
    return Results.Ok(new { jobId = j.Id, state = j.State, progress = j.Progress, step = j.CurrentStep, error = j.ErrorCode });
});

app.Run();

namespace RobixHost.Api
{
    public sealed record LoginRequest(string? Username, string? Password);
    public sealed record PoolRequest(string Name, string Cidr, string? Gateway, string? Dns, int? Vlan);
    public sealed record AllocateRequest(string? Address, string? VmName, string? ServiceId);
    public sealed record ReleaseRequest(string Address);
    public sealed record PurgeRequest(string? ConfirmName);
    public sealed record WhmcsServiceRef(string ServiceId);
    public sealed record WhmcsJobRef(string JobId);

    public static class Problem
    {
        public static int StatusFor(string code) => code.Split('.')[0] switch
        {
            "validation" => 400, "auth" when code == "auth.forbidden" => 403, "auth" => 401, "notfound" => 404,
            "conflict" or "capacity" => 409, "provider" or "vm" => 502, _ => 500,
        };
        public static async Task Write(HttpContext ctx, int status, string code, string message)
        {
            if (ctx.Response.HasStarted) return;
            ctx.Response.StatusCode = status; ctx.Response.ContentType = "application/problem+json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { type = $"https://robixhost.local/errors/{code}", title = code, status, detail = message, requestId = ctx.Items["rid"] }));
        }
    }

    public static class Bootstrap
    {
        /// <summary>Creates the first owner. The password is never logged: it comes from config, or is generated into a 0600 file.</summary>
        public static void EnsureAdmin(UserStore users, AuditStore audit, string dataDir, string? configured)
        {
            if (users.Count() > 0) return;
            var pw = configured;
            if (string.IsNullOrEmpty(pw))
            {
                pw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(18)).Replace('+', 'x').Replace('/', 'y');
                var path = Path.Combine(dataDir, "secrets", "initial-admin.txt");
                File.WriteAllText(path, $"username: admin\npassword: {pw}\n(delete this file after the first login and change the password)\n");
                if (!OperatingSystem.IsWindows()) File.SetUnixFileMode(path, UnixFileMode.UserRead | UnixFileMode.UserWrite);
                Console.WriteLine($"[bootstrap] initial admin credentials written to {path}");
            }
            else if (PasswordHasher.PolicyViolation(pw) is { } v) throw new InvalidOperationException("BootstrapAdminPassword: " + v);
            users.Create("admin", PasswordHasher.Hash(pw), Roles.Owner);
            audit.Write("system", "user.bootstrap", "admin");
        }
    }
}
