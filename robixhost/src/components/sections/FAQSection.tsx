import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/constants";

export function FAQSection({ index }: { index?: string } = {}) {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeading index={index} eyebrow="Întrebări frecvente" title="FAQ" align="center" />

        <Reveal delay={0.1} className="mt-14">
          <Accordion type="single" collapsible className="w-full">
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
