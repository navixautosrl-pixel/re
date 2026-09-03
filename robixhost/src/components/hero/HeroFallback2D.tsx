/**
 * Performant CSS-only stand-in for the 3D scene — used automatically when
 * WebGL isn't available, the device is flagged low-power, or the visitor
 * has prefers-reduced-motion set. No canvas, no JS animation loop.
 */
export function HeroFallback2D() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative flex w-56 flex-col gap-2.5 sm:w-64">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-border-strong bg-surface-elevated px-3 py-2.5"
          >
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary [animation-delay:0.3s]" />
            <div className="ml-auto flex gap-1">
              {Array.from({ length: 6 }).map((_, j) => (
                <span key={j} className="h-3 w-0.5 rounded-full bg-border-strong" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
    </div>
  );
}
