"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { schedule } from "../data";

const days = Object.keys(schedule);

export function FitnessSchedule() {
  const [activeDay, setActiveDay] = useState(days[0]);
  const slots = schedule[activeDay] ?? [];

  return (
    <section id="program" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--f-bg)" }}>
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--f-accent)" }}>
            Program
          </p>
          <h2 className="font-fitness mt-3 text-4xl uppercase text-[var(--f-fg)] sm:text-5xl">Orarul săptămânii</h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap justify-center gap-2">
          {days.map((day) => {
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                aria-pressed={isActive}
                className="rounded-md px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors"
                style={{
                  background: isActive ? "var(--f-accent)" : "var(--f-surface-2)",
                  color: isActive ? "#0a0a0a" : "var(--f-muted)",
                  border: `1px solid ${isActive ? "var(--f-accent)" : "var(--f-border)"}`,
                }}
              >
                {day}
              </button>
            );
          })}
        </Reveal>

        <div className="mt-10 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {slots.length === 0 ? (
                <p className="text-center text-sm" style={{ color: "var(--f-muted)" }}>
                  Nicio clasă programată în această zi.
                </p>
              ) : (
                slots.map((slot) => (
                  <div
                    key={`${slot.time}-${slot.class}`}
                    className="flex items-center justify-between rounded-md border px-5 py-4"
                    style={{ borderColor: "var(--f-border)", background: "var(--f-surface-2)" }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-fitness text-lg" style={{ color: "var(--f-accent)" }}>
                        {slot.time}
                      </span>
                      <span className="font-semibold text-[var(--f-fg)]">{slot.class}</span>
                    </div>
                    <span className="text-sm" style={{ color: "var(--f-muted)" }}>
                      {slot.trainer}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
