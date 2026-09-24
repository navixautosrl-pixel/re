import { MapPin, Phone, Clock } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { restaurant } from "../data";

export function RestaurantContactFooter() {
  return (
    <>
      <section id="contact" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--r-surface)" }}>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--r-accent)" }}>
              Contact
            </p>
            <h2 className="font-restaurant mt-3 text-4xl text-[var(--r-fg)] sm:text-5xl">Te așteptăm.</h2>
            <div className="mt-8 space-y-4 text-base" style={{ color: "var(--r-fg)" }}>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0" style={{ color: "var(--r-accent)" }} aria-hidden="true" />
                {restaurant.address}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 shrink-0" style={{ color: "var(--r-accent)" }} aria-hidden="true" />
                {restaurant.phone}
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0" style={{ color: "var(--r-accent)" }} aria-hidden="true" />
                {restaurant.hours}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-lg border"
              style={{
                borderColor: "var(--r-border)",
                background:
                  "repeating-linear-gradient(0deg, var(--r-surface-2) 0 2px, transparent 2px 40px), repeating-linear-gradient(90deg, var(--r-surface-2) 0 2px, transparent 2px 40px), var(--r-bg)",
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{ background: "var(--r-accent)" }}
              >
                <MapPin className="size-5" style={{ color: "var(--r-bg)" }} aria-hidden="true" />
              </div>
              <span className="absolute bottom-3 left-3 text-xs" style={{ color: "var(--r-muted)" }}>
                Locație ilustrativă — demo
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-center sm:px-8" style={{ borderColor: "var(--r-border)", background: "var(--r-bg)" }}>
        <p className="font-restaurant text-xl text-[var(--r-fg)]">{restaurant.name}</p>
        <p className="mt-2 text-xs" style={{ color: "var(--r-muted)" }}>
          Demo concept construit de CreareWebsitePro · Nu este o afacere reală
        </p>
      </footer>
    </>
  );
}
