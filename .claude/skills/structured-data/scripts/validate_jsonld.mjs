#!/usr/bin/env node
// Offline JSON-LD sanity check for built HTML. No dependencies, no network.
// It catches syntax errors, missing required properties for the types this repo
// actually ships, placeholder values, and review markup that needs a human to
// confirm it is genuine. It is NOT a substitute for Google's Rich Results Test
// or validator.schema.org — run those on the deployed URL as well.
//
// Usage: node validate_jsonld.mjs <file.html | directory> [...more]
// Exit: 0 = no errors, 1 = errors, 2 = usage.

import fs from "node:fs";
import path from "node:path";

const targets = process.argv.slice(2);
if (!targets.length) { console.error("Usage: validate_jsonld.mjs <html file or dir> ..."); process.exit(2); }

const files = [];
const walk = (p) => {
  const st = fs.statSync(p);
  if (st.isDirectory()) fs.readdirSync(p).forEach((f) => f !== "node_modules" && !f.startsWith(".") && walk(path.join(p, f)));
  else if (/\.html?$/.test(p)) files.push(p);
};
targets.forEach(walk);

// Required = Google rich-result required props (or schema.org essentials for types with no rich result).
const RULES = {
  Organization: { req: ["name", "url"], rec: ["logo", "sameAs", "contactPoint"] },
  LocalBusiness: { req: ["name", "address"], rec: ["telephone", "url", "openingHoursSpecification", "geo", "image", "priceRange"] },
  WebSite: { req: ["name", "url"], rec: [] },
  WebPage: { req: ["name"], rec: ["url", "description"] },
  BreadcrumbList: { req: ["itemListElement"], rec: [] },
  ListItem: { req: ["position", "name"], rec: ["item"] },
  Article: { req: ["headline"], rec: ["datePublished", "dateModified", "author", "image"] },
  BlogPosting: { req: ["headline"], rec: ["datePublished", "dateModified", "author", "image"] },
  Product: { req: ["name"], oneOf: [["offers", "review", "aggregateRating"]], rec: ["image", "description", "brand", "sku"] },
  Offer: { req: ["price", "priceCurrency"], rec: ["availability", "url", "priceValidUntil"] },
  AggregateOffer: { req: ["lowPrice", "priceCurrency"], rec: ["highPrice", "offerCount"] },
  FAQPage: { req: ["mainEntity"], rec: [] },
  Question: { req: ["name", "acceptedAnswer"], rec: [] },
  Answer: { req: ["text"], rec: [] },
  Service: { req: ["name"], rec: ["provider", "areaServed", "description"] },
  Event: { req: ["name", "startDate", "location"], rec: ["endDate", "eventStatus", "offers", "image"] },
  PostalAddress: { req: [], rec: ["streetAddress", "addressLocality", "postalCode", "addressCountry"] },
  AggregateRating: { req: ["ratingValue"], oneOf: [["ratingCount", "reviewCount"]], rec: ["bestRating"] },
  Review: { req: ["author", "reviewRating"], rec: ["datePublished"] },
};
const LOCALBIZ = /(LocalBusiness|Store|Restaurant|AutoRepair|AutoWash|HealthClub|SportsActivityLocation|ProfessionalService|LegalService|Dentist|HomeAndConstructionBusiness|AutomotiveBusiness)$/;
const PLACEHOLDER = /(example\.(com|org)|lorem|ipsum|TODO|TBD|xxx|placeholder|your[ -]?(company|business)|555-?\d{4}|0700 ?000 ?000)/i;

let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`  ✗ ${f}: ${m}`); };
const wrn = (f, m) => { warnings++; console.log(`  ! ${f}: ${m}`); };

function check(node, file, trail, ctx) {
  if (Array.isArray(node)) return node.forEach((n, i) => check(n, file, `${trail}[${i}]`, ctx));
  if (!node || typeof node !== "object") {
    if (typeof node === "string" && PLACEHOLDER.test(node)) wrn(file, `${trail} looks like a placeholder: "${node.slice(0, 60)}"`);
    return;
  }
  if (node["@graph"]) return check(node["@graph"], file, `${trail}.@graph`, ctx);
  const types = [].concat(node["@type"] || []);
  for (const t of types) {
    ctx.types.add(t);
    // ListItem needs name+item only inside a BreadcrumbList; a plain ItemList of names is valid.
    const rule = t === "ListItem" && ctx.parent !== "BreadcrumbList" ? null : RULES[t] || (LOCALBIZ.test(t) ? RULES.LocalBusiness : null);
    const isRef = Object.keys(node).every((k) => k === "@id" || k === "@type");
    if (rule && !isRef) {
      rule.req.forEach((k) => node[k] == null && err(file, `${t} at ${trail} missing required "${k}"`));
      (rule.oneOf || []).forEach((g) => !g.some((k) => node[k] != null) && err(file, `${t} at ${trail} needs one of ${g.join("/")}`));
      const missRec = rule.rec.filter((k) => node[k] == null);
      if (missRec.length) wrn(file, `${t} at ${trail} missing recommended ${missRec.join(", ")}`);
    }
    if (t === "AggregateRating" || t === "Review") ctx.reviews.push({ t, trail, parent: ctx.parent });
    if (t === "Offer" && node.price != null && !/^\d+(\.\d+)?$/.test(String(node.price))) err(file, `Offer.price at ${trail} must be a plain number string ("49.00"), got "${node.price}"`);
    if (t === "FAQPage") ctx.faq = true;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("@")) { if (k === "@id" || k === "@context") continue; }
    const prev = ctx.parent; ctx.parent = types[0] || prev;
    check(v, file, `${trail}.${k}`, ctx);
    ctx.parent = prev;
  }
}

for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const rel = path.relative(process.cwd(), f);
  if (!blocks.length) { console.log(`- ${rel}: no JSON-LD`); continue; }
  console.log(`- ${rel}: ${blocks.length} JSON-LD block(s)`);
  const ctx = { types: new Set(), reviews: [], parent: null, faq: false };
  blocks.forEach((b, i) => {
    let data;
    try { data = JSON.parse(b.replace(/^\s*<!--|-->\s*$/g, "")); } catch (e) { return err(rel, `block ${i} is not valid JSON: ${e.message}`); }
    const ctxOk = [].concat(data).every((d) => typeof d["@context"] === "string" ? /schema\.org/.test(d["@context"]) : d["@context"]);
    if (!ctxOk) err(rel, `block ${i} missing "@context": "https://schema.org"`);
    check(data, rel, `#${i}`, ctx);
  });
  console.log(`    types: ${[...ctx.types].join(", ") || "(none)"}`);
  for (const r of ctx.reviews) {
    wrn(rel, `${r.t} at ${r.trail} — confirm these are real, verifiable reviews shown on the page (never invented)`);
    if (r.parent && (r.parent === "Organization" || LOCALBIZ.test(r.parent)))
      wrn(rel, `${r.t} on ${r.parent} is "self-serving" review markup — Google does not show review stars for it`);
  }
  if (ctx.faq) wrn(rel, "FAQPage rich results are limited to well-known government/health sites since 2023; keep it only if the Q&A is visible on the page");
}

console.log(`\n${files.length} file(s), ${errors} error(s), ${warnings} warning(s)`);
console.log("Next: validate the deployed URL with https://search.google.com/test/rich-results and https://validator.schema.org");
process.exit(errors ? 1 : 0);
