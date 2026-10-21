using System.Net;
using System.Net.Sockets;

namespace RobixHost.Desktop.Services;

/// <summary>
/// Validates the server address typed on the sign-in screen. The administrator's password and token travel over this
/// connection, so plain HTTP is accepted only for loopback and private-network addresses (lab / LAN / VPN).
/// </summary>
public static class ServerAddress
{
    /// <returns>true with a normalised base URI, or false with a localization key describing the problem.</returns>
    public static bool TryNormalize(string? input, out Uri uri, out string errorKey)
    {
        uri = null!;
        var text = (input ?? "").Trim();
        if (text.Length == 0) { errorKey = "login.needServer"; return false; }
        if (!text.Contains("://", StringComparison.Ordinal)) text = "https://" + text;
        if (!Uri.TryCreate(text, UriKind.Absolute, out var u) || (u.Scheme != Uri.UriSchemeHttps && u.Scheme != Uri.UriSchemeHttp)
            || string.IsNullOrEmpty(u.Host) || u.UserInfo.Length > 0 || (u.AbsolutePath != "/" && u.AbsolutePath.Length > 0) || u.Query.Length > 0)
        { errorKey = "login.badServer"; return false; }
        if (u.Scheme == Uri.UriSchemeHttp && !IsLoopbackOrPrivate(u.Host)) { errorKey = "login.badServer"; return false; }
        uri = new Uri(u.GetLeftPart(UriPartial.Authority) + "/");
        errorKey = "";
        return true;
    }

    public static bool IsLoopbackOrPrivate(string host)
    {
        if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase)) return true;
        if (!IPAddress.TryParse(host.Trim('[', ']'), out var ip)) return false;   // a DNS name is never assumed private
        if (IPAddress.IsLoopback(ip)) return true;
        if (ip.AddressFamily == AddressFamily.InterNetworkV6) return ip.IsIPv6LinkLocal || ip.IsIPv6UniqueLocal;
        var b = ip.GetAddressBytes();
        return b[0] == 10 || (b[0] == 172 && b[1] is >= 16 and <= 31) || (b[0] == 192 && b[1] == 168) || (b[0] == 169 && b[1] == 254);
    }
}
