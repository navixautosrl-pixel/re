import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
        <Reveal>
          {eyebrow ? (
            <p className="mb-4 font-mono-tech text-xs uppercase tracking-[0.08em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
