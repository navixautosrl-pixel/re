using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using RobixHost.Core;
using RobixHost.Data;
using RobixHost.Jobs;
using RobixHost.Provisioning;

namespace RobixHost.Whmcs;

/// <summary>
/// Authenticates requests from the WHMCS provisioning module. WHMCS signs "timestamp.nonce.body" with a shared secret
/// (HMAC-SHA256). A payment/order claim is never trusted from the request itself: WHMCS only calls the module after
/// its own billing + fraud checks, and the module's call is what authorizes provisioning here.
/// </summary>
public sealed class WhmcsRequestVerifier(byte[] secret, TimeSpan? maxSkew = null)
{
    private readonly TimeSpan _skew = maxSkew ?? TimeSpan.FromMinutes(5);
    private readonly ConcurrentDictionary<string, DateTimeOffset> _nonces = new();

    public static string Sign(byte[] secret, long timestamp, string nonce, string body)
        => Convert.ToHexString(HMACSHA256.HashData(secret, Encoding.UTF8.GetBytes($"{timestamp}.{nonce}.{body}"))).ToLowerInvariant();

    public bool Verify(string? timestampHeader, string? nonce, string? signature, string body, DateTimeOffset? now = null)
    {
        var t = now ?? DateTimeOffset.UtcNow;
        if (!long.TryParse(timestampHeader, out var ts) || string.IsNullOrEmpty(nonce) || nonce.Length > 64 || string.IsNullOrEmpty(signature)) return false;
        if ((t - DateTimeOffset.FromUnixTimeSeconds(ts)).Duration() > _skew) return false;
        var expected = Encoding.ASCII.GetBytes(Sign(secret, ts, nonce, body));
        if (!CryptographicOperations.FixedTimeEquals(expected, Encoding.ASCII.GetBytes(signature.ToLowerInvariant()))) return false;
        foreach (var k in _nonces.Where(kv => t - kv.Value > _skew * 2).Select(kv => kv.Key).ToList()) _nonces.TryRemove(k, out _);
        return _nonces.TryAdd(nonce, t);   // replay of a captured request is rejected
    }
}

public sealed record WhmcsCreateRequest(string ServiceId, string Hostname, string OsTemplate, int VCpus, int MemoryMb, int DiskGb, long? IpPoolId);
public sealed record WhmcsActionResult(string JobId, bool Created, string State);

/// <summary>Maps WHMCS service IDs to jobs. The idempotency key is the service ID, so repeated "create" calls never create a second VM.</summary>
public sealed class WhmcsGateway(JobRunner jobs, VmRegistry registry, SqliteDb db, Func<string, string?> resolveOsImage)
{
    public WhmcsActionResult Create(WhmcsCreateRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.ServiceId) || r.ServiceId.Length > 40) throw new RobixException("validation.service_id", "Invalid service id.");
        var image = resolveOsImage(r.OsTemplate) ?? throw new RobixException("validation.os", $"Operating system '{r.OsTemplate}' is not mapped to a template.");
        var name = "svc" + new string(r.ServiceId.Where(char.IsAsciiLetterOrDigit).ToArray()).ToLowerInvariant();
        var spec = new VmSpec
        {
            Name = name, Os = r.OsTemplate.StartsWith("win", StringComparison.OrdinalIgnoreCase) ? GuestOs.Windows : GuestOs.Linux,
            VCpus = r.VCpus, MemoryMb = r.MemoryMb, DiskGb = r.DiskGb, BackingImagePath = image,
        };
        var payload = JsonSerializer.Serialize(new ProvisionRequest(spec, r.IpPoolId, r.ServiceId));
        var (job, created) = jobs.Submit(ProvisionVmHandler.JobType, "whmcs", payload, $"whmcs-create-{r.ServiceId}");
        TrackService(r.ServiceId, name, job.State.ToString());
        return new WhmcsActionResult(job.Id, created, job.State.ToString());
    }

    public WhmcsActionResult Suspend(string serviceId) => Lifecycle(serviceId, SuspendVmHandler.JobType, "suspend");
    public WhmcsActionResult Unsuspend(string serviceId) => Lifecycle(serviceId, UnsuspendVmHandler.JobType, "unsuspend");
    public WhmcsActionResult Terminate(string serviceId) => Lifecycle(serviceId, TerminateVmHandler.JobType, "terminate");

    /// <summary>Result for a terminate that has nothing to do: no job is created. JobId is empty by design.</summary>
    public static readonly WhmcsActionResult NothingToTerminate = new("", false, nameof(JobState.Succeeded));

    private WhmcsActionResult Lifecycle(string serviceId, string jobType, string verb)
    {
        var mapped = registry.NameForService(serviceId);
        // Terminate must be IDEMPOTENT and must work for services that never got a VM: a retry after a lost response, or a
        // customer cancelling an order whose provisioning failed, would otherwise leave the WHMCS service stuck forever.
        if (mapped is null && verb == "terminate") return NothingToTerminate;
        var vm = mapped ?? throw new RobixException("notfound.service", $"No VM is mapped to WHMCS service {serviceId}.");
        // Time-bucketed key: a double-clicked button / timeout retry within the same hour collapses to one job,
        // while a legitimate later suspend after an unsuspend still runs.
        var key = $"whmcs-{verb}-{serviceId}-{DateTimeOffset.UtcNow:yyyyMMddHH}";
        var (job, created) = jobs.Submit(jobType, "whmcs", JsonSerializer.Serialize(new VmRefRequest(vm, serviceId)), key);
        TrackService(serviceId, vm, job.State.ToString());
        return new WhmcsActionResult(job.Id, created, job.State.ToString());
    }

    private void TrackService(string serviceId, string vm, string status)
        => db.Exec("INSERT INTO whmcs_services(whmcs_service_id,vm_name,status,updated_at) VALUES(?,NULL,?,?) ON CONFLICT(whmcs_service_id) DO UPDATE SET status=excluded.status, updated_at=excluded.updated_at",
                   serviceId, status, DateTimeOffset.UtcNow);
}
