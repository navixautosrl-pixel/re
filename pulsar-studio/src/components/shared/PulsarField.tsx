"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

const RING_COUNT = 5;

/**
 * The brand's own signature motif: a pulsar — a bright core emitting pulses
 * on a steady beat, with a slow sweep arm. Earns its place by being tied to
 * the studio's name rather than being a generic gradient blob, and animates
 * only transform/opacity so it stays cheap on mobile.
 */
export function PulsarField({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <div className="pulsar-stage">
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <span
            key={i}
            className={prefersReducedMotion ? "pulsar-ring pulsar-ring--static" : "pulsar-ring"}
            style={{
              animationDelay: `${i * 1.6}s`,
              // the static fallback still shows the shape, just spread out
              ...(prefersReducedMotion ? { transform: `scale(${0.3 + i * 0.17})`, opacity: 0.4 - i * 0.06 } : null),
            }}
          />
        ))}

        {!prefersReducedMotion ? <span className="pulsar-sweep" /> : null}

        <span className="pulsar-core" />
        <span className="pulsar-halo" />
      </div>
    </div>
  );
}
