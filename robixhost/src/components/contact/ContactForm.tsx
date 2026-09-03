"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-primary/40 bg-surface p-6 text-center">
        <p className="text-sm text-foreground/90">
          Mulțumim! Acesta este un formular demonstrativ — trimiterea reală către un sistem de
          ticketing/email nu este încă conectată.
        </p>
        <ConfigBadge className="mt-3">Form submission backend: TODO</ConfigBadge>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nume</Label>
          <Input
            id="name"
            name="name"
            required
            className="border-border-strong bg-surface-elevated"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="border-border-strong bg-surface-elevated"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subiect</Label>
        <Input id="subject" name="subject" required className="border-border-strong bg-surface-elevated" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Mesaj</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          className="border-border-strong bg-surface-elevated"
        />
      </div>
      <Button type="submit" className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
        Trimite mesajul
      </Button>
    </form>
  );
}
