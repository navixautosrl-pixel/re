import { Mail } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/constants";

export function Contact() {
  return (
    <section id="contact" className="section-y">
      <div className="container-max grid gap-14 px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Contact</p>
            <h2 className="font-display mt-4 text-3xl leading-[1.1] text-foreground sm:text-4xl">
              Hai să vorbim despre proiectul tău
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Completează formularul cu câteva detalii — răspundem cu pași concreți, nu cu un
              discurs de vânzări.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-8 inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {siteConfig.email}
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
