import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { TiltCard } from "@/components/shared/TiltCard";
import { Button } from "@/components/ui/Button";
import { portfolioItems } from "@/lib/constants";

const patterns = [
  "var(--gradient-blue-cyan)",
  "var(--gradient-blue-purple)",
  "var(--gradient-purple-pink)",
  "var(--gradient-blue-cyan)",
];

export function Portfolio() {
  return (
    <section id="portofoliu" className="section-y relative">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Concepte, nu <span className="gradient-text">promisiuni goale.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Nu avem încă proiecte publice de arătat aici — în loc să inventăm clienți, iată 4 demo-uri complete și
            funcționale ale tipului de website pe care îl construim. Apasă pe oricare pentru a-l explora.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {portfolioItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <Link href={item.href} className="block">
                <TiltCard className="group overflow-hidden p-0">
                  <div className="relative h-44 overflow-hidden" style={{ background: patterns[i % patterns.length] }}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)] transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-110" />
                    <span className="glass absolute right-3 top-3 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white">
                      Demo Concept
                    </span>
                    <span className="glass absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white opacity-100 transition-all duration-300 ease-[var(--ease-premium)] sm:opacity-0 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                      Vezi demo
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-2">{item.category}</p>
                    <h3 className="font-display mt-2 text-lg font-semibold text-foreground transition-colors group-hover:text-accent-2">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <Button href="#contact" variant="outline" icon={false} className="rounded-full">
            Discută un proiect asemănător
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
