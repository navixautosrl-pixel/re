"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { services } from "@/lib/constants";

// One accent per service so the rows read as a spectrum rather than five
// copies of the same card.
const accents = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--accent-4)", "var(--accent-2)"];

/**
 * An editorial index rather than a card grid: each service is a full-width
 * row whose name carries the weight, with the detail revealed on demand.
 * Radix Accordion gives the keyboard and screen-reader behaviour for free.
 */
export function Services() {
  return (
    <section id="servicii" className="section-y relative">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:col-span-7">
            Ce putem face pentru tine?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
            Cinci direcții, un singur partener. Alege una ca să vezi ce include.
          </p>
        </Reveal>

        <Accordion.Root type="single" collapsible className="mt-14 border-t border-border">
          {services.map((service, i) => (
            <Accordion.Item key={service.index} value={service.index} className="border-b border-border">
              <Accordion.Header>
                <Accordion.Trigger
                  className="group flex w-full items-center gap-5 py-7 text-left transition-colors sm:gap-8 sm:py-9"
                  style={{ ["--row-accent" as string]: accents[i] }}
                >
                  <span className="font-display w-9 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground transition-colors group-hover:text-[var(--row-accent)] group-data-[state=open]:text-[var(--row-accent)] sm:w-12 sm:text-base">
                    {service.index}
                  </span>

                  <span className="font-display flex-1 text-2xl font-semibold tracking-tight text-foreground transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1.5 sm:text-4xl lg:text-5xl">
                    {service.name}
                  </span>

                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 ease-[var(--ease-premium)] group-hover:border-[var(--row-accent)] group-data-[state=open]:rotate-45 group-data-[state=open]:border-[var(--row-accent)] sm:size-12"
                  >
                    <Plus
                      className="size-4 text-muted-foreground transition-colors group-hover:text-[var(--row-accent)] group-data-[state=open]:text-[var(--row-accent)]"
                      aria-hidden="true"
                    />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_240ms_var(--ease-premium)] data-[state=open]:animate-[accordion-down_320ms_var(--ease-premium)]">
                {/* Indented to sit under the service name, not the index
                    number, so the open panel lines up with the row above it. */}
                <div className="grid gap-6 pb-9 pl-14 sm:grid-cols-12 sm:gap-8 sm:pl-20">
                  <p className="text-base leading-relaxed text-muted-foreground sm:col-span-6 lg:col-span-5">
                    {service.summary}
                  </p>

                  <div className="sm:col-span-5 sm:col-start-8">
                    <ul className="flex flex-wrap gap-2">
                      {service.points.map((point) => (
                        <li
                          key={point}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#contact"
                      className="mt-5 inline-block py-1 text-sm font-semibold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-current"
                      style={{ color: accents[i] }}
                    >
                      Discută acest serviciu
                    </a>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
