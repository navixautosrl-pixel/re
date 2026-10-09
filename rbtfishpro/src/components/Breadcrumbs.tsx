import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Acasă", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Firimituri" className="text-[length:var(--step--1)] text-mist-2">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-moss">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="inline-block py-0.5 text-mist">{it.name}</span>
              ) : (
                <Link href={it.path} className="link inline-block min-w-6 py-0.5 text-center">{it.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}
