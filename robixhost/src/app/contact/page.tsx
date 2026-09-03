import type { Metadata } from "next";
import { Mail, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactează echipa RobixHost pentru întrebări comerciale sau tehnice.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="CONTACT" title="Vorbește cu echipa RobixHost" />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <Reveal className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{siteConfig.supportEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">Program suport</p>
                <ConfigBadge>Program: CONFIG HERE</ConfigBadge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Telefon / adresă</p>
              <ConfigBadge className="mt-2">Date de contact suplimentare: CONFIG HERE</ConfigBadge>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
