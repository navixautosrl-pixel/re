import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
  icon?: boolean;
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-sans font-semibold transition-all duration-300 ease-[var(--ease-premium)] focus-visible:outline-2 focus-visible:outline-accent-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  // Always carries a soft glow (not just on :hover) so it reads as "alive"
  // on touch devices too, where hover never fires — hover/active intensify it.
  primary:
    "bg-[image:var(--gradient-blue-purple)] text-white shadow-[0_4px_28px_-6px_color-mix(in_srgb,var(--color-accent-3)_60%,transparent)] hover:shadow-[0_10px_44px_-8px_color-mix(in_srgb,var(--color-accent-3)_75%,transparent)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
  outline: "glass glow-border text-foreground active:scale-[0.97]",
  ghost: "text-foreground hover:text-accent-2",
};

const sizes = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  icon = true,
  className,
  external = false,
  type,
  onClick,
  disabled,
}: ButtonProps) {
  const content = (
    <>
      <span className="transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-x-0.5">
        {children}
      </span>
      {icon ? (
        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-x-1"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  const classes = cn(base, variants[variant], sizes[size], className);

  if (type) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={classes}>
        {content}
      </button>
    );
  }

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={classes} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
