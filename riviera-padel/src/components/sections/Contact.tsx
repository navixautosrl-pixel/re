"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { siteConfig } from "@/lib/constants";
import { submitContactForm } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"name" | "phone" | "message", string>>;

const inputClasses =
  "w-full border-b border-border-strong bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:outline-none transition-colors";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ name: "", phone: "", email: "", message: "" });

  function validate(): boolean {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Te rugăm să introduci numele tău.";
    if (values.phone.trim().length < 7) next.phone = "Te rugăm să introduci un număr de telefon valid.";
    if (values.message.trim().length < 5) next.message = "Spune-ne pe scurt ce te interesează.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      await submitContactForm(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <SectionShell>
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircle2 className="size-10 text-accent" aria-hidden="true" />
          <p className="font-display mt-6 text-4xl uppercase text-foreground">Mesaj trimis.</p>
          <p className="mt-3 max-w-sm text-muted-foreground">Îți mulțumim! Te contactăm în cel mai scurt timp.</p>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
            <h2 className="font-display mt-4 text-6xl uppercase leading-[0.9] tracking-[-0.01em] text-foreground sm:text-7xl">
              Hai la
              <br />
              Riviera.
            </h2>
            <div className="mt-10 flex flex-col gap-3 text-base text-foreground/85">
              <a href={siteConfig.phoneHref} className="transition-colors hover:text-accent">
                {siteConfig.phoneDisplay}
              </a>
              <span>{siteConfig.addressLine1}</span>
              <span>{siteConfig.city}</span>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-7">
              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Nume
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    className={inputClasses}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name ? (
                    <p id="name-error" className="mt-2 text-xs text-red-400">
                      {errors.name}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="phone" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                    className={inputClasses}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone ? (
                    <p id="phone-error" className="mt-2 text-xs text-red-400">
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Email <span className="normal-case text-muted-foreground/60">(opțional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="message" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  className={cn(inputClasses, "resize-none")}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message ? (
                  <p id="message-error" className="mt-2 text-xs text-red-400">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              {status === "error" ? (
                <div className="flex items-start gap-3 rounded-sm border border-red-400/30 bg-red-400/5 p-4">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
                  <p className="text-sm text-foreground/85">
                    Formularul online nu este încă activ. Te rugăm să ne suni direct la{" "}
                    <a href={siteConfig.phoneHref} className="text-accent underline underline-offset-2">
                      {siteConfig.phoneDisplay}
                    </a>{" "}
                    — revenim la formular imediat ce este disponibil.
                  </p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading"}
                className="group inline-flex w-fit items-center gap-2.5 rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-[0.06em] text-accent-foreground transition-colors hover:bg-foreground disabled:opacity-70"
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
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section id="contact" className="bg-background section-y">
      <div className="container-max px-5 sm:px-8 lg:px-10">{children}</div>
    </section>
  );
}
