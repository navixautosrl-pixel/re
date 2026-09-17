"use client";

import { useState, type FormEvent } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Loader2, CheckCircle2, AlertCircle, Check, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { submitDemoForm } from "@/lib/demoForm";
import { useDemoPortalContainer } from "@/lib/useDemoPortalContainer";
import { agency, projectTypeOptions } from "../data";

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"name" | "email", string>>;

function ProjectTypeSelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  const container = useDemoPortalContainer();
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger className="flex w-full items-center justify-between gap-2 border-b bg-transparent py-3 text-left text-base text-[var(--a-fg)] focus-visible:outline-none" style={{ borderColor: "var(--a-border)" }}>
        <RadixSelect.Value />
        <RadixSelect.Icon>
          <ChevronDown className="size-4" style={{ color: "var(--a-muted)" }} aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={container}>
        <RadixSelect.Content position="popper" sideOffset={8} className="z-[70] max-h-64 overflow-hidden rounded-md border shadow-lg" style={{ background: "white", borderColor: "var(--a-border)" }}>
          <RadixSelect.Viewport className="p-1.5">
            {projectTypeOptions.map((option) => (
              <RadixSelect.Item key={option} value={option} className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-sm text-black outline-none data-[highlighted]:bg-black/5">
                <RadixSelect.ItemText>{option}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="size-3.5" style={{ color: "var(--a-accent)" }} aria-hidden="true" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function AgencyContactFooter() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ name: "", email: "", projectType: projectTypeOptions[0], message: "" });

  function validate(): boolean {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Te rugăm să introduci numele tău.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Te rugăm să introduci o adresă de email validă.";
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
      <section id="contact" className="px-5 py-24 sm:px-8" style={{ background: "var(--a-surface)" }}>
        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--a-accent)" }}>
              Contact
            </p>
            <h2 className="font-agency mt-4 text-4xl uppercase text-[var(--a-fg)] sm:text-5xl">Hai să vorbim.</h2>
            <a href={`mailto:${agency.email}`} className="mt-5 inline-block text-sm font-medium text-[var(--a-fg)] hover:underline">
              {agency.email}
            </a>
          </Reveal>

          <Reveal delay={0.1} className="rounded-lg border p-6 sm:p-8" style={{ borderColor: "var(--a-border)", background: "white" }}>
            {status === "success" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="size-10" style={{ color: "var(--a-accent)" }} aria-hidden="true" />
                <p className="font-agency mt-5 text-xl uppercase text-black">Mesaj trimis.</p>
                <p className="mt-2 max-w-xs text-sm text-black/60">Revenim în cel mai scurt timp.</p>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="a-name" className="text-xs uppercase tracking-[0.1em] text-black/50">
                      Nume
                    </label>
                    <input id="a-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className="w-full border-b border-black/15 bg-transparent py-3 text-base text-black focus-visible:outline-none" />
                    {errors.name ? <p className="mt-2 text-xs text-red-500">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label htmlFor="a-email" className="text-xs uppercase tracking-[0.1em] text-black/50">
                      Email
                    </label>
                    <input id="a-email" type="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} className="w-full border-b border-black/15 bg-transparent py-3 text-base text-black focus-visible:outline-none" />
                    {errors.email ? <p className="mt-2 text-xs text-red-500">{errors.email}</p> : null}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.1em] text-black/50">Tip proiect</label>
                  <ProjectTypeSelect value={values.projectType} onValueChange={(v) => setValues((prev) => ({ ...prev, projectType: v }))} />
                </div>

                <div>
                  <label htmlFor="a-message" className="text-xs uppercase tracking-[0.1em] text-black/50">
                    Mesaj
                  </label>
                  <textarea id="a-message" rows={3} value={values.message} onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))} className="w-full resize-none border-b border-black/15 bg-transparent py-3 text-base text-black focus-visible:outline-none" />
                </div>

                {status === "error" ? (
                  <div className="flex items-start gap-3 rounded-md border border-red-300 bg-red-50 p-4">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
                    <p className="text-sm text-black/70">
                      Formularul demo nu este conectat la un sistem real. Scrie-ne direct la{" "}
                      <span style={{ color: "var(--a-accent)" }}>{agency.email}</span>.
                    </p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex w-fit items-center gap-2.5 rounded-full px-8 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
                  style={{ background: "var(--a-fg)" }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Se trimite...
                    </>
                  ) : (
                    "Trimite mesajul"
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-center sm:px-8" style={{ borderColor: "var(--a-border)", background: "var(--a-bg)" }}>
        <p className="font-agency text-lg uppercase text-[var(--a-fg)]">{agency.name}</p>
        <p className="mt-2 text-xs" style={{ color: "var(--a-muted)" }}>
          Demo concept construit de Pulsar Studio · Nu este o afacere reală
        </p>
      </footer>
    </>
  );
}
