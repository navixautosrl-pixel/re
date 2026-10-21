using System.Runtime.InteropServices;
using System.Text;

namespace RobixHost.Data;

/// <summary>
/// Minimal, dependency-free SQLite wrapper over the system libsqlite3 (P/Invoke).
/// One serialized connection (WAL mode). Sufficient for the single-node control plane; the
/// repository interfaces allow a PostgreSQL implementation for multi-node production.
/// </summary>
public sealed class SqliteDb : IDisposable
{
    private const int SQLITE_OK = 0, SQLITE_ROW = 100, SQLITE_DONE = 101;
    private const int SQLITE_INTEGER = 1, SQLITE_FLOAT = 2, SQLITE_TEXT = 3, SQLITE_NULL = 5;
    private const int OPEN_READWRITE = 0x2, OPEN_CREATE = 0x4, OPEN_FULLMUTEX = 0x10000;
    private static readonly IntPtr Transient = new(-1);

    [DllImport("sqlite3")] private static extern int sqlite3_open_v2([MarshalAs(UnmanagedType.LPUTF8Str)] string file, out IntPtr db, int flags, IntPtr vfs);
    [DllImport("sqlite3")] private static extern int sqlite3_close_v2(IntPtr db);
    [DllImport("sqlite3")] private static extern int sqlite3_prepare_v2(IntPtr db, byte[] sql, int n, out IntPtr stmt, IntPtr tail);
    [DllImport("sqlite3")] private static extern int sqlite3_step(IntPtr stmt);
    [DllImport("sqlite3")] private static extern int sqlite3_finalize(IntPtr stmt);
    [DllImport("sqlite3")] private static extern int sqlite3_bind_null(IntPtr stmt, int i);
    [DllImport("sqlite3")] private static extern int sqlite3_bind_int64(IntPtr stmt, int i, long v);
    [DllImport("sqlite3")] private static extern int sqlite3_bind_double(IntPtr stmt, int i, double v);
    [DllImport("sqlite3")] private static extern int sqlite3_bind_text(IntPtr stmt, int i, byte[] v, int n, IntPtr destructor);
    [DllImport("sqlite3")] private static extern int sqlite3_column_count(IntPtr stmt);
    [DllImport("sqlite3")] private static extern int sqlite3_column_type(IntPtr stmt, int i);
    [DllImport("sqlite3")] private static extern long sqlite3_column_int64(IntPtr stmt, int i);
    [DllImport("sqlite3")] private static extern double sqlite3_column_double(IntPtr stmt, int i);
    [DllImport("sqlite3")] private static extern IntPtr sqlite3_column_text(IntPtr stmt, int i);
    [DllImport("sqlite3")] private static extern int sqlite3_column_bytes(IntPtr stmt, int i);
    [DllImport("sqlite3")] private static extern IntPtr sqlite3_errmsg(IntPtr db);
    [DllImport("sqlite3")] private static extern int sqlite3_changes(IntPtr db);
    [DllImport("sqlite3")] private static extern long sqlite3_last_insert_rowid(IntPtr db);
    [DllImport("sqlite3")] private static extern int sqlite3_extended_errcode(IntPtr db);

    private readonly object _gate = new();
    private IntPtr _db;
    public string Path { get; }

    public SqliteDb(string path)
    {
        Path = path;
        var rc = sqlite3_open_v2(path, out _db, OPEN_READWRITE | OPEN_CREATE | OPEN_FULLMUTEX, IntPtr.Zero);
        if (rc != SQLITE_OK) throw new DataException($"Cannot open database '{path}' (rc={rc})");
        Exec("PRAGMA journal_mode=WAL;");
        Exec("PRAGMA foreign_keys=ON;");
        Exec("PRAGMA busy_timeout=5000;");
        Exec("PRAGMA synchronous=FULL;");
    }

    public sealed class Row
    {
        private readonly IntPtr _s;
        internal Row(IntPtr s) => _s = s;
        public bool IsNull(int i) => sqlite3_column_type(_s, i) == SQLITE_NULL;
        public long Int(int i) => sqlite3_column_int64(_s, i);
        public long? IntN(int i) => IsNull(i) ? null : Int(i);
        public double Dbl(int i) => sqlite3_column_double(_s, i);
        public string Str(int i) => StrN(i) ?? "";
        public string? StrN(int i)
        {
            if (IsNull(i)) return null;
            var p = sqlite3_column_text(_s, i);
            return Marshal.PtrToStringUTF8(p, sqlite3_column_bytes(_s, i));
        }
        public DateTimeOffset Time(int i) => DateTimeOffset.FromUnixTimeMilliseconds(Int(i));
        public DateTimeOffset? TimeN(int i) => IsNull(i) ? null : Time(i);
    }

