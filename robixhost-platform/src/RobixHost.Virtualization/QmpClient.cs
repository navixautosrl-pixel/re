using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using RobixHost.Core;

namespace RobixHost.Virtualization;

/// <summary>Minimal QEMU Machine Protocol client over a unix socket (one command at a time).</summary>
public sealed class QmpClient : IDisposable
{
    private readonly Socket _sock;
    private readonly NetworkStream _stream;
    private readonly StreamReader _reader;

    private QmpClient(Socket s)
    {
        _sock = s; _stream = new NetworkStream(s, ownsSocket: false);
        _reader = new StreamReader(_stream, new UTF8Encoding(false));
    }

    public static async Task<QmpClient> ConnectAsync(string socketPath, TimeSpan timeout, CancellationToken ct)
    {
        var deadline = DateTime.UtcNow + timeout;
        Exception? last = null;
        while (DateTime.UtcNow < deadline)
        {
            ct.ThrowIfCancellationRequested();
            var s = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified);
            try
            {
                await s.ConnectAsync(new UnixDomainSocketEndPoint(socketPath), ct);
                var c = new QmpClient(s);
                using var greetCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                greetCts.CancelAfter(TimeSpan.FromSeconds(5));
                await c.ReadLineAsync(greetCts.Token);                      // greeting banner
                await c.ExecuteAsync("qmp_capabilities", null, ct);
                return c;
            }
            catch (Exception ex) when (ex is SocketException or IOException or OperationCanceledException && !ct.IsCancellationRequested)
            {
                last = ex; s.Dispose();
                await Task.Delay(150, ct);
            }
        }
        throw new RobixException("provider.qmp_unreachable", $"Could not reach the VM monitor at {socketPath}.", last);
    }

    public async Task<JsonNode?> ExecuteAsync(string command, JsonObject? arguments, CancellationToken ct)
    {
        var req = new JsonObject { ["execute"] = command };
        if (arguments is not null) req["arguments"] = arguments;
        var bytes = Encoding.UTF8.GetBytes(req.ToJsonString() + "\n");
        await _stream.WriteAsync(bytes, ct);
        while (true)
        {
            var line = await ReadLineAsync(ct);
            var node = JsonNode.Parse(line)!;
            if (node["event"] is not null) continue;                         // asynchronous events are ignored here
            if (node["error"] is { } err)
                throw new RobixException("provider.qmp_error", $"{command}: {err["desc"]}");
            return node["return"];
        }
    }

    private async Task<string> ReadLineAsync(CancellationToken ct)
        => await _reader.ReadLineAsync(ct) ?? throw new RobixException("provider.qmp_closed", "The VM monitor closed the connection.");

    public void Dispose() { _reader.Dispose(); _stream.Dispose(); _sock.Dispose(); }
}
