"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

const RING_COUNT = 5;

/**
 * The brand's signature motif: a bright core broadcasting rings outward on a
 * steady beat, with a slow sweep arm. It says what the business sells — a
 * site that reaches people — rather than being a generic gradient blob, and
 * animates only transform/opacity so it stays cheap on mobile.
 */
export function SignalField({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <div className="signal-stage">
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <span
            key={i}
            className={prefersReducedMotion ? "signal-ring signal-ring--static" : "signal-ring"}
            style={{
              animationDelay: `${i * 1.6}s`,
              // the static fallback still shows the shape, just spread out
              ...(prefersReducedMotion ? { transform: `scale(${0.3 + i * 0.17})`, opacity: 0.4 - i * 0.06 } : null),
            }}
          />
        ))}

        {!prefersReducedMotion ? <span className="signal-sweep" /> : null}

        <span className="signal-glow" />
        <span className="signal-halo" />
        <span className="signal-core" />
      </div>
    </div>
  );
}
