import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[70svh] content-center pb-24 pt-28">
      <p className="display text-[length:var(--step-5)] text-moss" aria-hidden="true">404</p>
      <h1 className="display mt-2 text-[length:var(--step-3)]">Aici nu trage nimic</h1>
      <p className="mt-4 text-mist-2">Pagina nu există sau a fost mutată.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/magazin" className="btn btn-primary">Mergi la magazin</Link>
        <Link href="/" className="btn btn-ghost">Pagina principală</Link>
      </div>
    </div>
  );
}
