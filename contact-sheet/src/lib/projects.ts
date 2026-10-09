import data from "@/data/projects.json";
import { withBasePath } from "@/lib/base-path";

export type Project = {
  slug: string;
  kind: "next" | "static";
  title: string;
  stack: string[];
  fonts: string[];
  htmlPages: number | null;
  commits: number;
  firstCommit: string;
  lastCommit: string;
  lastMessage: string;
  hiddenCookieBanner: boolean;
};

export const capturedAt = data.capturedAt;
export const projects = data.projects as Project[];

/** Short display name: the part of the <title> before the first separator. */
export const shortName = (p: Project) => p.title.split(/\s+[—|-]\s+|\s+\|\s+/)[0];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** Frame numbers, like a film edge: 1, 1A, 2, 2A … */
export const frameNo = (i: number) => `${Math.floor(i / 2) + 1}${i % 2 ? "A" : ""}`;

export const shot = (slug: string, view: "desktop" | "mobile") => {
  const base = withBasePath(`/shots/${slug}-${view}`);
  return view === "desktop"
    ? {
        avif: [320, 640, 960, 1280].map((w) => `${base}-${w}.avif ${w}w`).join(", "),
        webp: [320, 640, 960, 1280].map((w) => `${base}-${w}.webp ${w}w`).join(", "),
        src: `${base}-1280.webp`, width: 1280, height: 800,
      }
    : { avif: `${base}-390.avif 390w`, webp: `${base}-390.webp 390w`, src: `${base}-390.webp`, width: 390, height: 844 };
};
