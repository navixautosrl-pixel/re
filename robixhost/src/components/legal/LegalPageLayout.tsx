import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

export type LegalSection = { heading: string; note: string };

/**
 * Shared structure for /terms, /privacy, /cookies, /gdpr, /refund-policy,
 * /acceptable-use, /sla. Professional section structure and an
 * explanation of what each section needs to say — not real legal
 * clauses. Never publish as-is; the disclaimer stays visible for exactly
 * that reason.
 */
export function LegalPageLayout({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} description={intro} />

      <section className="section-y">
        <div className="mx-auto max-w-2xl px-6 lg:px-10">
          <div className="mb-14 flex items-start gap-3 rounded-md border border-border-strong bg-surface p-5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Acest document este o <strong className="text-foreground">structură profesională</strong>,
              nu text juridic final. Nu constituie consultanță juridică. Fiecare secțiune trebuie
              completată și verificată de proprietarul RobixHost sau de un avocat înainte de
              publicarea acestei pagini.
            </p>
          </div>

          <div className="flex flex-col">
            {sections.map((s) => (
              <div key={s.heading} className="border-t border-border py-7 first:border-t-0 first:pt-0">
                <h2 className="text-lg font-medium">{s.heading}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
                <ConfigBadge className="mt-3.5">De completat / de verificat juridic</ConfigBadge>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
