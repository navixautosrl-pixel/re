using RobixHost.Storage;
using RobixHost.Virtualization;

namespace RobixHost.Tests;

public static class StorageTests
{
    public static void Register(Runner r)
    {
        r.Add("storage", "thin disk reports virtual size above real size; retained and unreadable disks are separated and flagged", async () =>
        {
            var root = Path.Combine(Path.GetTempPath(), "robix-stor-" + Guid.NewGuid().ToString("N"));
            try
            {
                var live = Path.Combine(root, "web1"); Directory.CreateDirectory(live);
                File.WriteAllText(Path.Combine(live, "spec.json"), "{}");
                var (c1, _, e1) = await ProcessRunner.RunAsync("qemu-img", ["create", "-f", "qcow2", Path.Combine(live, "disk0.qcow2"), "1G"], TimeSpan.FromSeconds(20), default);
                Check.True(c1 == 0, "qemu-img create: " + e1);

                var gone = Path.Combine(root, "old1"); Directory.CreateDirectory(gone);
                File.WriteAllText(Path.Combine(gone, "spec.deleted-20260101.json"), "{}");
                await ProcessRunner.RunAsync("qemu-img", ["create", "-f", "qcow2", Path.Combine(gone, "disk0.qcow2"), "512M"], TimeSpan.FromSeconds(20), default);

                var bad = Path.Combine(root, "bad1"); Directory.CreateDirectory(bad);
                File.WriteAllText(Path.Combine(bad, "spec.json"), "{}");
                File.WriteAllText(Path.Combine(bad, "disk0.qcow2"), "not a disk image");

                Directory.CreateDirectory(Path.Combine(root, "unrelated"));   // not a RobixHost VM dir

                var rep = await new StorageInspector(root).InspectAsync(default);
                Check.True(rep.Disks.Count == 3, "expected 3 disks, got " + rep.Disks.Count);
                var web = rep.Disks.Single(d => d.VmName == "web1");
                Check.True(web.VirtualBytes == 1L << 30, "virtual size should be exactly 1 GiB");
                Check.True(web.ActualBytes < web.VirtualBytes && web.ThinProvisioned, "a fresh qcow2 must occupy less than its virtual size");
                Check.True(!web.Retained && rep.Disks.Single(d => d.VmName == "old1").Retained, "retained flag");
                Check.True(rep.Disks.Single(d => d.VmName == "bad1").Error is not null, "unreadable disk must carry an error, not be skipped");
                Check.True(rep.Pool.VirtualProvisionedBytes == (1L << 30) + (512L << 20), "unreadable disks excluded from totals");
                Check.True(rep.Pool.RetainedActualBytes > 0 && rep.Pool.ActualUsedByDisksBytes > 0, "actual use separated into live and retained");
                Check.True(rep.Notes.Any(n => n.Contains("could not be read")), "note about unreadable disks");
            }
            finally { try { Directory.Delete(root, true); } catch (IOException) { } }
        });
    }
}
