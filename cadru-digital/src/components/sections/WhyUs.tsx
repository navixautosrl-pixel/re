"use client";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { whyUs } from "@/lib/constants";

export function WhyUs() {
  return (
    <section id="despre" className="section-y border-b border-border bg-surface">
      <div className="container-max px-6 lg:px-10">
        <SectionHeading
          eyebrow="De ce noi"
          title="Valoare concretă, nu promisiuni vagi"
          description="Nu suntem „cei mai buni” — suntem preciși în ceea ce facem, și îți explicăm exact de ce contează fiecare decizie."
        />

        <div className="mt-14 divide-y divide-border border-y border-border">
          {whyUs.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.03}>
              <div
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
                }}
                className="spotlight grid gap-2 px-2 py-5 transition-colors hover:bg-background sm:grid-cols-[16rem_1fr] sm:items-baseline sm:gap-8"
              >
                <h3 className="relative z-[1] font-display text-lg text-foreground sm:text-xl">{item.name}</h3>
                <p className="relative z-[1] text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
