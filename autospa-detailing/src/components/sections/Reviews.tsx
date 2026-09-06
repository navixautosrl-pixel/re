import { Star } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { reviews, siteConfig } from "@/lib/constants";

export function Reviews() {
  return (
    <section id="recenzii" className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-accent">Recenzii</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
                Ce spun clienții, pe Google
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                ))}
              </div>
              {siteConfig.rating.toFixed(1)} · {siteConfig.reviewCount} recenzii
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.07}>
              <div className="flex h-full flex-col rounded-lg border border-border p-7">
                <div className="flex">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-5 text-sm font-medium text-muted-foreground">{r.name} — Recenzie Google</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
