namespace RobixHost.Data;

/// <summary>Forward-only, versioned schema migrations. Each migration runs in its own transaction.</summary>
public static class Migrations
{
    private static readonly (int Version, string Name, string Sql)[] All =
    {
        (1, "core", """
            CREATE TABLE users (
              id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
              password_hash TEXT NOT NULL, role TEXT NOT NULL, disabled INTEGER NOT NULL DEFAULT 0,
              failed_logins INTEGER NOT NULL DEFAULT 0, locked_until INTEGER, created_at INTEGER NOT NULL);
            CREATE TABLE audit_events (
              id INTEGER PRIMARY KEY, at INTEGER NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL,
              target TEXT, detail TEXT, request_id TEXT);
            CREATE INDEX ix_audit_at ON audit_events(at);
            CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            """),
        (2, "jobs", """
            CREATE TABLE jobs (
              id TEXT PRIMARY KEY, type TEXT NOT NULL, requested_by TEXT NOT NULL, idempotency_key TEXT,
              state TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, current_step TEXT, payload_json TEXT,
              error_code TEXT, error_detail TEXT, attempts INTEGER NOT NULL DEFAULT 0, max_attempts INTEGER NOT NULL DEFAULT 3,
              created_at INTEGER NOT NULL, started_at INTEGER, finished_at INTEGER);
            CREATE UNIQUE INDEX ux_jobs_idem ON jobs(type, idempotency_key) WHERE idempotency_key IS NOT NULL;
            CREATE INDEX ix_jobs_state ON jobs(state);
            CREATE TABLE job_logs (
              id INTEGER PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
              at INTEGER NOT NULL, level TEXT NOT NULL, message TEXT NOT NULL);
            CREATE INDEX ix_job_logs_job ON job_logs(job_id);
            """),
        (3, "network", """
            CREATE TABLE ip_pools (
              id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, cidr TEXT NOT NULL UNIQUE,
              gateway TEXT, dns TEXT, vlan INTEGER);
            CREATE TABLE ip_allocations (
              id INTEGER PRIMARY KEY, pool_id INTEGER NOT NULL REFERENCES ip_pools(id),
              address TEXT NOT NULL, vm_name TEXT, service_id TEXT,
              allocated_at INTEGER NOT NULL, released_at INTEGER);
            -- An address can be actively held by at most one allocation at a time (duplicate-IP guard).
            CREATE UNIQUE INDEX ux_ip_active ON ip_allocations(address) WHERE released_at IS NULL;
            """),
        (4, "vms-and-services", """
            CREATE TABLE vms (
              name TEXT PRIMARY KEY, service_id TEXT UNIQUE, spec_json TEXT NOT NULL,
              desired_state TEXT NOT NULL, suspended INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL, deleted_at INTEGER);
            CREATE TABLE whmcs_services (
              whmcs_service_id TEXT PRIMARY KEY, vm_name TEXT REFERENCES vms(name),
              status TEXT NOT NULL, last_error TEXT, updated_at INTEGER NOT NULL);
            """),
    };

    public static int Apply(SqliteDb db)
    {
        db.Exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at INTEGER NOT NULL)");
        var current = (int)db.Scalar("SELECT COALESCE(MAX(version),0) FROM schema_migrations");
        foreach (var (version, name, sql) in All.Where(m => m.Version > current).OrderBy(m => m.Version))
        {
            db.Transaction(() =>
            {
                foreach (var stmt in sql.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                                         .Select(s => string.Join('\n', s.Split('\n').Where(l => !l.TrimStart().StartsWith("--"))).Trim())
                                         .Where(s => s.Length > 0))
                    db.Exec(stmt);
                db.Exec("INSERT INTO schema_migrations(version,name,applied_at) VALUES(?,?,?)", version, name, DateTimeOffset.UtcNow);
                return 0;
            });
            current = version;
        }
        return current;
    }
}
