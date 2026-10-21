using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using RobixHost.Core;
using RobixHost.Data;

namespace RobixHost.Auth;

public static class PasswordHasher
{
    private const int Iterations = 310_000, SaltBytes = 16, HashBytes = 32;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltBytes);
        var h = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, HashBytes);
        return $"pbkdf2-sha256${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(h)}";
    }

    public static bool Verify(string password, string stored)
    {
        var p = stored.Split('$');
        if (p.Length != 4 || p[0] != "pbkdf2-sha256" || !int.TryParse(p[1], out var it)) return false;
        var salt = Convert.FromBase64String(p[2]); var expected = Convert.FromBase64String(p[3]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, it, HashAlgorithmName.SHA256, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    public static string? PolicyViolation(string password)
        => password.Length < 12 ? "Password must be at least 12 characters." : null;
}

public sealed record TokenClaims(string Subject, string Role, DateTimeOffset ExpiresAt);

/// <summary>Compact HMAC-SHA256 signed bearer tokens. The signing key is generated per installation and never shipped in the client.</summary>
public sealed class TokenService(byte[] key)
{
    public static byte[] LoadOrCreateKey(string path)
    {
        if (File.Exists(path)) return Convert.FromBase64String(File.ReadAllText(path).Trim());
        var k = RandomNumberGenerator.GetBytes(32);
        Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path))!);
        File.WriteAllText(path, Convert.ToBase64String(k));
        if (!OperatingSystem.IsWindows()) File.SetUnixFileMode(path, UnixFileMode.UserRead | UnixFileMode.UserWrite);
        return k;
    }

    public string Issue(string subject, string role, TimeSpan lifetime, DateTimeOffset? now = null)
    {
        var payload = JsonSerializer.SerializeToUtf8Bytes(new { sub = subject, role, exp = (now ?? DateTimeOffset.UtcNow).Add(lifetime).ToUnixTimeSeconds() });
        var p = B64(payload);
        return $"{p}.{B64(Sign(p))}";
    }

    public TokenClaims? Validate(string? token, DateTimeOffset? now = null)
    {
        if (string.IsNullOrEmpty(token)) return null;
        var parts = token.Split('.');
        if (parts.Length != 2) return null;
        try
        {
            if (!CryptographicOperations.FixedTimeEquals(Sign(parts[0]), FromB64(parts[1]))) return null;
            using var doc = JsonDocument.Parse(FromB64(parts[0]));
            var r = doc.RootElement;
            var exp = DateTimeOffset.FromUnixTimeSeconds(r.GetProperty("exp").GetInt64());
            if (exp <= (now ?? DateTimeOffset.UtcNow)) return null;
            var role = r.GetProperty("role").GetString()!;
            return Roles.IsKnown(role) ? new TokenClaims(r.GetProperty("sub").GetString()!, role, exp) : null;
        }
        catch { return null; }
    }

    private byte[] Sign(string p) => HMACSHA256.HashData(key, Encoding.ASCII.GetBytes(p));
    private static string B64(byte[] b) => Convert.ToBase64String(b).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    private static byte[] FromB64(string s)
    {
        s = s.Replace('-', '+').Replace('_', '/');
        return Convert.FromBase64String(s.PadRight(s.Length + (4 - s.Length % 4) % 4, '='));
    }
}

public sealed class LoginService(UserStore users, AuditStore audit, TokenService tokens)
{
    private const int LockAfter = 5;
    private static readonly TimeSpan LockFor = TimeSpan.FromMinutes(15);
    // Verified against when the user does not exist, so timing does not reveal valid usernames.
    private static readonly string DummyHash = PasswordHasher.Hash("dummy-password-for-timing");

    public string? Login(string username, string password, string? requestId)
    {
        var u = users.Find(username);
        if (u is null) { PasswordHasher.Verify(password, DummyHash); audit.Write(username, "auth.login_failed", null, "unknown user", requestId); return null; }
        if (u.Disabled || (u.LockedUntil is { } l && l > DateTimeOffset.UtcNow))
        {
            audit.Write(username, "auth.login_blocked", null, u.Disabled ? "disabled" : "locked", requestId);
            return null;
        }
        if (!PasswordHasher.Verify(password, u.PasswordHash))
        {
            users.RegisterFailure(u.Id, LockAfter, LockFor);
            audit.Write(username, "auth.login_failed", null, "bad password", requestId);
            return null;
        }
        users.RegisterSuccess(u.Id);
        audit.Write(username, "auth.login", null, null, requestId);
        return tokens.Issue(u.Username, u.Role, TimeSpan.FromHours(8));
    }
}
