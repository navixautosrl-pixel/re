import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pagină negăsită",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-5 text-center">
      <div className="gradient-mesh" aria-hidden="true" />
      <div className="grid-field absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="relative z-10">
        <p className="gradient-text font-display text-[7rem] font-semibold leading-none sm:text-[9rem]">404</p>
        <h1 className="font-display mt-4 text-2xl font-semibold text-foreground sm:text-3xl">Pagina nu există</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Fie a fost mutată, fie adresa nu este corectă. Te ducem înapoi acasă.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button href="/" variant="primary" size="lg">
            Înapoi acasă
          </Button>
          <Button href="/#contact" variant="outline" size="lg" icon={false} className="rounded-full">
            Contactează-ne
          </Button>
        </div>
      </div>
    </main>
  );
}
