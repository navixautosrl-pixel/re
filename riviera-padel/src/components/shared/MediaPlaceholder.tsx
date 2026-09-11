import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "padel" | "ping-pong" | "biliard" | "lounge" | "general";

function PadelIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="size-10 sm:size-12" aria-hidden="true">
      <rect x="14" y="6" width="36" height="34" rx="17" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M20 14c4 4 20 4 24 0M20 32c4-4 20-4 24 0M28 6v34M36 6v34"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <path d="M32 40v14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M24 58h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PingPongIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="size-10 sm:size-12" aria-hidden="true">
      <circle cx="32" cy="14" r="6" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="20" cy="42" rx="14" ry="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 42v-9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M44 30l10 24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BiliardIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="size-10 sm:size-12" aria-hidden="true">
      <circle cx="22" cy="24" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="22" cy="24" r="2.4" fill="currentColor" />
      <circle cx="40" cy="34" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 52l24-24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M46 40l10 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LoungeIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="size-10 sm:size-12" aria-hidden="true">
      <path d="M10 44V22a6 6 0 0 1 6-6h32a6 6 0 0 1 6 6v22" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 44h44v6a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2v-6Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M18 30h28" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

function GeneralIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="size-10 sm:size-12" aria-hidden="true">
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.4" />
      <path d="M32 12v40M12 32h40" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

const iconMap: Record<Variant, () => ReactNode> = {
  padel: PadelIcon,
  "ping-pong": PingPongIcon,
  biliard: BiliardIcon,
  lounge: LoungeIcon,
  general: GeneralIcon,
};

/**
 * Elegant stand-in for real photography. No stock photo pretends to be
 * Riviera here — a textured dark field, a hand-drawn line icon, and an
 * honest corner tag instead. Swap for a real <Image> once photography
 * exists; the aspect ratio / rounding contract stays the same.
 */
export function MediaPlaceholder({
  variant = "general",
  label,
  className,
  tag = "Fotografie Riviera — în curând",
}: {
  variant?: Variant;
  label?: string;
  className?: string;
  tag?: string;
}) {
  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-surface",
        className
      )}
    >
      <div className="court-lines absolute inset-0 opacity-40" />
      <div className="noise-overlay" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 55%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3 text-border-strong">
        <Icon />
        {label ? (
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
      {tag ? (
        <span className="absolute right-3 top-3 z-10 rounded-xs border border-border-strong/70 bg-background/70 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-sm">
          {tag}
        </span>
      ) : null}
    </div>
  );
}
