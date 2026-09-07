import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqItems } from "@/lib/constants";

export function FAQSection() {
  return (
    <section className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <SectionHeading eyebrow="Întrebări frecvente" title="Ce trebuie să știi înainte să începem" align="center" />

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-2xl">
          <Accordion type="single" collapsible>
            {faqItems.map((item, i) => (
              <AccordionItem key={item.question} value={`item-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
