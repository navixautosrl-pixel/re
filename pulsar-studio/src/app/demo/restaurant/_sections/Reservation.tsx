"use client";

import { useState, type FormEvent } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Loader2, CheckCircle2, AlertCircle, Check, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { submitDemoForm } from "@/lib/demoForm";
import { useDemoPortalContainer } from "@/lib/useDemoPortalContainer";
import { partySizes, restaurant } from "../data";

function PartySizeSelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  const container = useDemoPortalContainer();
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        id="r-party"
        className="flex w-full items-center justify-between gap-2 border-b bg-transparent py-3 text-left text-base text-[var(--r-fg)] focus-visible:outline-none"
        style={{ borderColor: "var(--r-border)" }}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon>
          <ChevronDown className="size-4" style={{ color: "var(--r-muted)" }} aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={container}>
        <RadixSelect.Content
          position="popper"
          sideOffset={8}
          className="z-[70] max-h-64 overflow-hidden rounded-md border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]"
          style={{ background: "var(--r-surface-2)", borderColor: "var(--r-border)" }}
        >
          <RadixSelect.Viewport className="p-1.5">
            {partySizes.map((option) => (
              <RadixSelect.Item
                key={option}
                value={option}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-sm text-[var(--r-fg)] outline-none data-[highlighted]:bg-white/[0.06]"
              >
                <RadixSelect.ItemText>{option}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="size-3.5" style={{ color: "var(--r-accent)" }} aria-hidden="true" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"name" | "phone" | "date" | "time", string>>;

const inputClasses =
  "w-full border-b bg-transparent py-3 text-base text-[var(--r-fg)] placeholder:text-[var(--r-muted)]/60 focus-visible:outline-none transition-colors";

export function RestaurantReservation() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ name: "", phone: "", date: "", time: "", partySize: partySizes[1], notes: "" });

  function validate(): boolean {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Te rugăm să introduci numele tău.";
    if (values.phone.trim().length < 7) next.phone = "Te rugăm să introduci un număr de telefon valid.";
    if (!values.date) next.date = "Alege o dată.";
    if (!values.time) next.time = "Alege o oră.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      await submitDemoForm(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="rezervare" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--r-bg)" }}>
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--r-accent)" }}>
            Rezervări
          </p>
          <h2 className="font-restaurant mt-3 text-4xl text-[var(--r-fg)] sm:text-5xl">Rezervă o masă</h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 rounded-lg border p-6 sm:p-9" style={{ borderColor: "var(--r-border)", background: "var(--r-surface)" }}>
          {status === "success" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="size-10" style={{ color: "var(--r-accent)" }} aria-hidden="true" />
              <p className="font-restaurant mt-6 text-3xl text-[var(--r-fg)]">Cerere trimisă.</p>
              <p className="mt-3 max-w-sm" style={{ color: "var(--r-muted)" }}>
                Îți mulțumim! Confirmăm rezervarea telefonic în cel mai scurt timp.
              </p>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="r-name" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--r-muted)" }}>
                    Nume
                  </label>
                  <input
                    id="r-name"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    className={inputClasses}
                    style={{ borderColor: "var(--r-border)" }}
                  />
                  {errors.name ? <p className="mt-2 text-xs text-red-400">{errors.name}</p> : null}
                </div>
                <div>
                  <label htmlFor="r-phone" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--r-muted)" }}>
                    Telefon
                  </label>
                  <input
                    id="r-phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                    className={inputClasses}
                    style={{ borderColor: "var(--r-border)" }}
                  />
                  {errors.phone ? <p className="mt-2 text-xs text-red-400">{errors.phone}</p> : null}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="r-date" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--r-muted)" }}>
                    Dată
                  </label>
                  <input
                    id="r-date"
                    type="date"
                    value={values.date}
                    onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
                    className={inputClasses}
                    style={{ borderColor: "var(--r-border)", colorScheme: "dark" }}
                  />
                  {errors.date ? <p className="mt-2 text-xs text-red-400">{errors.date}</p> : null}
                </div>
                <div>
                  <label htmlFor="r-time" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--r-muted)" }}>
                    Oră
                  </label>
                  <input
                    id="r-time"
                    type="time"
                    value={values.time}
                    onChange={(e) => setValues((v) => ({ ...v, time: e.target.value }))}
                    className={inputClasses}
                    style={{ borderColor: "var(--r-border)", colorScheme: "dark" }}
                  />
                  {errors.time ? <p className="mt-2 text-xs text-red-400">{errors.time}</p> : null}
                </div>
                <div>
                  <label htmlFor="r-party" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--r-muted)" }}>
                    Persoane
                  </label>
                  <PartySizeSelect
                    value={values.partySize}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, partySize: v }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="r-notes" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--r-muted)" }}>
                  Mențiuni <span className="normal-case opacity-70">(opțional)</span>
                </label>
                <textarea
                  id="r-notes"
                  rows={2}
                  value={values.notes}
                  onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                  className={`${inputClasses} resize-none`}
                  style={{ borderColor: "var(--r-border)" }}
                />
              </div>

              {status === "error" ? (
                <div className="flex items-start gap-3 rounded-md border border-red-400/30 bg-red-400/5 p-4">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
                  <p className="text-sm" style={{ color: "var(--r-fg)" }}>
                    Formularul demo nu este conectat la un sistem real de rezervări. Pentru o rezervare reală, sună la{" "}
                    <span style={{ color: "var(--r-accent)" }}>{restaurant.phone}</span>.
                  </p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-fit items-center gap-2.5 rounded-full px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
                style={{ background: "var(--r-accent)", color: "var(--r-bg)" }}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Se trimite...
                  </>
                ) : (
                  "Trimite cererea"
                )}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
