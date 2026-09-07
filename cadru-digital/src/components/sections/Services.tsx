"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { services } from "@/lib/constants";

export function Services() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="servicii" className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Servicii"
            title="Tot ce are nevoie o afacere ca să crească online"
            className="max-w-none"
          />
        </div>

        <div className="mt-14 border-t border-border">
          {services.map((service, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={service.name} delay={i * 0.04}>
                <div className="border-b border-border">
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-5 py-6 text-left transition-colors hover:bg-surface sm:gap-8 sm:px-2"
                  >
                    <span className="font-mono text-sm text-muted-foreground">{service.index}</span>
                    <span
                      className={`font-display flex-1 text-2xl transition-colors sm:text-3xl ${
                        isOpen ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {service.name}
                    </span>
                    <span className="hidden max-w-xs text-sm text-muted-foreground md:block">{service.summary}</span>
                    <Plus
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[var(--ease-premium)] ${
                        isOpen ? "rotate-45 text-accent" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-6 pb-8 pl-0 sm:grid-cols-[6rem_1fr] sm:px-2">
                          <div className="hidden sm:block" />
                          <div>
                            <p className="max-w-xl text-base leading-relaxed text-foreground/85">
                              {service.description}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {service.benefits.map((b) => (
                                <span
                                  key={b}
                                  className="rounded-xs border border-border-strong px-3 py-1.5 text-xs text-muted-foreground"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                            <a
                              href="#contact"
                              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
                            >
                              Discută despre {service.name.toLowerCase()}
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
