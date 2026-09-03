import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

export type LegalSection = {
  heading: string;
  note: string;
};

/**
 * Shared structure for every /terms, /privacy, /cookies, /gdpr,
 * /refund-policy, /acceptable-use, /sla page. This intentionally does NOT
 * contain real legal clauses — only a professional section structure and
 * an explanation of what each section needs to say once RobixHost (or
 * their counsel) supplies the real text. Never treat this as legal advice
 * or publish it as-is.
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
      <PageHeader eyebrow="LEGAL" title={title} description={intro} />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm text-foreground/90">
              Acest document este o <strong>structură profesională</strong>, nu text juridic final.
              Nu constituie consultanță juridică. Fiecare secțiune trebuie completată și verificată
              de proprietarul RobixHost sau de un avocat înainte de publicarea acestei pagini.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {sections.map((s) => (
              <div key={s.heading} className="border-b border-border pb-8 last:border-0">
                <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{s.note}</p>
                <ConfigBadge className="mt-4">De completat / de verificat juridic</ConfigBadge>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
