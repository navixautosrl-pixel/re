"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Select } from "@/components/ui/Select";
import { budgetOptions, projectTypeOptions, siteConfig } from "@/lib/constants";
import { submitContactForm } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const inputClasses =
  "w-full border-b border-border-strong bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent-2 focus-visible:outline-none transition-colors";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  projectType: "",
  budget: "",
  message: "",
};

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState(initialValues);

  function validate(): boolean {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Te rugăm să introduci numele tău.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Te rugăm să introduci o adresă de email validă.";
    if (values.message.trim().length < 5) next.message = "Spune-ne pe scurt despre proiect.";
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

  return (
    <section id="contact" className="section-y relative overflow-hidden">
      <div className="glow-spot left-0 top-1/2 size-[480px] -translate-y-1/2 bg-accent opacity-20" aria-hidden="true" />

      <div className="container-max relative px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Hai să pornim proiectul.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Completează formularul cu câteva detalii despre proiect — revenim cu următorul pas.
              </p>
              <a href={`mailto:${siteConfig.email}`} className="mt-5 inline-block py-2 text-sm font-medium text-foreground transition-colors hover:text-accent-2">
                {siteConfig.email}
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <div className="glass rounded-lg p-6 sm:p-9">
                {status === "success" ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CheckCircle2 className="size-10 text-accent-2" aria-hidden="true" />
                    <p className="font-display mt-6 text-3xl font-semibold text-foreground">Solicitare trimisă.</p>
                    <p className="mt-3 max-w-sm text-muted-foreground">
                      Îți mulțumim! Revenim către tine în cel mai scurt timp.
                    </p>
                  </div>
                ) : (
                  <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
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
                          <p id="name-error" className="mt-2 text-xs text-destructive">
                            {errors.name}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label htmlFor="email" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={values.email}
                          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                          className={inputClasses}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email ? (
                          <p id="email-error" className="mt-2 text-xs text-destructive">
                            {errors.email}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Telefon <span className="normal-case text-muted-foreground/60">(opțional)</span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={values.phone}
                          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Companie <span className="normal-case text-muted-foreground/60">(opțional)</span>
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          value={values.company}
                          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="projectType" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Tip proiect
                        </label>
                        <Select
                          id="projectType"
                          value={values.projectType}
                          onValueChange={(v) => setValues((prev) => ({ ...prev, projectType: v }))}
                          placeholder="Alege o opțiune"
                          options={[...projectTypeOptions]}
                        />
                      </div>
                      <div>
                        <label htmlFor="budget" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                          Buget estimat
                        </label>
                        <Select
                          id="budget"
                          value={values.budget}
                          onValueChange={(v) => setValues((prev) => ({ ...prev, budget: v }))}
                          placeholder="Alege un interval"
                          options={[...budgetOptions]}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
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
                        <p id="message-error" className="mt-2 text-xs text-destructive">
                          {errors.message}
                        </p>
                      ) : null}
                    </div>

                    {status === "error" ? (
                      <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                        <p className="text-sm text-foreground/85">
                          Formularul online nu este încă conectat la un serviciu de trimitere. Te rugăm să ne scrii direct la{" "}
                          <a href={`mailto:${siteConfig.email}`} className="text-accent-2 underline underline-offset-2">
                            {siteConfig.email}
                          </a>{" "}
                          — revenim la formular imediat ce este activ.
                        </p>
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="group inline-flex w-fit items-center gap-2.5 rounded-full bg-[image:var(--gradient-blue-purple)] px-8 py-4 text-sm font-semibold text-white shadow-[0_4px_28px_-6px_color-mix(in_srgb,var(--color-accent-3)_60%,transparent)] transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Se trimite...
                        </>
                      ) : (
                        "Trimite solicitarea"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
