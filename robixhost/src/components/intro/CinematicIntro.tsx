"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ParticleBurst } from "./ParticleBurst";
import { isLowPowerDevice } from "@/lib/device";

const SESSION_KEY = "robixhost-intro-seen";

type Phase = "connecting" | "exploding" | "done";

export function CinematicIntro() {
  const prefersReducedMotion = useReducedMotion();
  const [shouldShow, setShouldShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("connecting");
  const [ip, setIp] = useState<string | null | "loading">("loading");
  const [lowPower, setLowPower] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reads sessionStorage/device capability (external systems) to decide
  // whether this visit should show the intro — an effect is the correct
  // place for this; there is no external-system read without it.
  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldShow(!seen);
     
    setLowPower(isLowPowerDevice());
  }, []);

  useEffect(() => {
    if (!shouldShow || phase !== "connecting") return;

    fetch("/api/ip")
      .then((r) => r.json())
      .then((data: { ip: string | null }) => setIp(data.ip))
      .catch(() => setIp(null));

    // Reduced motion: short, mostly static hold instead of the full sequence.
    const holdMs = prefersReducedMotion ? 500 : lowPower ? 1400 : 2200;
    const t = setTimeout(() => setPhase("exploding"), holdMs);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [shouldShow, phase, prefersReducedMotion, lowPower]);

  const finish = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* sessionStorage unavailable (private mode) — intro just replays, not fatal */
    }
    setPhase("done");
  };

  useEffect(() => {
    // Intentionally reads the ref's value at unmount time (not a snapshot
    // taken now) — timers scheduled after this effect runs still need to
    // be cleared.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!shouldShow || phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
     
  }, [shouldShow, phase]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          key="intro"
        role="dialog"
        aria-label="Se stabilește conexiunea securizată"
        aria-live="polite"
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exploding" ? 1 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.15 : 0.6, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (phase === "exploding" && !prefersReducedMotion) {
            // let the particle burst / logo pulse play, handled below
          }
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.15]" />

        <ParticleBurst
          active={phase === "exploding" && !prefersReducedMotion}
          intensity={lowPower ? "reduced" : "full"}
          onComplete={finish}
        />
        {phase === "exploding" && prefersReducedMotion ? (
          <ImmediateFinish onFinish={finish} />
        ) : null}

        <div className="relative flex flex-col items-center gap-6 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: phase === "exploding" && !prefersReducedMotion ? [1, 1.08, 0.9] : 1,
            }}
            transition={{
              opacity: { duration: 0.5 },
              scale:
                phase === "exploding"
                  ? { duration: 0.7, ease: "easeInOut" }
                  : { duration: 0.5 },
            }}
          >
            <Image
              src="/brand/logo.webp"
              alt="RobixHost"
              width={88}
              height={88}
              priority
              className="h-20 w-20 sm:h-24 sm:w-24"
            />
          </motion.div>

          <AnimatePresence>
            {phase === "connecting" ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="flex flex-col items-center gap-2 font-data text-xs tracking-wide text-muted-foreground sm:text-sm"
              >
                <StatusLine delay={0.5} text="SECURE CONNECTION ESTABLISHED" tone="primary" />
                <StatusLine delay={0.75} text="DDoS PROTECTION ACTIVE" tone="primary" />
                <StatusLine
                  delay={1}
                  text={
                    ip === "loading"
                      ? "IP: se verifică…"
                      : ip
                        ? `IP: ${ip}`
                        : "IP: indisponibil"
                  }
                  tone="muted"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-8 right-1/2 translate-x-1/2 rounded-md border border-border bg-surface/70 px-4 py-2 font-data text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground sm:bottom-10 sm:right-10 sm:translate-x-0"
          >
            Sari intro
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StatusLine({
  text,
  delay,
  tone,
}: {
  text: string;
  delay: number;
  tone: "primary" | "muted";
}) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={tone === "primary" ? "text-primary" : "text-muted-foreground"}
    >
      {text}
    </motion.p>
  );
}

function ImmediateFinish({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
