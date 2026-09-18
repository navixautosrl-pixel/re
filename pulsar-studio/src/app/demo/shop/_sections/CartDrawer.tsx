"use client";

import { useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCart } from "../_lib/CartContext";
import { submitDemoForm } from "@/lib/demoForm";
import { useDemoPortalContainer } from "@/lib/useDemoPortalContainer";
import { romanianValidation } from "@/lib/validationMessages";

type Step = "cart" | "checkout" | "loading" | "success" | "error";

export function ShopCartDrawer() {
  const { lines, setQty, remove, total, open, setOpen } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [email, setEmail] = useState("");
  const container = useDemoPortalContainer();

  function handleClose(v: boolean) {
    setOpen(v);
    if (!v) window.setTimeout(() => setStep("cart"), 300);
  }

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    setStep("loading");
    try {
      await submitDemoForm({ email, lines });
      setStep("success");
    } catch {
      setStep("error");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount container={container}>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[95] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-y-0 right-0 z-[96] flex w-full max-w-md flex-col"
                style={{ background: "var(--s-bg)" }}
              >
                <Dialog.Title className="sr-only">Coș de cumpărături</Dialog.Title>
                <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: "var(--s-border)" }}>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--s-fg)]">
                    <ShoppingBag className="size-4" aria-hidden="true" />
                    {step === "checkout" ? "Finalizare comandă" : "Coșul tău"}
                  </h2>
                  <Dialog.Close asChild>
                    <button type="button" aria-label="Închide" className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5">
                      <X className="size-4" style={{ color: "var(--s-fg)" }} aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {step === "cart" || step === "checkout" ? (
                    lines.length === 0 ? (
                      <p className="py-12 text-center text-sm" style={{ color: "var(--s-muted)" }}>
                        Coșul este gol.
                      </p>
                    ) : (
                      <ul className="space-y-5">
                        {lines.map((line) => (
                          <li key={line.product.id} className="flex gap-4">
                            <div className="size-16 shrink-0 rounded-md" style={{ background: line.product.color }} />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-[var(--s-fg)]">{line.product.name}</p>
                                {step === "cart" ? (
                                  <button type="button" onClick={() => remove(line.product.id)} className="text-xs" style={{ color: "var(--s-muted)" }}>
                                    Șterge
                                  </button>
                                ) : null}
                              </div>
                              <p className="text-xs" style={{ color: "var(--s-muted)" }}>
                                {line.product.price} lei
                              </p>
                              {step === "cart" ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setQty(line.product.id, line.qty - 1)}
                                    className="flex size-9 items-center justify-center rounded-full border"
                                    style={{ borderColor: "var(--s-border)" }}
                                    aria-label="Scade cantitatea"
                                  >
                                    <Minus className="size-3.5" style={{ color: "var(--s-fg)" }} aria-hidden="true" />
                                  </button>
                                  <span className="w-5 text-center text-sm text-[var(--s-fg)]">{line.qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => setQty(line.product.id, line.qty + 1)}
                                    className="flex size-9 items-center justify-center rounded-full border"
                                    style={{ borderColor: "var(--s-border)" }}
                                    aria-label="Crește cantitatea"
                                  >
                                    <Plus className="size-3.5" style={{ color: "var(--s-fg)" }} aria-hidden="true" />
                                  </button>
                                </div>
                              ) : (
                                <p className="mt-1 text-xs" style={{ color: "var(--s-muted)" }}>
                                  Cantitate: {line.qty}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : null}

                  {step === "checkout" ? (
                    <form id="checkout-form" onSubmit={handleCheckout} className="mt-6 border-t pt-6" style={{ borderColor: "var(--s-border)" }}>
                      <label htmlFor="checkout-email" className="text-xs uppercase tracking-wide" style={{ color: "var(--s-muted)" }}>
                        Email pentru confirmare
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        required
                        {...romanianValidation}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-md border px-3 py-2.5 text-sm text-[var(--s-fg)] focus-visible:outline-none"
                        style={{ borderColor: "var(--s-border)", background: "var(--s-surface)" }}
                      />
                    </form>
                  ) : null}

                  {step === "loading" ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="size-8 animate-spin" style={{ color: "var(--s-accent)" }} aria-hidden="true" />
                      <p className="mt-4 text-sm" style={{ color: "var(--s-muted)" }}>
                        Se procesează comanda demo...
                      </p>
                    </div>
                  ) : null}

                  {step === "success" ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <CheckCircle2 className="size-10" style={{ color: "var(--s-accent-2)" }} aria-hidden="true" />
                      <p className="mt-4 text-lg font-semibold text-[var(--s-fg)]">Comandă demo trimisă.</p>
                      <p className="mt-2 max-w-xs text-sm" style={{ color: "var(--s-muted)" }}>
                        Acesta este un checkout demonstrativ — nu s-a procesat nicio plată reală.
                      </p>
                    </div>
                  ) : null}

                  {step === "error" ? (
                    <div className="mt-4 flex items-start gap-3 rounded-md border border-red-400/30 bg-red-400/5 p-4">
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
                      <p className="text-sm" style={{ color: "var(--s-fg)" }}>
                        Checkout-ul demo nu este conectat la un procesator de plăți real.
                      </p>
                    </div>
                  ) : null}
                </div>

                {(step === "cart" || step === "checkout") && lines.length > 0 ? (
                  <div className="border-t px-6 py-5" style={{ borderColor: "var(--s-border)" }}>
                    <div className="flex items-center justify-between text-sm font-semibold text-[var(--s-fg)]">
                      <span>Total</span>
                      <span>{total} lei</span>
                    </div>
                    {step === "cart" ? (
                      <button
                        type="button"
                        onClick={() => setStep("checkout")}
                        className="mt-4 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                        style={{ background: "var(--s-fg)" }}
                      >
                        Finalizează comanda
                      </button>
                    ) : (
                      <button
                        type="submit"
                        form="checkout-form"
                        className="mt-4 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                        style={{ background: "var(--s-fg)" }}
                      >
                        Trimite comanda (demo)
                      </button>
                    )}
                  </div>
                ) : null}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
