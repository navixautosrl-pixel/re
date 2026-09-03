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
      <PageHeader eyebrow="Status" title="Status infrastructură" />

      <section className="section-y">
        <div className="mx-auto max-w-2xl px-6 lg:px-10">
          <Reveal>
            <div className="flex items-center gap-3 rounded-md border border-success/30 p-5">
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" strokeWidth={1.5} />
              <p className="text-lg font-medium">
                {allOperational ? "All Systems Operational" : "Probleme raportate"}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-6 flex flex-col">
            {statusServices.map((s) => (
              <StatusIndicator key={s.name} name={s.name} status={s.status} />
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-6">
            <ConfigBadge>
              Interfață demonstrativă — nu este conectată la monitorizare live încă.
            </ConfigBadge>
          </Reveal>
        </div>
      </section>
    </>
  );
}
