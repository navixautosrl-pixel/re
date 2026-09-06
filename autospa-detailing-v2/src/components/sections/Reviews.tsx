import { Star } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { reviews, siteConfig } from "@/lib/constants";

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col rounded-lg border border-border bg-surface p-7 sm:w-[380px]">
      <div className="flex">
        {Array.from({ length: review.rating }).map((_, j) => (
          <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
        ))}
      </div>
      <p className="mt-4 flex-1 text-base leading-relaxed text-foreground/90">&ldquo;{review.text}&rdquo;</p>
      <p className="mt-5 font-display-caps text-sm tracking-[0.03em] text-muted-foreground">
        {review.name} — Recenzie Google
      </p>
    </div>
  );
}

export function Reviews() {
  return (
    <section id="recenzii" className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display-caps text-sm tracking-[0.05em] text-accent">Recenzii</p>
              <h2 className="font-display-caps mt-3 max-w-xl text-4xl leading-[0.95] sm:text-5xl">
                Ce spun clienții
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
      </div>

      <Reveal delay={0.1} className="mt-12 overflow-hidden">
        <div className="marquee-track [animation-duration:38s] hover:[animation-play-state:paused]">
          <div className="flex shrink-0 gap-5 pr-5">
            {reviews.map((r) => (
              <ReviewCard key={r.name} review={r} />
            ))}
          </div>
          <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true">
            {reviews.map((r) => (
              <ReviewCard key={`dup-${r.name}`} review={r} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
