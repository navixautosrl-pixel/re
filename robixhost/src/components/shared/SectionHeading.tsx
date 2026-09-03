import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  index?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  size?: "default" | "editorial";
  id?: string;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  size = "default",
  id,
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {index || eyebrow ? (
        <div
          className={cn(
            "mb-4 flex items-center gap-3 font-mono-tech text-xs tracking-[0.08em] text-muted-foreground",
            align === "center" && "justify-center"
          )}
        >
          {index ? <span className="text-accent">{index}</span> : null}
          {eyebrow ? <span className="uppercase">{eyebrow}</span> : null}
        </div>
      ) : null}
      <h2
        id={id}
        className={cn(
          "font-semibold text-balance leading-[1.05] tracking-[-0.02em]",
          size === "editorial"
            ? "text-4xl sm:text-5xl lg:text-6xl"
            : "text-3xl sm:text-4xl"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
