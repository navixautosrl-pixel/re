// Single source of truth for page-level facts. This is an internal demo with no
// production domain yet: SITE_URL must be set at build time before it is deployed
// anywhere public, and it stays noindex until then.
export const site = {
  name: "Skill Atelier",
  url: (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  description:
    "The website-building skill library behind this repo's Claude Code setup, sorted by the job each skill does: plan, design, build, motion, search, verify, ship.",
  repoPath: ".claude/skills",
  indexable: process.env.SITE_INDEXABLE === "true",
};
