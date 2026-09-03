"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TLD_SUGGESTIONS = [".ro", ".com", ".net", ".eu", ".dev"];

export function DomainSearch() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="border-b border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="DOMENII"
            title="Găsește domeniul potrivit"
            description="Interfața de căutare este pregătită — integrarea cu un registrar real urmează să fie conectată."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row"
          >
            <label htmlFor="domain-search" className="sr-only">
              Caută un domeniu
            </label>
            <Input
              id="domain-search"
              type="text"
              placeholder="example.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 border-border-strong bg-surface-elevated text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              className="h-11 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              Caută domeniu
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {TLD_SUGGESTIONS.map((tld) => (
              <span
                key={tld}
                className="rounded-full border border-border px-3 py-1 font-data text-xs text-muted-foreground"
              >
                {tld}
              </span>
            ))}
          </div>

          {submitted ? (
            <div className="mt-6 rounded-lg border border-dashed border-warning/50 bg-warning/5 p-5 text-center">
              <p className="text-sm text-foreground/90">
                Căutarea pentru <span className="font-medium">{query || "domeniul introdus"}</span> nu
                este încă disponibilă — integrarea cu un registrar de domenii nu este conectată.
              </p>
              <ConfigBadge className="mt-3">Domain registrar integration: TODO</ConfigBadge>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
