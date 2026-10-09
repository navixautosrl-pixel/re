import type { Faq } from "@/data/faq";

export function FaqList({ items, headingLevel = "h3" }: { items: Faq[]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-16 items-center justify-between gap-6 py-4">
            <H className="text-[length:var(--step-1)] font-semibold leading-snug">{f.q}</H>
            <span className="chev shrink-0 text-2xl text-cyan" aria-hidden="true">+</span>
          </summary>
          <div className="measure pb-6 text-mist-2">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
