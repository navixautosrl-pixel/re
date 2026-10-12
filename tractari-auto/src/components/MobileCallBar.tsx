import Link from "next/link";
import { telHref } from "@/components/CallButtons";

/** Phones: the two things a stranded driver needs, always one thumb away. */
export function MobileCallBar() {
  const tel = telHref();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-rule bg-card p-2 pb-[max(.5rem,env(safe-area-inset-bottom))] md:hidden">
      <Link href="/calculator/" className="btn btn-sign min-h-12">Calculează prețul</Link>
      {tel ? (
        <a href={tel} className="btn btn-beacon min-h-12">Sună acum</a>
      ) : (
        <span className="btn btn-beacon min-h-12" aria-disabled="true" data-placeholder="phone">Sună acum ✎</span>
      )}
    </div>
  );
}
