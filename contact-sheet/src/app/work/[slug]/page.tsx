import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Shot } from "@/components/Shot";
import { JsonLd } from "@/components/JsonLd";
import { bySlug, projects, shortName } from "@/lib/projects";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

const describe = (p: NonNullable<ReturnType<typeof bySlug>>) =>
  `${shortName(p)}: screenshots of its production build, its stack (${p.stack.join(", ")}) and its history in this repository.`;

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  return {
    title: shortName(p),
    description: describe(p),
    alternates: { canonical: `/work/${p.slug}/` },
  };
}

export default async function Work({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];

  const facts: [string, string][] = [
    ["Page title", p.title],
    ["Built with", p.stack.join(", ")],
    ...(p.fonts.length ? [["Typefaces", p.fonts.join(", ")] as [string, string]] : []),
    ...(p.htmlPages ? [["HTML pages", String(p.htmlPages)] as [string, string]] : []),
    ["Commits", `${p.commits} (${p.firstCommit === p.lastCommit ? p.firstCommit : `${p.firstCommit} to ${p.lastCommit}`})`],
    ["Latest change", p.lastMessage],
    ["Folder", `${p.slug}/`],
  ];

  return (
    <main id="main" className="mx-auto w-[min(100%-2rem,78rem)] pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2">
        <ol className="flex gap-2">
          <li><Link href="/" className="underline decoration-rule underline-offset-4 hover:decoration-pencil">Sheet</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{shortName(p)}</li>
        </ol>
      </nav>
      <h1 className="display mt-6 text-[length:var(--step-5)]">{shortName(p)}</h1>

      <div className="film mt-8 rounded-[var(--radius-frame)] px-3 sm:px-4">
        <ViewTransition name={`frame-${p.slug}`} share="frame-morph" default="none">
          <div className="overflow-hidden rounded-[1px]">
            <Shot slug={p.slug} view="desktop" alt={`${shortName(p)}: desktop screenshot of its production build`} sizes="(min-width: 1260px) 76rem, 94vw" eager className="aspect-[16/10] w-full object-cover object-top" />
          </div>
        </ViewTransition>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_15rem] md:gap-16">
        <dl className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-[10rem_1fr]">
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-sm font-semibold text-ink-2 sm:pt-0.5">{k}</dt>
              <dd className="border-b border-rule pb-4 sm:pb-5">{v}</dd>
            </div>
          ))}
        </dl>
        <figure>
          <Shot slug={p.slug} view="mobile" alt={`${shortName(p)} at 390 px wide`} sizes="15rem" className="aspect-[390/844] w-full rounded-[12px] border border-rule object-cover object-top" />
          <figcaption className="mt-2 text-sm text-ink-2">At 390 px.{p.hiddenCookieBanner ? " Cookie banner hidden for the capture." : ""}</figcaption>
        </figure>
      </div>

      <nav aria-label="More sites" className="mt-16 flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <Link href={`/work/${prev.slug}/`} className="min-h-11 font-semibold underline decoration-pencil decoration-2 underline-offset-[6px]">Previous: {shortName(prev)}</Link>
        <Link href={`/work/${next.slug}/`} className="min-h-11 font-semibold underline decoration-pencil decoration-2 underline-offset-[6px]">Next: {shortName(next)}</Link>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", "@id": `${site.url}/work/${p.slug}/#page`, url: `${site.url}/work/${p.slug}/`, name: shortName(p), description: describe(p), isPartOf: { "@id": `${site.url}/#website` } },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Sheet", item: `${site.url}/` },
                { "@type": "ListItem", position: 2, name: shortName(p), item: `${site.url}/work/${p.slug}/` },
              ],
            },
          ],
        }}
      />
    </main>
  );
}
