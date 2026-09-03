import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { iconMap } from "./icon-map";
import type { ProductCategory } from "@/lib/constants";

export function ProductCard({ product }: { product: ProductCategory }) {
  const Icon = iconMap[product.icon] ?? iconMap.server;
  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/60 focus-visible:border-primary/60"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-elevated text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{product.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm text-foreground/90">
        {product.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {b}
          </li>
        ))}
      </ul>
    </Link>
  );
}
