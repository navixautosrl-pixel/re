using System.Net;
using System.Text;
using RobixHost.Client;
using RobixHost.Core;

namespace RobixHost.Tests;

internal sealed class ScriptedHandler(Func<HttpRequestMessage, int, Task<HttpResponseMessage>> script) : HttpMessageHandler
{
    public List<HttpRequestMessage> Requests { get; } = new();
    public List<string?> Bodies { get; } = new();
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Requests.Add(request); Bodies.Add(request.Content is null ? null : await request.Content.ReadAsStringAsync(ct));
        return await script(request, Requests.Count);
    }
    public static HttpResponseMessage Json(HttpStatusCode code, string body) => new(code) { Content = new StringContent(body, Encoding.UTF8, code >= HttpStatusCode.BadRequest ? "application/problem+json" : "application/json") };
}

public static class ClientTests
{
    private static (RobixApiClient Api, ScriptedHandler H) Make(Func<HttpRequestMessage, int, Task<HttpResponseMessage>> script, ClientOptions? o = null, bool signedIn = true)
    {
        var h = new ScriptedHandler(script);
        var api = new RobixApiClient(new HttpClient(h) { BaseAddress = new Uri("https://robix.test/") }, o ?? new ClientOptions { Backoff = _ => TimeSpan.Zero });
        if (signedIn) api.LoginAsync("u", "p").GetAwaiter().GetResult();
        return (api, h);
    }

    private static Func<HttpRequestMessage, int, Task<HttpResponseMessage>> WithLogin(Func<HttpRequestMessage, int, Task<HttpResponseMessage>> next)
        => (req, n) => req.RequestUri!.AbsolutePath.EndsWith("auth/login")
            ? Task.FromResult(ScriptedHandler.Json(HttpStatusCode.OK, """{"token":"T0K","tokenType":"Bearer","expiresInSeconds":3600}"""))
            : next(req, n);

    private const string VmsJson = """{"total":1,"items":[{"name":"a","state":"Running","vCpus":2,"memoryMb":512,"pid":7,"provider":"QEMU/KVM"}]}""";

