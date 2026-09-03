"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AmbientField } from "./AmbientField";

const SESSION_KEY = "robixhost-intro-seen";

type Phase = "connecting" | "dissolving" | "done";

/**
 * A single, quiet product-reveal moment — not a gaming loading screen.
 * Logo resolves into focus, connection status confirms itself line by
 * line, then the whole overlay dissolves (fade + slight scale/blur push)
 * to reveal the hero already mounted beneath it. No particle explosion.
 */
export function CinematicIntro() {
  const prefersReducedMotion = useReducedMotion();
  const [shouldShow, setShouldShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("connecting");
  const [ip, setIp] = useState<string | null | "loading">("loading");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldShow(!seen);
  }, []);

  useEffect(() => {
    if (!shouldShow || phase !== "connecting") return;

    // Client-side only, public IP-echo lookup — the visitor's own browser
    // asks a third party what its address looks like from the outside.
    // Nothing is sent to RobixHost, nothing is stored, nothing reaches
    // analytics (see CinematicIntro's privacy note in the privacy page).
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((data: { ip?: string }) => setIp(data.ip ?? null))
      .catch(() => setIp(null));

    const holdMs = prefersReducedMotion ? 400 : 2400;
    const t = setTimeout(() => setPhase("dissolving"), holdMs);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [shouldShow, phase, prefersReducedMotion]);

  const finish = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — intro just replays, not fatal */
    }
    setPhase("done");
  };

  useEffect(() => {
    if (phase !== "dissolving") return;
    const t = setTimeout(finish, prefersReducedMotion ? 150 : 900);
    timers.current.push(t);
    return () => clearTimeout(t);
     
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    // Intentionally reads the ref's value at unmount time — timers
    // scheduled after this effect runs still need to be cleared.
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
          aria-label="Se verifică securitatea conexiunii"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === "dissolving" ? 0 : 1,
            scale: phase === "dissolving" ? 1.04 : 1,
            filter: phase === "dissolving" ? "blur(10px)" : "blur(0px)",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05]" />
          <AmbientField active={!prefersReducedMotion} />

          <div className="relative flex flex-col items-center gap-7 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <Image src="/brand/logo.webp" alt="RobixHost" width={64} height={64} priority className="h-14 w-14 sm:h-16 sm:w-16" />
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="h-px w-16 origin-center bg-border-strong"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-2 font-mono-tech text-xs tracking-[0.04em] text-muted-foreground sm:text-[13px]">
              <StatusLine delay={0.6} text="CONNECTION SECURED" tone="accent" />
              <StatusLine delay={0.85} text="DDoS PROTECTED" tone="accent" />
              <StatusLine
                delay={1.1}
                text={ip === "loading" ? "IP —" : ip ? `IP ${ip}` : "IP indisponibil"}
                tone="muted"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-8 right-8 font-mono-tech text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Sari — Esc
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StatusLine({ text, delay, tone }: { text: string; delay: number; tone: "accent" | "muted" }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={tone === "accent" ? "text-accent" : "text-muted-foreground"}
    >
      {text}
    </motion.p>
  );
}
