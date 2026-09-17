"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { faqItems } from "@/lib/constants";

export function FAQ() {
  return (
    <section id="faq" className="section-y relative bg-surface">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Întrebări <span className="gradient-text">frecvente.</span>
            </h2>
          </Reveal>

          <div className="lg:col-span-8">
            <Reveal delay={0.1}>
              <Accordion.Root type="single" collapsible className="border-t border-border">
                {faqItems.map((item) => (
                  <Accordion.Item key={item.question} value={item.question} className="border-b border-border">
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                        <span className="font-display text-lg font-medium text-foreground sm:text-xl">{item.question}</span>
                        <Plus
                          className="size-5 shrink-0 text-accent-2 transition-transform duration-300 ease-[var(--ease-premium)] group-data-[state=open]:rotate-45"
                          aria-hidden="true"
                        />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="accordion-content overflow-hidden text-sm leading-relaxed text-muted-foreground">
                      <p className="max-w-xl pb-6">{item.answer}</p>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
