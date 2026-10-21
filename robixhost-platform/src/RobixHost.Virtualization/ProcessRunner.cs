using System.Diagnostics;
using RobixHost.Core;

namespace RobixHost.Virtualization;

public static class ProcessRunner
{
    /// <summary>Runs an executable with an argument vector (never through a shell, so no injection via arguments).</summary>
    public static async Task<(int ExitCode, string Stdout, string Stderr)> RunAsync(string file, IEnumerable<string> args, TimeSpan timeout, CancellationToken ct)
    {
        var psi = new ProcessStartInfo(file) { RedirectStandardOutput = true, RedirectStandardError = true, UseShellExecute = false };
        foreach (var a in args) psi.ArgumentList.Add(a);
        Process p;
        try { p = Process.Start(psi) ?? throw new RobixException("provider.exec", $"Could not start {file}."); }
        catch (System.ComponentModel.Win32Exception ex) { throw new RobixException("provider.exec_missing", $"Executable '{file}' was not found or is not executable.", ex); }
        using (p)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(timeout);
            var so = p.StandardOutput.ReadToEndAsync(cts.Token);
            var se = p.StandardError.ReadToEndAsync(cts.Token);
            try { await p.WaitForExitAsync(cts.Token); }
            catch (OperationCanceledException) { try { p.Kill(true); } catch { } throw; }
            return (p.ExitCode, await so, await se);
        }
    }
}
