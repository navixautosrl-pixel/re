import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.08]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Ready to deploy?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Alege planul potrivit și pornește în câteva minute — infrastructura e deja pregătită.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/pricing">Alege hostingul</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
