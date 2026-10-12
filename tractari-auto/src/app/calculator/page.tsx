import { Suspense } from "react";
import { Calculator, CalculatorFromUrl } from "@/components/Calculator";
import { RatesTable } from "@/components/RatesTable";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Calculator preț tractare auto",
  description: "Calculator online pentru prețul unei tractări: alegi vehiculul (moto, hatchback, sedan, SUV, microbuz, autoutilitară) și distanța, și vezi totalul pe loc.",
  path: "/calculator/",
});

export default function CalculatorPage() {
  return (
    <div className="wrap pb-20 pt-24 md:pt-28">
      <Suspense fallback={<Calculator headingLevel="h1" />}>
        <CalculatorFromUrl headingLevel="h1" />
      </Suspense>
      <section aria-labelledby="rates-title" className="mt-16">
        <h2 id="rates-title" className="text-[length:var(--step-2)]">Tarifele folosite</h2>
        <div className="mt-5"><RatesTable /></div>
      </section>
      <JsonLd data={breadcrumbLd([{ name: "Acasă", path: "/" }, { name: "Calculator preț", path: "/calculator/" }])} />
    </div>
  );
}
