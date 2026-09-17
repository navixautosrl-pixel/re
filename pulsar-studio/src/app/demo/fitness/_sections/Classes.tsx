"use client";

import { useRef } from "react";
import { Flame, Dumbbell, Swords, Zap, HeartPulse, Wind, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { classes } from "../data";

const icons: LucideIcon[] = [Flame, Dumbbell, Swords, Zap, HeartPulse, Wind];

/**
 * Horizontal drag-scroll carousel — mouse-drag on desktop (native swipe
 * on touch, for free), tall numbered cards instead of a uniform grid.
 * A different browsing mechanic from the other three demos' grids/lists.
 */
export function FitnessClasses() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, startScroll: 0 });

  function onPointerDown(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) return;
    dragState.current = { dragging: true, startX: e.clientX, startScroll: track.scrollLeft };
    track.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track || !dragState.current.dragging) return;
    track.scrollLeft = dragState.current.startScroll - (e.clientX - dragState.current.startX);
  }

  function onPointerUp() {
    dragState.current.dragging = false;
  }

  return (
    <section id="clase" className="py-24 sm:py-32" style={{ background: "var(--f-surface)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--f-accent)" }}>
              Clase
            </p>
            <h2 className="font-fitness mt-3 text-4xl uppercase text-[var(--f-fg)] sm:text-5xl">Alege-ți antrenamentul</h2>
          </div>
          <p className="hidden text-xs font-semibold uppercase tracking-wide sm:block" style={{ color: "var(--f-muted)" }}>
            Trage pentru a explora →
          </p>
        </Reveal>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="mt-10 flex cursor-grab gap-4 overflow-x-auto px-5 pb-4 active:cursor-grabbing sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x proximity" }}
      >
        {classes.map((cls, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={cls.id} delay={i * 0.05} className="w-[78vw] shrink-0 sm:w-[320px]" style={{ scrollSnapAlign: "start" }}>
              <div
                className="flex h-full select-none flex-col rounded-md border p-7"
                style={{ borderColor: "var(--f-border)", background: "var(--f-surface-2)" }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex size-12 items-center justify-center rounded-md"
                    style={{ background: "color-mix(in srgb, var(--f-accent) 16%, transparent)" }}
                  >
                    <Icon className="size-5" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                  </div>
                  <span className="font-fitness text-3xl" style={{ color: "var(--f-border)" }}>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-fitness mt-8 text-2xl uppercase text-[var(--f-fg)]">{cls.name}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--f-muted)" }}>
                  {cls.description}
                </p>
              </div>
            </Reveal>
          );
        })}
        <div className="w-1 shrink-0 sm:w-4" aria-hidden="true" />
      </div>
    </section>
  );
}