    public static void Register(Runner r)
    {
        r.Add("client", "GET is retried on 503 and then succeeds; bearer token is sent", async () =>
        {
            var seen = 0;
            var (api, h) = Make(WithLogin((req, _) => Task.FromResult(++seen < 3 ? ScriptedHandler.Json(HttpStatusCode.ServiceUnavailable, "<html>down</html>") : ScriptedHandler.Json(HttpStatusCode.OK, VmsJson))));
            var page = await api.ListVmsAsync();
            Check.Eq("a", page.Items[0].Name, "payload deserialised (string enums, camelCase)"); Check.Eq(VmPowerState.Running, page.Items[0].State, "enum parsed");
            Check.Eq(4, h.Requests.Count, "login + 3 attempts"); Check.Eq("Bearer T0K", h.Requests[^1].Headers.Authorization!.ToString(), "token sent");
        });

        r.Add("client", "POST/DELETE without an idempotency key are NEVER retried", async () =>
        {
            var (api, h) = Make(WithLogin((_, _) => Task.FromResult(ScriptedHandler.Json(HttpStatusCode.ServiceUnavailable, "{}"))));
            var ex = await Assert<ApiException>(() => api.PowerAsync("a", VmPowerAction.Start));
            Check.True(ex.IsTransient, "reported as transient"); Check.Eq(2, h.Requests.Count, "login + exactly one attempt: a lost response must not repeat an action");
            h.Requests.Clear();
            await Assert<ApiException>(() => api.TerminateAsync("a")); Check.Eq(1, h.Requests.Count, "terminate not retried");
        });

        r.Add("client", "provision carries the idempotency key and may be retried safely", async () =>
        {
            var (api, h) = Make(WithLogin((_, n) => Task.FromResult(n < 3 ? ScriptedHandler.Json(HttpStatusCode.GatewayTimeout, "") : ScriptedHandler.Json(HttpStatusCode.Accepted, """{"jobId":"j1","created":true,"state":"Queued"}"""))));
            var res = await api.ProvisionAsync(new ProvisionRequest(new VmSpec { Name = "x", Os = GuestOs.Linux }, null, null), "key-1");
            Check.Eq("j1", res.JobId, "result"); Check.Eq(3, h.Requests.Count, "login + 2 attempts");
            Check.True(h.Requests.Skip(1).All(q => q.Headers.GetValues("Idempotency-Key").Single() == "key-1"), "same key on every attempt");
            Check.True(h.Bodies[1]!.Contains("\"os\":\"Linux\""), "enum written as string: " + h.Bodies[1]);
            await Assert<ArgumentException>(() => api.ProvisionAsync(new ProvisionRequest(new VmSpec { Name = "x", Os = GuestOs.Linux }, null, null), " "));
        });

        r.Add("client", "502 WITH a problem body is a real answer (not retried); 502 without one is a proxy error (retried)", async () =>
        {
            var (api, h) = Make(WithLogin((_, _) => Task.FromResult(ScriptedHandler.Json(HttpStatusCode.BadGateway,
                """{"type":"x","title":"provider.no_kvm","status":502,"detail":"KVM is not usable","requestId":"rid-9"}"""))));
            var ex = await Assert<ApiException>(() => api.ListVmsAsync());
            Check.Eq("provider.no_kvm", ex.Code, "code parsed"); Check.Eq("rid-9", ex.RequestId, "request id kept"); Check.False(ex.IsTransient, "not transient");
            Check.Eq(2, h.Requests.Count, "login + one attempt"); Check.True(ex.Detailed.Contains("rid-9"), "request id in the displayed message");

            var (api2, h2) = Make(WithLogin((_, _) => Task.FromResult(ScriptedHandler.Json(HttpStatusCode.BadGateway, "<html>Bad gateway</html>"))));
            await Assert<ApiException>(() => api2.ListVmsAsync()); Check.Eq(4, h2.Requests.Count, "login + 3 attempts for a proxy 502");
        });

        r.Add("client", "401 clears the token, raises SessionExpired, and later calls do not touch the network", async () =>
        {
            var (api, h) = Make(WithLogin((_, _) => Task.FromResult(ScriptedHandler.Json(HttpStatusCode.Unauthorized, """{"title":"auth.unauthenticated","detail":"Authentication required.","status":401}"""))));
            var expired = 0; api.SessionExpired += () => expired++;
            var ex = await Assert<ApiException>(() => api.GetHostAsync());
            Check.True(ex.IsAuth, "auth error"); Check.Eq(1, expired, "event raised once"); Check.False(api.IsSignedIn, "token dropped");
            var before = h.Requests.Count;
            var ex2 = await Assert<ApiException>(() => api.GetHostAsync());
            Check.Eq("auth.unauthenticated", ex2.Code, "fails locally"); Check.Eq(before, h.Requests.Count, "no request sent when signed out");
        });

        r.Add("client", "a failed login is invalid_credentials and is not retried; transport failures are explained", async () =>
        {
            var (api, h) = Make((_, _) => Task.FromResult(ScriptedHandler.Json(HttpStatusCode.Unauthorized, """{"title":"auth.invalid_credentials","detail":"Invalid username or password.","status":401}""")), signedIn: false);
            var ex = await Assert<ApiException>(() => api.LoginAsync("u", "bad"));
            Check.Eq("auth.invalid_credentials", ex.Code, "code"); Check.Eq(1, h.Requests.Count, "no retry"); Check.False(api.IsSignedIn, "not signed in");

            var (api2, _) = Make(WithLogin((_, _) => throw new HttpRequestException("connection refused")));
            var ex2 = await Assert<ApiException>(() => api2.GetHostAsync());
            Check.Eq("client.unreachable", ex2.Code, "unreachable"); Check.True(ex2.Message.Contains("Check the address"), "actionable text: " + ex2.Message);

            var (api3, _) = Make(WithLogin(async (_, _) => { await Task.Delay(2000); return ScriptedHandler.Json(HttpStatusCode.OK, "{}"); }),
                new ClientOptions { ReadTimeout = TimeSpan.FromMilliseconds(80), MaxAttempts = 1 });
            var ex3 = await Assert<ApiException>(() => api3.GetHostAsync());
            Check.Eq("client.timeout", ex3.Code, "timeout");
        });

        r.Add("client", "cancellation by the caller is not turned into a timeout or retried", async () =>
        {
            var (api, h) = Make(WithLogin(async (_, _) => { await Task.Delay(5000); return ScriptedHandler.Json(HttpStatusCode.OK, "{}"); }));
            using var cts = new CancellationTokenSource(100);
            try { await api.ListVmsAsync(ct: cts.Token); throw new Assertion("should have been cancelled"); } catch (OperationCanceledException) { }
            Check.Eq(2, h.Requests.Count, "login + one attempt");
        });

        r.Add("client", "purge sends the typed confirmation; unreadable responses give a clear version-mismatch error", async () =>
        {
            var (api, h) = Make(WithLogin((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.NoContent))));
            await api.PurgeAsync("vm1", "vm1");
            Check.True(h.Requests[^1].RequestUri!.AbsolutePath == "/api/v1/vms/vm1/purge" && h.Bodies[^1] == """{"confirmName":"vm1"}""", "route and body: " + h.Bodies[^1]);
            var (api2, _) = Make(WithLogin((_, _) => Task.FromResult(ScriptedHandler.Json(HttpStatusCode.OK, "{ not json"))));
            var ex = await Assert<ApiException>(() => api2.GetHostAsync()); Check.Eq("client.bad_response", ex.Code, "bad json");
        });

        r.Add("client", "connection monitor reports only real state changes and recovers by itself", async () =>
        {
            var fake = new FakeApi(); var changes = new List<ConnectionState>();
            using var m = new ConnectionMonitor(fake); m.StateChanged += changes.Add;
            await m.CheckOnceAsync(); await m.CheckOnceAsync();
            Check.Eq(1, changes.Count, "two healthy probes -> one event"); Check.Eq(ConnectionState.Connected, m.State, "connected");
            fake.Healthy = false; await m.CheckOnceAsync(); await m.CheckOnceAsync(); await m.CheckOnceAsync();
            Check.Eq(ConnectionState.Reconnecting, m.State, "reconnecting"); Check.Eq(3, m.ConsecutiveFailures, "failures counted"); Check.Eq(2, changes.Count, "one event for the whole outage");
            fake.Healthy = true; await m.CheckOnceAsync();
            Check.Eq(ConnectionState.Connected, m.State, "recovered without user action"); Check.Eq(0, m.ConsecutiveFailures, "counter reset"); Check.Eq(3, changes.Count, "recovery event");
        });

        r.Add("client", "background monitor loop survives probe failures", async () =>
        {
            var fake = new FakeApi { Healthy = false };
            using var m = new ConnectionMonitor(fake, TimeSpan.FromMilliseconds(30)); m.Start();
            await UnitTests.WaitFor(() => m.State == ConnectionState.Reconnecting, 5);
            fake.Healthy = true; await UnitTests.WaitFor(() => m.State == ConnectionState.Connected, 5);
        });
    }

    internal static async Task<T> Assert<T>(Func<Task> act) where T : Exception
    {
        try { await act(); }
        catch (T ex) { return ex; }
        throw new Assertion($"expected {typeof(T).Name} but nothing was thrown");
    }
}
