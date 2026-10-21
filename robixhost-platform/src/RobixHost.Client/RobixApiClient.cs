using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using RobixHost.Core;
using RobixHost.Storage;

namespace RobixHost.Client;

public sealed class ClientOptions
{
    /// <summary>Per-request time budget for reads.</summary>
    public TimeSpan ReadTimeout { get; init; } = TimeSpan.FromSeconds(20);
    /// <summary>Per-request time budget for actions. Power operations wait for the hypervisor (a graceful shutdown can take ~60s).</summary>
    public TimeSpan ActionTimeout { get; init; } = TimeSpan.FromSeconds(100);
    public int MaxAttempts { get; init; } = 3;
    /// <summary>Delay before retry n (1-based). Injectable so tests do not sleep.</summary>
    public Func<int, TimeSpan> Backoff { get; init; } = n => TimeSpan.FromMilliseconds(300 * Math.Pow(3, n - 1));
}

/// <summary>
/// HTTP client for the RobixHost admin API.
///
/// Retry policy (deliberately narrow): only requests that are safe to repeat are retried, and only on TRANSIENT failures.
///  - GET requests, and POSTs that carry an Idempotency-Key, are retried on network errors, timeouts and 503/504.
///  - Other POST/DELETE are never retried automatically: a lost response must not turn into a second action.
///  - 502 is retried only when it has no problem+json body (a proxy error). The API itself uses 502 for deterministic
///    hypervisor failures (e.g. provider.no_kvm), which must be shown to the user, not retried.
/// The bearer token is held in memory only. Persisting it is the host application's decision (e.g. Windows DPAPI).
/// </summary>
public sealed class RobixApiClient : IRobixApi, IDisposable
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly HttpClient _http;
    private readonly ClientOptions _opt;
    private string? _token;

    public event Action? SessionExpired;
    public bool IsSignedIn => _token is not null;

    public RobixApiClient(HttpClient http, ClientOptions? options = null)
    {
        _http = http;
        _opt = options ?? new ClientOptions();
        if (_http.BaseAddress is null) throw new ArgumentException("HttpClient.BaseAddress must be set.", nameof(http));
        _http.Timeout = Timeout.InfiniteTimeSpan;   // per-request budgets are applied below
    }

    // ---------------- session ----------------
    public async Task<LoginResult> LoginAsync(string username, string password, CancellationToken ct = default)
    {
        var r = await SendAsync<LoginResult>(HttpMethod.Post, "api/v1/auth/login", new { username, password }, authenticated: false, retryable: false, ct);
        _token = r.Token;
        return r;
    }

    public void SignOut() => _token = null;

    public async Task<bool> IsHealthyAsync(CancellationToken ct = default)
    {
        try { await SendAsync<JsonElement>(HttpMethod.Get, "health", null, authenticated: false, retryable: false, ct); return true; }
        catch (ApiException) { return false; }
    }

    // ---------------- reads ----------------
    public Task<HostInfo> GetHostAsync(CancellationToken ct = default) => Get<HostInfo>("api/v1/host", ct);

    public Task<StorageReport> GetStorageAsync(CancellationToken ct = default) => Get<StorageReport>("api/v1/storage", ct);

    public Task<PagedResult<VmInfo>> ListVmsAsync(int limit = 50, int offset = 0, CancellationToken ct = default)
        => Get<PagedResult<VmInfo>>($"api/v1/vms?limit={limit}&offset={offset}", ct);

    public Task<VmInfo> GetVmAsync(string name, CancellationToken ct = default) => Get<VmInfo>($"api/v1/vms/{Uri.EscapeDataString(name)}", ct);

    public Task<IReadOnlyList<JobRecord>> ListJobsAsync(JobState? state = null, int limit = 50, int offset = 0, CancellationToken ct = default)
        => Get<IReadOnlyList<JobRecord>>($"api/v1/jobs?limit={limit}&offset={offset}" + (state is null ? "" : $"&state={state}"), ct);

    public Task<IReadOnlyList<RetainedVm>> ListRetainedAsync(CancellationToken ct = default) => Get<IReadOnlyList<RetainedVm>>("api/v1/retained-vms", ct);

    public Task<JobDetail> GetJobAsync(string id, CancellationToken ct = default) => Get<JobDetail>($"api/v1/jobs/{Uri.EscapeDataString(id)}", ct);

    public Task<IReadOnlyList<IpPool>> ListIpPoolsAsync(CancellationToken ct = default) => Get<IReadOnlyList<IpPool>>("api/v1/ip-pools", ct);

    public Task<IReadOnlyList<IpAllocation>> ListAllocationsAsync(long poolId, bool includeHistory = false, CancellationToken ct = default)
        => Get<IReadOnlyList<IpAllocation>>($"api/v1/ip-pools/{poolId}/allocations?history={(includeHistory ? "true" : "false")}", ct);

    public Task<IReadOnlyList<AuditEvent>> ListAuditAsync(int limit = 100, int offset = 0, string? actor = null, CancellationToken ct = default)
        => Get<IReadOnlyList<AuditEvent>>($"api/v1/audit?limit={limit}&offset={offset}" + (actor is null ? "" : $"&actor={Uri.EscapeDataString(actor)}"), ct);

    // ---------------- actions ----------------
    public Task<VmInfo> PowerAsync(string name, VmPowerAction action, CancellationToken ct = default)
        => SendAsync<VmInfo>(HttpMethod.Post, $"api/v1/vms/{Uri.EscapeDataString(name)}/{action.ToString().ToLowerInvariant()}", null, true, false, ct);

    public Task<SubmitResult> ProvisionAsync(ProvisionRequest request, string idempotencyKey, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey)) throw new ArgumentException("An idempotency key is required so retries cannot create duplicate VMs.", nameof(idempotencyKey));
        return SendAsync<SubmitResult>(HttpMethod.Post, "api/v1/vms", request, true, retryable: true, ct, idempotencyKey);
    }

    public Task<SubmitResult> TerminateAsync(string name, CancellationToken ct = default)
        => SendAsync<SubmitResult>(HttpMethod.Delete, $"api/v1/vms/{Uri.EscapeDataString(name)}", null, true, false, ct);

    public Task PurgeAsync(string name, string confirmName, CancellationToken ct = default)
        => SendAsync<JsonElement?>(HttpMethod.Post, $"api/v1/vms/{Uri.EscapeDataString(name)}/purge", new { confirmName }, true, false, ct);

    public Task CancelJobAsync(string id, CancellationToken ct = default)
        => SendAsync<JsonElement?>(HttpMethod.Post, $"api/v1/jobs/{Uri.EscapeDataString(id)}/cancel", null, true, false, ct);

    public Task RetryJobAsync(string id, CancellationToken ct = default)
        => SendAsync<JsonElement?>(HttpMethod.Post, $"api/v1/jobs/{Uri.EscapeDataString(id)}/retry", null, true, false, ct);

    public Task<IpPool> CreateIpPoolAsync(string name, string cidr, string? gateway, string? dns, int? vlan, CancellationToken ct = default)
        => SendAsync<IpPool>(HttpMethod.Post, "api/v1/ip-pools", new { name, cidr, gateway, dns, vlan }, true, false, ct);

    // ---------------- plumbing ----------------
    private Task<T> Get<T>(string path, CancellationToken ct) => SendAsync<T>(HttpMethod.Get, path, null, true, true, ct);

    private async Task<T> SendAsync<T>(HttpMethod method, string path, object? body, bool authenticated, bool retryable, CancellationToken ct, string? idempotencyKey = null)
    {
        if (authenticated && _token is null) throw new ApiException("auth.unauthenticated", "You are not signed in.", 401);
        var timeout = method == HttpMethod.Get ? _opt.ReadTimeout : _opt.ActionTimeout;
        ApiException? last = null;

        for (var attempt = 1; attempt <= (retryable ? _opt.MaxAttempts : 1); attempt++)
        {
            if (attempt > 1) await Task.Delay(_opt.Backoff(attempt - 1), ct);
            using var req = new HttpRequestMessage(method, path);
            if (authenticated) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            if (idempotencyKey is not null) req.Headers.TryAddWithoutValidation("Idempotency-Key", idempotencyKey);
            if (body is not null) req.Content = new StringContent(JsonSerializer.Serialize(body, Json), Encoding.UTF8, "application/json");

            using var budget = CancellationTokenSource.CreateLinkedTokenSource(ct);
            budget.CancelAfter(timeout);
            try
            {
                using var resp = await _http.SendAsync(req, HttpCompletionOption.ResponseContentRead, budget.Token);
                var text = await resp.Content.ReadAsStringAsync(budget.Token);
                if (resp.IsSuccessStatusCode)
                {
                    if (string.IsNullOrWhiteSpace(text)) return default!;
                    return JsonSerializer.Deserialize<T>(text, Json)
                           ?? throw new ApiException("client.empty_response", "The server returned an empty response.", (int)resp.StatusCode);
                }
                last = ToException(resp.StatusCode, text);
                if (last.IsAuth && authenticated) { _token = null; SessionExpired?.Invoke(); }
                if (!last.IsTransient) throw last;
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            {
                last = new ApiException("client.timeout", $"The server did not answer within {timeout.TotalSeconds:0} seconds.", 0, null, true);
            }
            catch (HttpRequestException ex)
            {
                last = new ApiException("client.unreachable", "Cannot reach the RobixHost server. Check the address, your network and that the service is running.", 0, null, true, ex);
            }
            catch (JsonException ex)
            {
                throw new ApiException("client.bad_response", "The server returned a response this version of the Control Center cannot read. Check that client and server versions match.", 0, null, false, ex);
            }
        }
        throw last!;
    }

    private static ApiException ToException(HttpStatusCode status, string body)
    {
        string? code = null, detail = null, rid = null;
        try
        {
            using var doc = JsonDocument.Parse(body);
            var r = doc.RootElement;
            if (r.ValueKind == JsonValueKind.Object)
            {
                code = r.TryGetProperty("title", out var t) ? t.GetString() : null;
                detail = r.TryGetProperty("detail", out var d) ? d.GetString() : null;
                rid = r.TryGetProperty("requestId", out var q) ? q.GetString() : null;
            }
        }
        catch (JsonException) { /* not problem+json: a proxy or gateway answered */ }

        var s = (int)status;
        var hasProblem = code is not null;
        var transient = s is 503 or 504 || (s == 502 && !hasProblem);
        code ??= s switch { 401 => "auth.unauthenticated", 403 => "auth.forbidden", 404 => "notfound", 429 => "client.rate_limited", >= 500 => "client.server_error", _ => "client.http_" + s };
        detail ??= s switch
        {
            401 => "Authentication required.", 403 => "You do not have permission to do that.", 404 => "Not found.",
            429 => "Too many attempts. Wait a minute and try again.", >= 500 => "The server is temporarily unavailable.", _ => $"HTTP {s}",
        };
        return new ApiException(code, detail, s, rid, transient);
    }

    public void Dispose() => _http.Dispose();
}
