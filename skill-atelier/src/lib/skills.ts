import data from "@/data/skills.json";

export type Stage = "plan" | "design" | "build" | "motion" | "search" | "verify" | "ship";
export type Skill = {
  name: string;
  stage: Stage;
  origin: "custom" | "vendored" | "existing";
  vendor: string | null;
  summary: string;
  description: string;
  hasScripts: boolean;
};

export const skills = data.skills as Skill[];

export const STAGES: { id: Stage; label: string; gate: string }[] = [
  { id: "plan", label: "Plan", gate: "Audience, one job per page, keyword map and a facts inventory, with unknowns marked." },
  { id: "design", label: "Design", gate: "A written concept, tokens and a motion storyboard, made for this brand alone." },
  { id: "build", label: "Build", gate: "Every page and interaction works, and every form has its loading, error and success states." },
  { id: "motion", label: "Motion", gate: "Each animation maps to the storyboard, and everything stays visible with reduced motion or JS off." },
  { id: "search", label: "Search", gate: "Unique metadata per page, a sitemap and robots file, and JSON-LD that is valid and true." },
  { id: "verify", label: "Verify", gate: "The QA script exits 0 on the production build, and Lighthouse numbers are recorded." },
  { id: "ship", label: "Ship", gate: "The deploy is authorized, the live URL is re-checked in a browser and there is a rollback ready." },
];

export const count = (pred: (s: Skill) => boolean) => skills.filter(pred).length;
