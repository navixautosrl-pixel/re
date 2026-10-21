using System.Net;
using System.Net.Sockets;
using RobixHost.Core;
using RobixHost.Data;

namespace RobixHost.Networking;

public sealed class IpPoolService(SqliteDb db, AuditStore audit)
{
    public IpPool CreatePool(string name, string cidr, string? gateway, string? dns, int? vlan, string actor)
    {
        if (!IPNetwork.TryParse(cidr, out var net)) throw new RobixException("validation.cidr", $"'{cidr}' is not a valid CIDR.");
        IPAddress? gw = null;
        if (!string.IsNullOrWhiteSpace(gateway) && (!IPAddress.TryParse(gateway, out gw) || !net.Contains(gw)))
            throw new RobixException("validation.gateway", "Gateway must be an address inside the pool's subnet.");
        if (vlan is < 1 or > 4094) throw new RobixException("validation.vlan", "VLAN must be 1..4094.");
        var normalized = net.ToString();
        try
        {
            var id = db.Insert("INSERT INTO ip_pools(name,cidr,gateway,dns,vlan) VALUES(?,?,?,?,?)", name, normalized, gw?.ToString(), dns, vlan);
            audit.Write(actor, "ip.pool.create", name, normalized);
            return new IpPool(id, name, normalized, gw?.ToString(), dns, vlan);
        }
        catch (DataException ex) when (SqliteDb.IsUniqueViolation(ex))
        {
            throw new RobixException("conflict.pool", "A pool with this name or CIDR already exists.", ex);
        }
    }

    public IpPool? GetPool(long id) => db.QueryOne("SELECT id,name,cidr,gateway,dns,vlan FROM ip_pools WHERE id=?",
        r => new IpPool(r.Int(0), r.Str(1), r.Str(2), r.StrN(3), r.StrN(4), (int?)r.IntN(5)), id);

    public List<IpPool> ListPools() => db.Query("SELECT id,name,cidr,gateway,dns,vlan FROM ip_pools ORDER BY name",
        r => new IpPool(r.Int(0), r.Str(1), r.Str(2), r.StrN(3), r.StrN(4), (int?)r.IntN(5)));

    /// <summary>Allocates the lowest free usable IPv4 address. Atomic: the unique partial index is the final arbiter.</summary>
    public IpAllocation AllocateNext(long poolId, string? vmName, string? serviceId, string actor)
    {
        var pool = GetPool(poolId) ?? throw new RobixException("notfound.pool", "IP pool not found.");
        IPNetwork.TryParse(pool.Cidr, out var net);
        if (net.BaseAddress.AddressFamily != AddressFamily.InterNetwork)
            throw new RobixException("validation.ipv6_sequential", "IPv6 pools require an explicit address (a /64 cannot be enumerated).");

        for (var attempt = 0; attempt < 5; attempt++)
        {
            try
            {
                // Pick-and-insert is ONE transaction (BEGIN IMMEDIATE): concurrent allocators are serialized, so none
                // can lose a race between "read free addresses" and "insert". The UNIQUE index remains the last line
                // of defence (e.g. another process), which the retry loop below handles.
                return db.Transaction(() =>
                {
                    var used = db.Query("SELECT address FROM ip_allocations WHERE pool_id=? AND released_at IS NULL", r => r.Str(0), poolId).ToHashSet();
                    var candidate = EnumerateUsable(net, pool.Gateway).FirstOrDefault(a => !used.Contains(a));
                    if (candidate is null) throw new RobixException("capacity.ip_exhausted", $"Pool '{pool.Name}' has no free addresses.");
                    return Insert(pool.Id, candidate, vmName, serviceId, actor);
                });
            }
            catch (DataException ex) when (SqliteDb.IsUniqueViolation(ex)) { /* raced with another process; recompute */ }
        }
        throw new RobixException("conflict.ip_race", "Could not allocate an address after several attempts; retry.");
    }

