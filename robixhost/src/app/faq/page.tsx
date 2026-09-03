import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQSection } from "@/components/sections/FAQSection";

export const metadata: Metadata = {
  title: "Întrebări frecvente",
  description: "Răspunsuri la cele mai frecvente întrebări despre serviciile RobixHost.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Întrebări frecvente" />
      <FAQSection />
    </>
  );
}
