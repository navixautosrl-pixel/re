"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { faqItems } from "@/lib/constants";

export function FAQ() {
  return (
    <section id="faq" className="bg-surface section-y">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Întrebări" title="Întrebări frecvente" />
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={0.1}>
              <Accordion.Root type="single" collapsible className="border-t border-border">
                {faqItems.map((item) => (
                  <Accordion.Item key={item.question} value={item.question} className="border-b border-border">
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                        <span className="font-display text-2xl uppercase leading-tight tracking-[-0.005em] text-foreground sm:text-3xl">
                          {item.question}
                        </span>
                        <Plus
                          className="size-5 shrink-0 text-accent transition-transform duration-300 ease-[var(--ease-premium)] group-data-[state=open]:rotate-45"
                          aria-hidden="true"
                        />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="accordion-content overflow-hidden text-base leading-relaxed text-muted-foreground">
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
