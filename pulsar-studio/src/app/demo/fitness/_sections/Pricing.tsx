"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { plans } from "../data";

export function FitnessPricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="abonamente" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--f-bg)" }}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--f-accent)" }}>
            Abonamente
          </p>
          <h2 className="font-fitness mt-3 text-4xl uppercase text-[var(--f-fg)] sm:text-5xl">Alege planul potrivit</h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 flex items-center justify-center gap-3">
          <span
            className="text-sm font-semibold"
            style={{ color: annual ? "var(--f-muted)" : "var(--f-fg)" }}
          >
            Lunar
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Comută între facturare lunară și anuală"
            onClick={() => setAnnual((v) => !v)}
            className="relative h-8 w-14 rounded-full border transition-colors after:absolute after:-inset-2.5 after:content-['']"
            style={{ borderColor: "var(--f-border)", background: annual ? "var(--f-accent)" : "var(--f-surface-2)" }}
          >
            <motion.span
              className="absolute top-1 size-6 rounded-full"
              style={{ background: annual ? "#0a0a0a" : "var(--f-fg)" }}
              animate={{ left: annual ? "calc(100% - 28px)" : "4px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className="text-sm font-semibold" style={{ color: annual ? "var(--f-fg)" : "var(--f-muted)" }}>
            Anual <span style={{ color: "var(--f-accent)" }}>(−20%)</span>
          </span>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08} className={plan.featured ? "lg:-translate-y-3" : ""}>
              <div
                className="flex h-full flex-col rounded-md border p-7"
                style={{
                  borderColor: plan.featured ? "var(--f-accent)" : "var(--f-border)",
                  borderWidth: plan.featured ? 2 : 1,
                  background: "var(--f-surface)",
                }}
              >
                {plan.featured ? (
                  <span
                    className="mb-4 w-fit rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide"
                    style={{ background: "var(--f-accent)", color: "#0a0a0a" }}
                  >
                    Cel mai popular
                  </span>
                ) : null}
                <p className="font-fitness text-xl uppercase" style={{ color: "var(--f-fg)" }}>
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <motion.span
                    key={annual ? `${plan.id}-a` : `${plan.id}-m`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-fitness text-3xl text-[var(--f-fg)]"
                  >
                    {annual ? plan.annualPrice : plan.monthlyPrice}
                  </motion.span>
                </div>
                {annual ? (
                  <p className="mt-1 text-xs" style={{ color: "var(--f-muted)" }}>
                    {plan.annualNote}
                  </p>
                ) : null}

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--f-fg)" }}>
                      <Check className="mt-0.5 size-4 shrink-0" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#contact"
                  className="mt-7 flex items-center justify-center rounded-md py-3.5 text-sm font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5"
                  style={
                    plan.featured
                      ? { background: "var(--f-accent)", color: "#0a0a0a" }
                      : { border: "1px solid var(--f-border)", color: "var(--f-fg)" }
                  }
                >
                  Alege {plan.name}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
