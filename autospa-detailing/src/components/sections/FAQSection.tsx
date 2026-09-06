import { Reveal } from "@/components/shared/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqItems } from "@/lib/constants";

export function FAQSection() {
  return (
    <section id="faq" className="section-y border-b border-border">
      <div className="mx-auto max-w-2xl px-6 lg:px-10">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.08em] text-accent">FAQ</p>
          <h2 className="mt-4 text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Întrebări frecvente
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <Accordion type="single" collapsible>
            {faqItems.map((item, i) => (
              <AccordionItem key={item.question} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
