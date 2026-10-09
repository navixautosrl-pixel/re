// Internal demo with no production domain: noindex until SITE_URL + SITE_INDEXABLE are set.
export const site = {
  name: "Contact Sheet",
  url: (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  description:
    "A proof sheet of the websites built in this repository, with real screenshots of their builds, their stacks and their commit history.",
  indexable: process.env.SITE_INDEXABLE === "true",
};
