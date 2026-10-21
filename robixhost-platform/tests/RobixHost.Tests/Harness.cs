using System.Diagnostics;

namespace RobixHost.Tests;

public sealed class Assertion(string message) : Exception(message);

public static class Check
{
    public static void True(bool cond, string what) { if (!cond) throw new Assertion($"expected true: {what}"); }
    public static void False(bool cond, string what) { if (cond) throw new Assertion($"expected false: {what}"); }
    public static void Eq<T>(T expected, T actual, string what)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual)) throw new Assertion($"{what}: expected <{expected}> but was <{actual}>");
    }
    public static void Contains<T>(IEnumerable<T> items, T expected, string what)
    {
        if (!items.Contains(expected)) throw new Assertion($"{what}: <{expected}> not found in [{string.Join(", ", items)}]");
    }
    public static void Code(string expected, Action act, string what)
    {
        try { act(); }
        catch (RobixHost.Core.RobixException ex) { Eq(expected, ex.Code, what + " (error code)"); return; }
        throw new Assertion($"{what}: expected RobixException '{expected}' but nothing was thrown");
    }
    public static async Task CodeAsync(string expected, Func<Task> act, string what)
    {
        try { await act(); }
        catch (RobixHost.Core.RobixException ex) { Eq(expected, ex.Code, what + " (error code)"); return; }
        throw new Assertion($"{what}: expected RobixException '{expected}' but nothing was thrown");
    }
}

public sealed class Skip(string reason) : Exception(reason);

public sealed class Runner
{
    private readonly List<(string Group, string Name, Func<Task> Body)> _tests = new();
    public int Passed, Failed, Skipped;
    private readonly List<string> _report = new();

    public void Add(string group, string name, Func<Task> body) => _tests.Add((group, name, body));
    public void Add(string group, string name, Action body) => _tests.Add((group, name, () => { body(); return Task.CompletedTask; }));

    public async Task<int> RunAsync(string? filter)
    {
        foreach (var (group, name, body) in _tests.Where(t => filter is null || t.Group.Contains(filter, StringComparison.OrdinalIgnoreCase)))
        {
            var sw = Stopwatch.StartNew();
            string line;
            try { await body(); Passed++; line = $"PASS  [{group}] {name} ({sw.ElapsedMilliseconds} ms)"; }
            catch (Skip s) { Skipped++; line = $"SKIP  [{group}] {name} - {s.Message}"; }
            catch (Exception ex) { Failed++; line = $"FAIL  [{group}] {name} - {ex.GetType().Name}: {ex.Message}"; }
            Console.WriteLine(line); _report.Add(line);
        }
        var summary = $"\nTOTAL: {Passed} passed, {Failed} failed, {Skipped} skipped";
        Console.WriteLine(summary); _report.Add(summary);
        var outFile = Environment.GetEnvironmentVariable("ROBIX_TEST_REPORT");
        if (!string.IsNullOrEmpty(outFile)) File.WriteAllLines(outFile, _report.Prepend($"RobixHost test run {DateTimeOffset.UtcNow:u}"));
        return Failed == 0 ? 0 : 1;
    }
}

public static class TestEnv
{
    public static string NewTempDir()
    {
        var d = Path.Combine(Path.GetTempPath(), "robix-test-" + Guid.NewGuid().ToString("N")[..10]);
        Directory.CreateDirectory(d); return d;
    }

    public static string RepoRoot()
    {
        var d = new DirectoryInfo(AppContext.BaseDirectory);
        while (d is not null && !File.Exists(Path.Combine(d.FullName, "RobixHost.sln"))) d = d.Parent;
        return d?.FullName ?? throw new InvalidOperationException("RobixHost.sln not found above test binary");
    }
}
