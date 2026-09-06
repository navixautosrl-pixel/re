import { AlertTriangle } from "lucide-react";

export type LegalSection = { heading: string; note: string };

export function LegalPageLayout({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <section className="section-y">
      <div className="mx-auto max-w-2xl px-6 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h1>

        <div className="mt-10 flex items-start gap-3 rounded-md border border-border-strong bg-surface p-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Structură profesională, nu text juridic final — de completat/verificat de proprietar sau un avocat înainte de publicare.
          </p>
        </div>

        <div className="mt-10 flex flex-col">
          {sections.map((s) => (
            <div key={s.heading} className="border-t border-border py-6 first:border-t-0 first:pt-0">
              <h2 className="text-lg font-medium">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
