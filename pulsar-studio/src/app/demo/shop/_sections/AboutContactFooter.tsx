"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { submitDemoForm } from "@/lib/demoForm";
import { shop } from "../data";

export function ShopAboutContactFooter() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitDemoForm({ email });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section id="despre" className="px-5 py-20 sm:px-8" style={{ background: "var(--s-surface-2)" }}>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--s-fg)] sm:text-4xl">Materiale simple. Producție mică.</h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--s-muted)" }}>
            {shop.name} lucrează cu ateliere mici, în serii limitate. Fiecare obiect e gândit să reziste ani buni, nu un
            sezon — de aceea colecția rămâne restrânsă și se schimbă rar.
          </p>
        </Reveal>
      </section>

      <section id="contact" className="px-5 py-20 sm:px-8" style={{ background: "var(--s-bg)" }}>
        <Reveal className="mx-auto max-w-md text-center">
          <h2 className="text-2xl font-semibold text-[var(--s-fg)]">Rămâi la curent</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--s-muted)" }}>
            Abonează-te pentru noutăți despre colecții și restock-uri.
          </p>

          {status === "success" ? (
            <div className="mt-6 flex flex-col items-center gap-2">
              <CheckCircle2 className="size-8" style={{ color: "var(--s-accent-2)" }} aria-hidden="true" />
              <p className="text-sm text-[var(--s-fg)]">Te-ai abonat cu succes (demo).</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresa@email.ro"
                aria-label="Adresă de email"
                className="flex-1 rounded-full border px-4 py-3 text-sm text-[var(--s-fg)] placeholder:text-[var(--s-muted)] focus-visible:outline-none"
                style={{ borderColor: "var(--s-border)", background: "var(--s-surface)" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
                style={{ background: "var(--s-fg)" }}
              >
                {status === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : "Abonează-te"}
              </button>
            </form>
          )}
          {status === "error" ? (
            <div className="mt-4 flex items-start gap-2 text-left text-sm" style={{ color: "var(--s-muted)" }}>
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Formularul demo nu este conectat la un sistem real de email.
            </div>
          ) : null}
        </Reveal>
      </section>

      <footer className="border-t px-5 py-10 text-center sm:px-8" style={{ borderColor: "var(--s-border)", background: "var(--s-surface-2)" }}>
        <p className="text-lg font-semibold text-[var(--s-fg)]">{shop.name}</p>
        <p className="mt-2 text-xs" style={{ color: "var(--s-muted)" }}>
          Demo concept construit de Pulsar Studio · Nu este o afacere reală
        </p>
      </footer>
    </>
  );
}
