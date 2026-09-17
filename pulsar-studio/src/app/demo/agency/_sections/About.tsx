import { Reveal } from "@/components/shared/Reveal";

export function AgencyAbout() {
  return (
    <section id="despre" className="px-5 py-24 sm:px-8" style={{ background: "var(--a-bg)" }}>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--a-accent)" }}>
            Despre FIELD
          </p>
          <p className="font-agency mt-5 text-2xl uppercase leading-snug text-[var(--a-fg)] sm:text-3xl">
            Lucrăm cu echipe mici de clienți, în paralel — nu accentuăm volumul, accentuăm rezultatul fiecărui
            proiect.
          </p>
          <p className="mt-6 max-w-xl text-sm leading-relaxed" style={{ color: "var(--a-muted)" }}>
            De la brand la produsul digital final, echipa rămâne aceeași pe tot parcursul proiectului — fără
            hand-off-uri între departamente, fără pierderi de context.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
