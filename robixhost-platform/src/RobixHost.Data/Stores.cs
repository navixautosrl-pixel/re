using RobixHost.Core;

namespace RobixHost.Data;

public sealed record UserRow(long Id, string Username, string PasswordHash, string Role, bool Disabled, int FailedLogins, DateTimeOffset? LockedUntil);

public sealed class AuditStore(SqliteDb db)
{
    /// <summary>Append-only. Callers must pass already-redacted detail (see <see cref="Redactor"/>).</summary>
    public void Write(string actor, string action, string? target = null, string? detail = null, string? requestId = null)
        => db.Exec("INSERT INTO audit_events(at,actor,action,target,detail,request_id) VALUES(?,?,?,?,?,?)",
                   DateTimeOffset.UtcNow, actor, action, target, detail is null ? null : Redactor.Redact(detail), requestId);

    public List<AuditEvent> Recent(int limit = 100, int offset = 0, string? actor = null)
        => db.Query("SELECT id,at,actor,action,target,detail,request_id FROM audit_events WHERE (?1 IS NULL OR actor=?1) ORDER BY id DESC LIMIT ?2 OFFSET ?3",
                    r => new AuditEvent(r.Int(0), r.Time(1), r.Str(2), r.Str(3), r.StrN(4), r.StrN(5), r.StrN(6)),
                    actor, Math.Clamp(limit, 1, 500), Math.Max(0, offset));
}

public static class Redactor
{
    private static readonly System.Text.RegularExpressions.Regex Rx = new(
        "(?i)(\"?(?:password|passwd|secret|token|api[_-]?key|private[_-]?key|authorization)\"?\\s*[:=]\\s*)(\"[^\"]*\"|[^\\s,;}]+)",
        System.Text.RegularExpressions.RegexOptions.Compiled);

    public static string Redact(string s) => Rx.Replace(s, "$1\"[REDACTED]\"");
}

public sealed class UserStore(SqliteDb db)
{
    private static UserRow Map(SqliteDb.Row r) => new(r.Int(0), r.Str(1), r.Str(2), r.Str(3), r.Int(4) != 0, (int)r.Int(5), r.TimeN(6));
    private const string Cols = "id,username,password_hash,role,disabled,failed_logins,locked_until";

    public long Count() => db.Scalar("SELECT COUNT(*) FROM users");
    public UserRow? Find(string username) => db.QueryOne($"SELECT {Cols} FROM users WHERE username=?", Map, username);
    public UserRow? Get(long id) => db.QueryOne($"SELECT {Cols} FROM users WHERE id=?", Map, id);
    public long Create(string username, string hash, string role) =>
        db.Insert("INSERT INTO users(username,password_hash,role,created_at) VALUES(?,?,?,?)", username, hash, role, DateTimeOffset.UtcNow);
    public void RegisterFailure(long id, int lockAfter, TimeSpan lockFor) =>
        db.Exec("UPDATE users SET failed_logins=failed_logins+1, locked_until=CASE WHEN failed_logins+1>=? THEN ? ELSE locked_until END WHERE id=?",
                lockAfter, DateTimeOffset.UtcNow + lockFor, id);
    public void RegisterSuccess(long id) => db.Exec("UPDATE users SET failed_logins=0, locked_until=NULL WHERE id=?", id);
}

public sealed class JobStore(SqliteDb db)
{
    private const string Cols = "id,type,requested_by,idempotency_key,state,progress,current_step,payload_json,error_code,error_detail,attempts,max_attempts,created_at,started_at,finished_at";
    private static JobRecord Map(SqliteDb.Row r) => new()
    {
        Id = r.Str(0), Type = r.Str(1), RequestedBy = r.Str(2), IdempotencyKey = r.StrN(3),
        State = Enum.Parse<JobState>(r.Str(4)), Progress = (int)r.Int(5), CurrentStep = r.StrN(6), PayloadJson = r.StrN(7),
        ErrorCode = r.StrN(8), ErrorDetail = r.StrN(9), Attempts = (int)r.Int(10), MaxAttempts = (int)r.Int(11),
        CreatedAt = r.Time(12), StartedAt = r.TimeN(13), FinishedAt = r.TimeN(14),
    };

