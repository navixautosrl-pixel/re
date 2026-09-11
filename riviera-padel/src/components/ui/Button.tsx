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
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-sans font-semibold uppercase tracking-[0.06em] transition-all duration-300 ease-[var(--ease-premium)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-accent text-accent-foreground hover:bg-foreground active:scale-[0.98]",
  outline:
    "border border-border-strong text-foreground hover:border-accent hover:text-accent active:scale-[0.98]",
  ghost: "text-foreground hover:text-accent",
};

const sizes = {
  md: "rounded-sm px-6 py-3 text-sm",
  lg: "rounded-sm px-8 py-4 text-base",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  icon = true,
  className,
  external = false,
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

  if (external || href.startsWith("tel:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
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
