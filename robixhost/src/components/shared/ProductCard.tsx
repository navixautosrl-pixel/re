import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { iconMap } from "./icon-map";
import type { ProductCategory } from "@/lib/constants";

/**
 * A row in the products system-table, not a card in a grid — see
 * HostingProducts.tsx. Presenting five products as five identical boxed
 * cards reads as a generic "features grid"; a single scannable list with
 * a consistent row grammar reads as a product line.
 */
export function ProductCard({ product, index }: { product: ProductCategory; index: number }) {
  const Icon = iconMap[product.icon] ?? iconMap.server;
  return (
    <Link
      href={product.href}
      className="group grid grid-cols-1 gap-4 border-t border-border py-8 transition-colors first:border-t-0 sm:grid-cols-12 sm:items-center sm:gap-6"
    >
      <div className="flex items-center gap-4 sm:col-span-4">
        <span className="font-mono-tech text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
        <h3 className="text-lg font-medium">{product.name}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-6">
        {product.description}
      </p>
      <div className="flex items-center gap-2 text-sm text-foreground sm:col-span-2 sm:justify-end">
        <span className="hidden sm:inline">Detalii</span>
        <ArrowUpRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