    /// <summary>
    /// Creates a job, or returns the existing one when (type, idempotencyKey) was already submitted.
    /// This is what makes repeated WHMCS "create" calls safe: the second call returns the first job.
    /// </summary>
    public (JobRecord Job, bool Created) Enqueue(string type, string requestedBy, string? payloadJson, string? idempotencyKey, int maxAttempts = 3)
    {
        var id = Guid.NewGuid().ToString("N");
        try
        {
            db.Exec("INSERT INTO jobs(id,type,requested_by,idempotency_key,state,payload_json,max_attempts,created_at) VALUES(?,?,?,?,?,?,?,?)",
                    id, type, requestedBy, idempotencyKey, JobState.Queued, payloadJson, maxAttempts, DateTimeOffset.UtcNow);
            return (Get(id)!, true);
        }
        catch (DataException ex) when (SqliteDb.IsUniqueViolation(ex) && idempotencyKey is not null)
        {
            var existing = db.QueryOne($"SELECT {Cols} FROM jobs WHERE type=? AND idempotency_key=?", Map, type, idempotencyKey)!;
            return (existing, false);
        }
    }

    public JobRecord? Get(string id) => db.QueryOne($"SELECT {Cols} FROM jobs WHERE id=?", Map, id);

    public List<JobRecord> List(JobState? state = null, int limit = 100, int offset = 0)
        => db.Query($"SELECT {Cols} FROM jobs WHERE (?1 IS NULL OR state=?1) ORDER BY created_at DESC LIMIT ?2 OFFSET ?3", Map,
                    state?.ToString(), Math.Clamp(limit, 1, 500), Math.Max(0, offset));

    /// <summary>Atomically moves the oldest Queued job to Running. Returns null if none.</summary>
    public JobRecord? ClaimNext() => db.Transaction(() =>
    {
        var id = db.QueryOne("SELECT id FROM jobs WHERE state='Queued' ORDER BY created_at LIMIT 1", r => r.Str(0));
        if (id is null) return null;
        db.Exec("UPDATE jobs SET state='Running', started_at=COALESCE(started_at,?), attempts=attempts+1 WHERE id=?", DateTimeOffset.UtcNow, id);
        return Get(id);
    });

    public void SetProgress(string id, int progress, string step)
        => db.Exec("UPDATE jobs SET progress=?, current_step=? WHERE id=?", Math.Clamp(progress, 0, 100), step, id);

    public void Complete(string id) => db.Exec("UPDATE jobs SET state='Succeeded', progress=100, finished_at=?, error_code=NULL, error_detail=NULL WHERE id=?", DateTimeOffset.UtcNow, id);
    public void Fail(string id, string code, string detail) => db.Exec("UPDATE jobs SET state='Failed', finished_at=?, error_code=?, error_detail=? WHERE id=?", DateTimeOffset.UtcNow, code, Redactor.Redact(detail), id);
    public void Requeue(string id, string code, string detail) => db.Exec("UPDATE jobs SET state='Queued', error_code=?, error_detail=? WHERE id=?", code, Redactor.Redact(detail), id);
    public void MarkCancelled(string id) => db.Exec("UPDATE jobs SET state='Cancelled', finished_at=? WHERE id=? AND state IN ('Queued','Running')", DateTimeOffset.UtcNow, id);

    /// <summary>Manual retry of a Failed job: resets state, keeps history, grants one more attempt.</summary>
    public bool Retry(string id) => db.Exec("UPDATE jobs SET state='Queued', finished_at=NULL, max_attempts=attempts+1 WHERE id=? AND state='Failed'", id) > 0;

    /// <summary>On service start: jobs left Running by a crash are returned to the queue (steps must be idempotent).</summary>
    public int RecoverInterrupted() => db.Exec("UPDATE jobs SET state='Queued', current_step='recovered after restart' WHERE state='Running'");

    public void Log(string jobId, string level, string message)
        => db.Exec("INSERT INTO job_logs(job_id,at,level,message) VALUES(?,?,?,?)", jobId, DateTimeOffset.UtcNow, level, Redactor.Redact(message));

    public List<(DateTimeOffset At, string Level, string Message)> Logs(string jobId)
        => db.Query("SELECT at,level,message FROM job_logs WHERE job_id=? ORDER BY id", r => (r.Time(0), r.Str(1), r.Str(2)), jobId);
}
