"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetOptions, serviceOptions, siteConfig } from "@/lib/constants";

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  details: string;
};

const initialState: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "",
  budget: "",
  details: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Te rugăm să introduci numele.";
    if (!form.email.trim()) next.email = "Te rugăm să introduci adresa de e-mail.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Introdu o adresă de e-mail validă.";
    if (!form.details.trim()) next.details = "Spune-ne câteva cuvinte despre proiect.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const serviceLabel = serviceOptions.find((s) => s.value === form.service)?.label;
    const budgetLabel = budgetOptions.find((b) => b.value === form.budget)?.label;

    const bodyLines = [
      `Nume: ${form.name}`,
      form.company ? `Companie: ${form.company}` : null,
      `E-mail: ${form.email}`,
      form.phone ? `Telefon: ${form.phone}` : null,
      serviceLabel ? `Serviciu dorit: ${serviceLabel}` : null,
      budgetLabel ? `Buget estimativ: ${budgetLabel}` : null,
      "",
      "Detalii proiect:",
      form.details,
    ].filter((line): line is string => line !== null);

    const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      `Proiect nou — ${form.name}`
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailto;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface px-8 py-16 text-center"
      >
        <CheckCircle2 className="h-8 w-8 text-accent" aria-hidden="true" />
        <h3 className="font-display mt-5 text-2xl text-foreground">Mesajul este pregătit</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ar trebui să se fi deschis clientul tău de email cu mesajul completat. Dacă nu s-a
          întâmplat, ne poți scrie direct la{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-accent hover:opacity-80">
            {siteConfig.email}
          </a>
          .
        </p>
        <Button variant="ghost" size="sm" className="mt-6" onClick={() => setSubmitted(false)}>
          Trimite alt mesaj
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nume" error={errors.name} htmlFor="name">
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Numele tău"
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Companie" htmlFor="company" optional>
          <Input
            id="company"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Numele companiei"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="E-mail" error={errors.email} htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="nume@companie.ro"
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label="Telefon" htmlFor="phone" optional>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="07XX XXX XXX"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Serviciu dorit" htmlFor="service" optional>
          <Select value={form.service} onValueChange={(v) => update("service", v)}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Alege un serviciu" />
            </SelectTrigger>
            <SelectContent>
              {serviceOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Buget estimativ" htmlFor="budget" optional>
          <Select value={form.budget} onValueChange={(v) => update("budget", v)}>
            <SelectTrigger id="budget">
              <SelectValue placeholder="Alege un interval" />
            </SelectTrigger>
            <SelectContent>
              {budgetOptions.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Detalii despre proiect" error={errors.details} htmlFor="details">
        <Textarea
          id="details"
          value={form.details}
          onChange={(e) => update("details", e.target.value)}
          placeholder="Ce vrei să construiești? Ce probleme rezolvă pentru afacerea ta?"
          aria-invalid={!!errors.details}
        />
      </Field>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Trimite mesajul
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-medium text-foreground">
        {label}
        {optional ? <span className="text-xs font-normal text-muted-foreground">opțional</span> : null}
      </label>
      <div className="mt-2">{children}</div>
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-xs text-red-400"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
