import { site } from "@/config/site";
import { formatBani, toBani } from "@/lib/format";
import { t } from "@/i18n/ro";

/** A price, flagged as an example until site.catalog.pricesConfirmed is true. */
export function Price({ lei, className = "" }: { lei: number; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="tabular font-semibold">{formatBani(toBani(lei))}</span>
      {!site.catalog.pricesConfirmed && (
        <span className="ph text-[length:var(--step--1)]" data-placeholder="price">{t.product.examplePrice}</span>
      )}
    </span>
  );
}
