namespace RobixHost.Client;

/// <summary>
/// A failure the user can be shown. Built from the API's RFC 7807 problem+json (code, detail, requestId) or, for
/// transport failures, from the network error. <see cref="Code"/> is stable and safe to branch on.
/// </summary>
public sealed class ApiException : Exception
{
    public string Code { get; }
    public int Status { get; }
    public string? RequestId { get; }
    public bool IsTransient { get; }

    public ApiException(string code, string message, int status = 0, string? requestId = null, bool isTransient = false, Exception? inner = null)
        : base(message, inner) { Code = code; Status = status; RequestId = requestId; IsTransient = isTransient; }

    public bool IsAuth => Code is "auth.unauthenticated" or "auth.invalid_credentials";
    public bool IsForbidden => Code == "auth.forbidden";

    /// <summary>Message with the request id appended, so an administrator can find the server-side log entry.</summary>
    public string Detailed => RequestId is null ? Message : $"{Message} (request {RequestId})";
}
