import Link from "next/link";
import { companyDetails, siteConfig } from "@/lib/constants";

/*
 * Shell shared by /terms, /privacy and /cookies. Three long text pages that
 * differ only in their content have no business each carrying their own
 * copy of the heading, the back link and the placeholder warning.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  /** ISO date, rendered in Romanian. Kept explicit rather than `new Date()`:
   *  a "last updated" that moves on every rebuild means nothing. */
  updated: string;
  children: React.ReactNode;
}) {
  const updatedLabel = new Date(updated).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container-max section-y px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">{eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Ultima actualizare: <time dateTime={updated}>{updatedLabel}</time>
        </p>

        {companyDetails.isPlaceholder ? (
          <div className="mt-8 rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm leading-relaxed text-foreground">
            <strong className="font-semibold">Document nefinalizat.</strong> Datele de identificare ale firmei
            (denumire, CUI, număr de înregistrare, sediu, cont bancar) apar mai jos ca marcaje în paranteze
            drepte. Documentul trebuie completat cu datele reale și verificat de un jurist înainte de a fi
            considerat obligatoriu din punct de vedere legal.
          </div>
        ) : null}

        <div className="legal-body mt-10">{children}</div>

        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-6 text-sm">
          <Link href="/" className="py-1.5 font-medium text-foreground transition-colors hover:text-accent-2">
            ← Înapoi la pagina principală
          </Link>
          <a
            href={`mailto:${siteConfig.email}`}
            className="py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteConfig.email}
          </a>
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteConfig.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

/** One numbered section of a policy. */
export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-semibold text-foreground">
        <span className="text-accent-2">{n}.</span> {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
