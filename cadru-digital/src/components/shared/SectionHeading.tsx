import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn(align === "center" ? "text-center" : "", className)}>
      <div className={cn("flex items-center gap-3", align === "center" ? "justify-center" : "")}>
        {index ? <span className="font-mono text-xs text-muted-foreground">{index}</span> : null}
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      </div>
      <h2
        className={cn(
          "font-display mt-4 text-3xl leading-[1.08] tracking-[-0.01em] text-foreground sm:text-4xl lg:text-[2.75rem]",
          align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-5 max-w-lg text-base leading-relaxed text-muted-foreground", align === "center" ? "mx-auto" : "")}>
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
