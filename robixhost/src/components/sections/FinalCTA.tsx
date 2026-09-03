import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function FinalCTA({ index }: { index?: string } = {}) {
  return (
    <section className="relative section-y-lg">
      <div className="absolute inset-0 bg-grid opacity-[0.05]" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl px-6 text-center lg:px-10">
        <p className="font-mono-tech text-xs uppercase tracking-[0.08em] text-accent">
          {index ? `${index} — ` : ""}Deploy
        </p>
        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
          Ready to deploy?
        </h2>
        <p className="mt-5 text-muted-foreground">
          Alege planul potrivit și pornești în câteva minute — infrastructura e deja pregătită.
        </p>
        <div className="mt-9">
          <MagneticButton>
            <Button asChild size="lg" variant="primary">
              <Link href="/pricing">Alege hostingul</Link>
            </Button>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
