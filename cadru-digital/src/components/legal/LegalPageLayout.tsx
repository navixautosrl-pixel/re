import { Info } from "lucide-react";

export type LegalSection = { heading: string; note: string };

export function LegalPageLayout({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <section className="section-y">
      <div className="container-max max-w-2xl px-6 lg:px-10">
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h1>

        <div className="mt-8 flex items-start gap-3 rounded-sm border border-border-strong bg-surface p-5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Structură profesională, nu text juridic final — de completat/verificat de un avocat
            înainte de publicare.
          </p>
        </div>

        <div className="mt-8 flex flex-col">
          {sections.map((s) => (
            <div key={s.heading} className="border-t border-border py-6 first:border-t-0 first:pt-0">
              <h2 className="font-display text-lg text-foreground">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
