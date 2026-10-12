import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[70svh] content-center pb-20 pt-28">
      <p className="text-[length:var(--step-4)] font-[850] text-sign" aria-hidden="true">404</p>
      <h1 className="mt-2 text-[length:var(--step-3)]">Drum închis</h1>
      <p className="mt-3 text-ink-2">Pagina nu există sau a fost mutată.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/calculator/" className="btn btn-beacon">Calculator preț</Link>
        <Link href="/" className="btn btn-line">Pagina principală</Link>
      </div>
    </div>
  );
}
