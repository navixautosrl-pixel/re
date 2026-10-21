namespace RobixHost.Core;

public static class Perm
{
    public const string HostRead = "host.read";
    public const string VmRead = "vm.read";
    public const string VmPower = "vm.power";
    public const string VmCreate = "vm.create";
    public const string VmDelete = "vm.delete";
    public const string IpManage = "ip.manage";
    public const string JobRead = "job.read";
    public const string AuditRead = "audit.read";
    public const string UserManage = "user.manage";
    public const string Provision = "provision.service";   // WHMCS service account only
}

public static class Roles
{
    public const string Owner = "owner";
    public const string Operator = "operator";
    public const string Viewer = "viewer";
    public const string WhmcsService = "whmcs-service";

    private static readonly Dictionary<string, HashSet<string>> Map = new()
    {
        [Owner] = new() { Perm.HostRead, Perm.VmRead, Perm.VmPower, Perm.VmCreate, Perm.VmDelete, Perm.IpManage, Perm.JobRead, Perm.AuditRead, Perm.UserManage },
        [Operator] = new() { Perm.HostRead, Perm.VmRead, Perm.VmPower, Perm.VmCreate, Perm.IpManage, Perm.JobRead },
        [Viewer] = new() { Perm.HostRead, Perm.VmRead, Perm.JobRead },
        // The billing integration can only provision/suspend/terminate mapped services - never browse the host.
        [WhmcsService] = new() { Perm.Provision, Perm.JobRead },
    };

    public static bool IsKnown(string role) => Map.ContainsKey(role);
    public static bool Has(string role, string permission) => Map.TryGetValue(role, out var s) && s.Contains(permission);
}
