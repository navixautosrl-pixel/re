"use client";

import { useState, type FormEvent } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Loader2, CheckCircle2, AlertCircle, Check, ChevronDown, MapPin, Phone, Clock } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { submitDemoForm } from "@/lib/demoForm";
import { useDemoPortalContainer } from "@/lib/useDemoPortalContainer";
import { goalOptions, gym } from "../data";

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"name" | "phone", string>>;

const inputClasses = "w-full border-b bg-transparent py-3 text-base text-[var(--f-fg)] focus-visible:outline-none";

function GoalSelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  const container = useDemoPortalContainer();
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        id="f-goal"
        className="flex w-full items-center justify-between gap-2 border-b bg-transparent py-3 text-left text-base text-[var(--f-fg)] focus-visible:outline-none"
        style={{ borderColor: "var(--f-border)" }}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon>
          <ChevronDown className="size-4" style={{ color: "var(--f-muted)" }} aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={container}>
        <RadixSelect.Content position="popper" sideOffset={8} className="z-[70] max-h-64 overflow-hidden rounded-md border" style={{ background: "var(--f-surface-2)", borderColor: "var(--f-border)" }}>
          <RadixSelect.Viewport className="p-1.5">
            {goalOptions.map((option) => (
              <RadixSelect.Item
                key={option}
                value={option}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-sm text-[var(--f-fg)] outline-none data-[highlighted]:bg-white/[0.06]"
              >
                <RadixSelect.ItemText>{option}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="size-3.5" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function FitnessContactFooter() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ name: "", phone: "", goal: goalOptions[0] });

  function validate(): boolean {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Te rugăm să introduci numele tău.";
    if (values.phone.trim().length < 7) next.phone = "Te rugăm să introduci un număr de telefon valid.";
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
    <>
      <section id="contact" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--f-surface)" }}>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--f-accent)" }}>
              Contact
            </p>
            <h2 className="font-fitness mt-3 text-4xl uppercase text-[var(--f-fg)] sm:text-5xl">Hai să începem.</h2>
            <div className="mt-7 space-y-4 text-base text-[var(--f-fg)]">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                {gym.address}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 shrink-0" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                {gym.phone}
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                {gym.hours}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-md border p-6 sm:p-8" style={{ borderColor: "var(--f-border)", background: "var(--f-surface-2)" }}>
            {status === "success" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="size-10" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                <p className="font-fitness mt-5 text-2xl uppercase text-[var(--f-fg)]">Cerere trimisă.</p>
                <p className="mt-3 max-w-sm" style={{ color: "var(--f-muted)" }}>
                  Te contactăm în cel mai scurt timp pentru un antrenament de probă.
                </p>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="f-name" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--f-muted)" }}>
                      Nume
                    </label>
                    <input id="f-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className={inputClasses} style={{ borderColor: "var(--f-border)" }} />
                    {errors.name ? <p className="mt-2 text-xs text-red-400">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label htmlFor="f-phone" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--f-muted)" }}>
                      Telefon
                    </label>
                    <input id="f-phone" type="tel" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} className={inputClasses} style={{ borderColor: "var(--f-border)" }} />
                    {errors.phone ? <p className="mt-2 text-xs text-red-400">{errors.phone}</p> : null}
                  </div>
                </div>

                <div>
                  <label htmlFor="f-goal" className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--f-muted)" }}>
                    Obiectiv
                  </label>
                  <GoalSelect value={values.goal} onValueChange={(v) => setValues((prev) => ({ ...prev, goal: v }))} />
                </div>

                {status === "error" ? (
                  <div className="flex items-start gap-3 rounded-md border border-red-400/30 bg-red-400/5 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
                    <p className="text-sm text-[var(--f-fg)]">
                      Formularul demo nu este conectat la un sistem real. Pentru înscriere reală, sună la{" "}
                      <span style={{ color: "var(--f-accent)" }}>{gym.phone}</span>.
                    </p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex w-fit items-center gap-2.5 rounded-md px-8 py-4 text-sm font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
                  style={{ background: "var(--f-accent)", color: "#0a0a0a" }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Se trimite...
                    </>
                  ) : (
                    "Vreau un antrenament de probă"
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-center sm:px-8" style={{ borderColor: "var(--f-border)", background: "var(--f-bg)" }}>
        <p className="font-fitness text-xl uppercase text-[var(--f-fg)]">{gym.name}</p>
        <p className="mt-2 text-xs" style={{ color: "var(--f-muted)" }}>
          Demo concept construit de CreareWebsitePro · Nu este o afacere reală
        </p>
      </footer>
    </>
  );
}
