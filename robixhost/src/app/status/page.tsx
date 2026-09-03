import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { statusServices } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Status Infrastructură",
  description: "Status curent al serviciilor RobixHost.",
};

export default function StatusPage() {
  const allOperational = statusServices.every((s) => s.status === "operational");

  return (
    <>
      <PageHeader eyebrow="STATUS" title="Status infrastructură" />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-surface p-5">
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="font-display text-lg font-semibold">
                {allOperational ? "All Systems Operational" : "Probleme raportate"}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-6 flex flex-col gap-3">
            {statusServices.map((s) => (
              <StatusIndicator key={s.name} name={s.name} status={s.status} />
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-6">
            <ConfigBadge>
              Această pagină este o interfață demonstrativă — nu este conectată la monitorizare
              live. Statusul real va fi afișat după integrarea monitorizării.
            </ConfigBadge>
          </Reveal>
        </div>
      </section>
    </>
  );
}
