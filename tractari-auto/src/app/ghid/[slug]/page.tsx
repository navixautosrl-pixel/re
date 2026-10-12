import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANDINGS, landingBySlug } from "@/data/landings";
import { LandingPage } from "@/components/LandingPage";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return LANDINGS.filter((l) => l.group === "ghid").map((l) => ({ slug: l.slug.replace("ghid/", "") }));
}
export async function generateMetadata({ params }: PageProps<"/ghid/[slug]">): Promise<Metadata> {
  const l = landingBySlug(`ghid/${(await params).slug}`);
  return l ? pageMeta({ title: l.title, description: l.description, path: `/${l.slug}/` }) : {};
}
export default async function Page({ params }: PageProps<"/ghid/[slug]">) {
  const l = landingBySlug(`ghid/${(await params).slug}`);
  if (!l) notFound();
  return <LandingPage l={l} />;
}
