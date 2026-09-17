// Fictional demo business — built to showcase Pulsar Studio's work, not a
// real gym. No real trainers, member counts, or results are represented.

export const gym = {
  name: "FORGE",
  tagline: "Antrenament serios, într-o comunitate care te împinge mai departe.",
  city: "București",
  address: "Str. Demo nr. 24, București",
  phone: "+40 700 111 222",
  hours: "Luni – Vineri: 06:00 – 23:00 · Weekend: 08:00 – 21:00",
};

export const navLinks = [
  { label: "Acasă", href: "#acasa" },
  { label: "Clase", href: "#clase" },
  { label: "Abonamente", href: "#abonamente" },
  { label: "Antrenori", href: "#antrenori" },
  { label: "Program", href: "#program" },
  { label: "Contact", href: "#contact" },
];

export const classes = [
  { id: "hiit", name: "HIIT", description: "Intervale intense, ardere calorică maximă în 45 de minute." },
  { id: "forta", name: "Forță & Powerlifting", description: "Genuflexiuni, îndreptări, împins — progresie structurată pe termen lung." },
  { id: "box", name: "Box & Kickbox", description: "Tehnică, sac de box, condiție fizică — pentru toate nivelurile." },
  { id: "functional", name: "Antrenament funcțional", description: "Mișcări compuse, echipament variat, adaptat la orice obiectiv." },
  { id: "mobilitate", name: "Mobilitate & Recovery", description: "Stretching ghidat și tehnici de refacere activă." },
  { id: "yoga", name: "Yoga pentru atleți", description: "Flexibilitate și respirație, gândite pentru recuperare între antrenamente." },
];

export type Plan = {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualNote: string;
  featured: boolean;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "basic",
    name: "BASIC",
    monthlyPrice: "149 lei/lună",
    annualPrice: "119 lei/lună",
    annualNote: "facturat anual",
    featured: false,
    features: ["Acces sală echipamente", "Vestiare & dușuri", "1 clasă de grup/săptămână", "Aplicație de programări"],
  },
  {
    id: "pro",
    name: "PRO",
    monthlyPrice: "229 lei/lună",
    annualPrice: "189 lei/lună",
    annualNote: "facturat anual",
    featured: true,
    features: ["Acces nelimitat sală", "Clase de grup nelimitate", "1 sesiune PT/lună inclusă", "Acces prioritar la rezervări", "Plan de nutriție de bază"],
  },
  {
    id: "elite",
    name: "ELITE",
    monthlyPrice: "349 lei/lună",
    annualPrice: "289 lei/lună",
    annualNote: "facturat anual",
    featured: false,
    features: ["Tot ce include PRO", "4 sesiuni PT/lună incluse", "Plan de nutriție personalizat", "Acces recovery & mobilitate", "Suport prioritar"],
  },
];

export const trainers = [
  { id: "t1", name: "Antrenor — Forță", specialty: "Powerlifting & forță", initials: "AF" },
  { id: "t2", name: "Antrenor — HIIT", specialty: "Condiție fizică & ardere calorică", initials: "AH" },
  { id: "t3", name: "Antrenor — Box", specialty: "Box & kickbox", initials: "AB" },
  { id: "t4", name: "Antrenor — Mobilitate", specialty: "Recovery & flexibilitate", initials: "AM" },
];

export type ScheduleSlot = { time: string; class: string; trainer: string };
export const schedule: Record<string, ScheduleSlot[]> = {
  Luni: [
    { time: "07:00", class: "HIIT", trainer: "Antrenor — HIIT" },
    { time: "12:00", class: "Forță", trainer: "Antrenor — Forță" },
    { time: "18:30", class: "Box", trainer: "Antrenor — Box" },
  ],
  Marți: [
    { time: "07:00", class: "Yoga", trainer: "Antrenor — Mobilitate" },
    { time: "17:00", class: "Funcțional", trainer: "Antrenor — HIIT" },
    { time: "19:00", class: "Forță", trainer: "Antrenor — Forță" },
  ],
  Miercuri: [
    { time: "07:00", class: "HIIT", trainer: "Antrenor — HIIT" },
    { time: "18:00", class: "Box", trainer: "Antrenor — Box" },
  ],
  Joi: [
    { time: "07:00", class: "Mobilitate", trainer: "Antrenor — Mobilitate" },
    { time: "12:00", class: "Forță", trainer: "Antrenor — Forță" },
    { time: "18:30", class: "Funcțional", trainer: "Antrenor — HIIT" },
  ],
  Vineri: [
    { time: "07:00", class: "HIIT", trainer: "Antrenor — HIIT" },
    { time: "17:30", class: "Box", trainer: "Antrenor — Box" },
  ],
  Sâmbătă: [{ time: "10:00", class: "Funcțional", trainer: "Antrenor — HIIT" }],
};

export const goalOptions = ["Slăbit", "Masă musculară", "Condiție fizică", "Performanță sportivă", "Recuperare / mobilitate"];
