"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { contactSchema, fieldErrors } from "@/lib/schemas";
import { t } from "@/i18n/ro";

type Status = "idle" | "sending" | "sent" | "error";
const ERR: Record<string, string> = {
  contact_not_configured: "Formularul de contact nu este încă activat pe acest site, deci mesajul nu a fost trimis.",
  delivery_failed: "Mesajul nu a putut fi trimis din cauza unei erori a serverului. Încearcă din nou în câteva minute.",
  rate_limited: t.form.rateLimited,
  bad_origin: "Cererea a fost respinsă din motive de securitate. Reîncarcă pagina și încearcă din nou.",
};

export function ContactForm() {
  const id = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");
  const live = useRef<HTMLDivElement>(null);

  const f = (name: string) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
  });
  const err = (name: string) => errors[name] && <p id={`${id}-${name}-err`} className="field-error">{errors[name]}</p>;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      topic: String(fd.get("topic") ?? ""),
      message: String(fd.get("message") ?? ""),
      privacy: fd.get("privacy") === "on",
      website: String(fd.get("website") ?? ""),
    };
    const local = contactSchema.safeParse(data);
    if (!local.success) {
      const errs = fieldErrors(local.error);
      setErrors(errs);
      const first = ["name", "email", "phone", "topic", "message", "privacy"].find((k) => errs[k]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && body.ok) {
        setStatus("sent");
        form.reset();
      } else if (body.error === "validation" && body.fields) {
        setErrors(body.fields);
        setStatus("idle");
      } else {
        setServerMsg(ERR[body.error ?? ""] ?? t.form.networkError);
        setStatus("error");
      }
    } catch {
      setServerMsg(t.form.networkError);
      setStatus("error");
    }
    requestAnimationFrame(() => live.current?.focus());
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <div ref={live} tabIndex={-1} className="outline-none" aria-live="polite">
        {status === "sent" && (
          <div className="rounded-[var(--radius-panel)] border-[1.5px] border-ok bg-ok/10 p-5">
            <p className="font-semibold">Mesaj trimis. Mulțumim!</p>
            <p className="mt-1 text-mist-2">Răspunsul vine pe adresa de e-mail pe care ai scris-o.</p>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-[var(--radius-panel)] border-[1.5px] border-danger bg-danger/10 p-5" role="alert">
            <p>{serverMsg}</p>
          </div>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`${id}-name`}>Nume</label>
          <input {...f("name")} className="field" autoComplete="name" required />
          {err("name")}
        </div>
        <div>
          <label className="field-label" htmlFor={`${id}-email`}>E-mail</label>
          <input {...f("email")} className="field" type="email" autoComplete="email" required />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`${id}-phone`}>Telefon <span className="font-normal text-mist-2">({t.form.optional})</span></label>
          <input {...f("phone")} className="field" type="tel" autoComplete="tel" inputMode="tel" />
          {err("phone")}
        </div>
        <div>
          <label className="field-label" htmlFor={`${id}-topic`}>Subiect</label>
          <select {...f("topic")} className="field" defaultValue="produse">
            <option value="produse">Despre produse</option>
            <option value="comanda">Despre o comandă</option>
            <option value="colaborare">Colaborare / magazin</option>
            <option value="altceva">Altceva</option>
          </select>
          {err("topic")}
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor={`${id}-message`}>Mesaj</label>
        <textarea {...f("message")} className="field min-h-40" rows={6} maxLength={2000} required />
        {err("message")}
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label className="flex items-start gap-3">
          <input {...f("privacy")} type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--cyan)]" />
          <span>
            Sunt de acord ca datele mele să fie folosite pentru a-mi răspunde, conform{" "}
            <Link href="/politica-de-confidentialitate" className="link">politicii de confidențialitate</Link>.
          </span>
        </label>
        {err("privacy")}
      </div>
      <button type="submit" className="btn btn-primary" aria-disabled={status === "sending"}>
        {status === "sending" ? t.form.sending : "Trimite mesajul"}
      </button>
    </form>
  );
}