    public IpAllocation AllocateSpecific(long poolId, string address, string? vmName, string? serviceId, string actor)
    {
        var pool = GetPool(poolId) ?? throw new RobixException("notfound.pool", "IP pool not found.");
        IPNetwork.TryParse(pool.Cidr, out var net);
        if (!IPAddress.TryParse(address, out var ip) || !net.Contains(ip))
            throw new RobixException("validation.address", "Address is not inside the selected pool.");
        var norm = ip.ToString();
        if (norm == pool.Gateway) throw new RobixException("validation.address", "Address is the pool gateway.");
        if (ip.AddressFamily == AddressFamily.InterNetwork && !EnumerateUsable(net, pool.Gateway, includeGateway: true).Contains(norm))
            throw new RobixException("validation.address", "Address is the network or broadcast address.");
        try { return Insert(pool.Id, norm, vmName, serviceId, actor); }
        catch (DataException ex) when (SqliteDb.IsUniqueViolation(ex))
        {
            throw new RobixException("conflict.ip_in_use", $"{norm} is already allocated.", ex);
        }
    }

    public bool Release(string address, string actor)
    {
        var n = db.Exec("UPDATE ip_allocations SET released_at=? WHERE address=? AND released_at IS NULL", DateTimeOffset.UtcNow, address);
        if (n > 0) audit.Write(actor, "ip.release", address);
        return n > 0;
    }

    public int ReleaseForVm(string vmName, string actor)
    {
        var n = db.Exec("UPDATE ip_allocations SET released_at=? WHERE vm_name=? AND released_at IS NULL", DateTimeOffset.UtcNow, vmName);
        if (n > 0) audit.Write(actor, "ip.release_vm", vmName, $"{n} address(es)");
        return n;
    }

    /// <summary>Active (not released) addresses currently held by a VM, across all pools.</summary>
    public List<string> AddressesForVm(string vmName) => db.Query(
        "SELECT address FROM ip_allocations WHERE vm_name=? AND released_at IS NULL ORDER BY id", r => r.Str(0), vmName);

    public List<IpAllocation> Allocations(long poolId, bool includeHistory = false) => db.Query(
        "SELECT id,pool_id,address,vm_name,service_id,allocated_at,released_at FROM ip_allocations WHERE pool_id=? AND (?=1 OR released_at IS NULL) ORDER BY id",
        r => new IpAllocation(r.Int(0), r.Int(1), r.Str(2), r.StrN(3), r.StrN(4), r.Time(5), r.TimeN(6)), poolId, includeHistory ? 1 : 0);

    private IpAllocation Insert(long poolId, string address, string? vm, string? svc, string actor)
    {
        var now = DateTimeOffset.UtcNow;
        var id = db.Insert("INSERT INTO ip_allocations(pool_id,address,vm_name,service_id,allocated_at) VALUES(?,?,?,?,?)", poolId, address, vm, svc, now);
        audit.Write(actor, "ip.allocate", address, $"vm={vm} service={svc}");
        return new IpAllocation(id, poolId, address, vm, svc, now, null);
    }

    /// <summary>Usable IPv4 hosts: excludes network + broadcast (for prefixes shorter than /31) and the gateway.</summary>
    internal static IEnumerable<string> EnumerateUsable(IPNetwork net, string? gateway, bool includeGateway = false)
    {
        var bytes = net.BaseAddress.GetAddressBytes();
        if (bytes.Length != 4) yield break;
        uint baseAddr = (uint)(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]);
        var size = 1UL << (32 - net.PrefixLength);
        ulong first = size > 2 ? 1UL : 0UL, last = size > 2 ? size - 2 : size - 1;
        for (var i = first; i <= last; i++)
        {
            var v = baseAddr + (uint)i;
            var s = $"{v >> 24}.{(v >> 16) & 255}.{(v >> 8) & 255}.{v & 255}";
            if (!includeGateway && s == gateway) continue;
            yield return s;
        }
    }
}
