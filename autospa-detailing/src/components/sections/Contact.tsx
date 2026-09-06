import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

export function Contact() {
  return (
    <section id="contact" className="section-y">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-accent">04 — Contact</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Vino sau sună — te așteptăm
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          <Reveal>
            <div className="flex h-full flex-col gap-4 rounded-lg border border-border p-7">
              <Phone className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
              <div>
                <p className="text-base font-medium">{siteConfig.phone}</p>
                <p className="mt-1 text-sm text-muted-foreground">Telefon / WhatsApp</p>
              </div>
              <div className="mt-auto flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <a href={siteConfig.phoneHref}>Sună</a>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <a href={siteConfig.whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="flex h-full flex-col gap-4 rounded-lg border border-border p-7">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
              <div>
                <p className="text-base font-medium">{siteConfig.address}</p>
                <p className="mt-1 text-sm text-muted-foreground">Chiajna, Ilfov</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="flex h-full flex-col gap-4 rounded-lg border border-border p-7">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
              <div>
                <p className="text-base font-medium">Deschis de la {siteConfig.openingTime}</p>
                <p className="mt-1 text-sm text-muted-foreground">Program complet — de confirmat</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
