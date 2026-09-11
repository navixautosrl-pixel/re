import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn(align === "center" ? "text-center" : "", className)}>
      <div className={cn("flex items-center gap-3", align === "center" ? "justify-center" : "")}>
        {index ? <span className="font-mono text-xs text-accent">{index}</span> : null}
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            light ? "text-accent-foreground/70" : "text-muted-foreground"
          )}
        >
          {eyebrow}
        </p>
      </div>
      <h2
        className={cn(
          "font-display mt-4 text-[13vw] leading-[0.92] uppercase tracking-[-0.01em] sm:text-6xl lg:text-7xl",
          light ? "text-accent-foreground" : "text-foreground",
          align === "center" ? "mx-auto max-w-3xl" : "max-w-2xl"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-6 max-w-lg text-base leading-relaxed",
            light ? "text-accent-foreground/80" : "text-muted-foreground",
            align === "center" ? "mx-auto" : ""
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