    public int Exec(string sql, params object?[] args)
    {
        lock (_gate) { RunStatement(sql, args, null); return sqlite3_changes(_db); }
    }

    public long Insert(string sql, params object?[] args)
    {
        lock (_gate) { RunStatement(sql, args, null); return sqlite3_last_insert_rowid(_db); }
    }

    public List<T> Query<T>(string sql, Func<Row, T> map, params object?[] args)
    {
        var list = new List<T>();
        lock (_gate) RunStatement(sql, args, r => list.Add(map(r)));
        return list;
    }

    public T? QueryOne<T>(string sql, Func<Row, T> map, params object?[] args) where T : class
        => Query(sql, map, args).FirstOrDefault();

    public long Scalar(string sql, params object?[] args)
        => Query(sql, r => r.IsNull(0) ? 0L : r.Int(0), args).FirstOrDefault();

    /// <summary>Runs <paramref name="work"/> inside BEGIN IMMEDIATE ... COMMIT; rolls back on any exception.</summary>
    public T Transaction<T>(Func<T> work)
    {
        lock (_gate)
        {
            RunStatement("BEGIN IMMEDIATE", Array.Empty<object?>(), null);
            try
            {
                var result = work();
                RunStatement("COMMIT", Array.Empty<object?>(), null);
                return result;
            }
            catch
            {
                try { RunStatement("ROLLBACK", Array.Empty<object?>(), null); } catch { /* original exception wins */ }
                throw;
            }
        }
    }

    /// <summary>True if the last failure was a UNIQUE/PRIMARY KEY constraint violation.</summary>
    public static bool IsUniqueViolation(Exception e) => e is DataException { ExtendedCode: 2067 or 1555 };

    private void RunStatement(string sql, object?[] args, Action<Row>? onRow)
    {
        if (_db == IntPtr.Zero) throw new ObjectDisposedException(nameof(SqliteDb));
        var bytes = Encoding.UTF8.GetBytes(sql + "\0");
        var rc = sqlite3_prepare_v2(_db, bytes, -1, out var stmt, IntPtr.Zero);
        if (rc != SQLITE_OK) throw Fail("prepare", sql);
        try
        {
            for (var i = 0; i < args.Length; i++) Bind(stmt, i + 1, args[i]);
            while (true)
            {
                rc = sqlite3_step(stmt);
                if (rc == SQLITE_ROW) { onRow?.Invoke(new Row(stmt)); continue; }
                if (rc == SQLITE_DONE) break;
                throw Fail("step", sql);
            }
        }
        finally { sqlite3_finalize(stmt); }
    }

    private static void Bind(IntPtr stmt, int i, object? v)
    {
        switch (v)
        {
            case null: sqlite3_bind_null(stmt, i); break;
            case bool b: sqlite3_bind_int64(stmt, i, b ? 1 : 0); break;
            case int n: sqlite3_bind_int64(stmt, i, n); break;
            case long l: sqlite3_bind_int64(stmt, i, l); break;
            case double d: sqlite3_bind_double(stmt, i, d); break;
            case DateTimeOffset t: sqlite3_bind_int64(stmt, i, t.ToUnixTimeMilliseconds()); break;
            case Enum en: sqlite3_bind_text(stmt, i, Utf8(en.ToString()), -1, Transient); break;
            case string s: { var b = Encoding.UTF8.GetBytes(s); sqlite3_bind_text(stmt, i, b.Length == 0 ? new byte[1] : b, b.Length, Transient); break; }
            default: throw new DataException($"Unsupported parameter type {v.GetType().Name}");
        }
    }

    private static byte[] Utf8(string s) => Encoding.UTF8.GetBytes(s + "\0");

    private DataException Fail(string stage, string sql)
        => new($"SQLite {stage} failed: {Marshal.PtrToStringUTF8(sqlite3_errmsg(_db))} [{Truncate(sql)}]", sqlite3_extended_errcode(_db));

    private static string Truncate(string s) => s.Length <= 80 ? s.Replace('\n', ' ') : s[..80].Replace('\n', ' ') + "...";

    public void Dispose()
    {
        lock (_gate) { if (_db != IntPtr.Zero) { sqlite3_close_v2(_db); _db = IntPtr.Zero; } }
    }
}

public sealed class DataException : Exception
{
    public int ExtendedCode { get; }
    public DataException(string message, int extendedCode = 0) : base(message) => ExtendedCode = extendedCode;
}
