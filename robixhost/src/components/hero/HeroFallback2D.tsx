/**
 * CSS-only stand-in for the 3D infrastructure core — used when WebGL is
 * unavailable, the device is flagged low-power, or reduced-motion is on.
 * Echoes the same object (a core with an outer shell and orbiting nodes)
 * rather than falling back to something unrelated.
 */
export function HeroFallback2D() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
      <div className="absolute inset-0 bg-grid opacity-[0.07]" />
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        <div className="absolute inset-0 rounded-full border border-border-strong" />
        <div className="absolute inset-6 rounded-full border border-border-strong/70" />
        <div className="h-20 w-20 rounded-[28%] border border-accent/40 bg-surface-elevated" style={{ transform: "rotate(20deg)" }} />
        {[
          { top: "6%", left: "18%" },
          { top: "70%", left: "82%" },
          { top: "82%", left: "10%" },
          { top: "12%", left: "78%" },
        ].map((pos, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-accent"
            style={{ top: pos.top, left: pos.left }}
          />
        ))}
      </div>
    </div>
  );
}
