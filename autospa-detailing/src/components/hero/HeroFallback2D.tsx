export function HeroFallback2D() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div
        className="absolute h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }}
      />
      <div
        className="absolute right-10 top-16 h-28 w-28 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #f0399e, transparent 70%)" }}
      />

      <svg viewBox="0 0 200 90" className="relative w-3/4 max-w-[280px]" aria-hidden="true">
        <ellipse cx="100" cy="70" rx="82" ry="7" fill="#22d3ee" opacity="0.18" />
        <path
          d="M18 62 L28 40 Q40 26 62 26 L86 26 Q96 18 118 18 L138 26 Q156 28 168 42 L178 62 Z"
          fill="#22d3ee"
          stroke="#0c0b0a"
          strokeWidth="2"
        />
        <path d="M70 26 L82 34 L128 34 L138 26" fill="#0a0a0b" />
        <circle cx="52" cy="64" r="14" fill="#111111" />
        <circle cx="52" cy="64" r="7" fill="#fb923c" />
        <circle cx="150" cy="64" r="14" fill="#111111" />
        <circle cx="150" cy="64" r="7" fill="#fb923c" />
        <rect x="172" y="52" width="6" height="10" rx="2" fill="#f0399e" />
      </svg>

      {[
        { top: "18%", left: "72%", size: 14, color: "#ffffff" },
        { top: "68%", left: "20%", size: 10, color: "#22d3ee" },
        { top: "24%", left: "18%", size: 8, color: "#f0399e" },
      ].map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full opacity-70"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, background: d.color }}
        />
      ))}
    </div>
  );
}
