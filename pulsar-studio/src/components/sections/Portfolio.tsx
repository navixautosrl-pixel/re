import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { portfolioItems } from "@/lib/constants";

const patterns = [
  "var(--gradient-blue-cyan)",
  "var(--gradient-blue-purple)",
  "var(--gradient-purple-pink)",
  "var(--gradient-blue-cyan)",
];

// Deliberately uneven: the grid alternates 7/5 and 5/7 so the row rhythm
// never settles into the uniform 2x2 the rest of the web defaults to.
const spans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];
const heights = ["lg:h-[30rem]", "lg:h-[30rem]", "lg:h-[26rem]", "lg:h-[26rem]"];

export function Portfolio() {
  return (
    <section id="portofoliu" className="section-y relative">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:col-span-6">
            Concepte, nu promisiuni goale.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground lg:col-span-5 lg:col-start-8">
            Nu avem încă proiecte publice de arătat aici — în loc să inventăm clienți, iată 4 demo-uri complete și
            funcționale ale tipului de website pe care îl construim. Apasă pe oricare pentru a-l explora.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:gap-6 lg:grid-cols-12">
          {portfolioItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.07} className={spans[i % spans.length]}>
              <Link
                href={item.href}
                className={`group relative block h-80 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-2 sm:h-96 ${heights[i % heights.length]}`}
              >
                {/* Colour field fills the whole tile — the copy sits on it,
                    instead of in a separate white card body underneath. */}
                <div
                  className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
                  style={{ background: patterns[i % patterns.length] }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.22),transparent_58%)]" />
                {/* Scrim: keeps the title readable over any part of the field. */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05081699] via-[#05081633] to-transparent" />

                <span className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                  Demo Concept
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/75">{item.category}</p>
                    <h3 className="font-display mt-2 text-2xl font-semibold text-white transition-transform duration-500 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">{item.description}</p>
                  </div>

                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/20 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-premium)] group-hover:rotate-45 group-hover:border-white group-hover:bg-white">
                    <ArrowUpRight
                      className="size-5 text-white transition-colors duration-500 group-hover:text-black"
                      aria-hidden="true"
                    />
                  </span>
                </div>
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
