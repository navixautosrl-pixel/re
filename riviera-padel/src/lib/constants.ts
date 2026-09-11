// Confirmed facts only: name, address, phone, rating/review count, and the
// three activities. Everything else below is brand copy written for the
// positioning brief — no invented court counts, prices, hours, amenities,
// staff, partnerships, awards, or testimonials. Where a real fact is
// missing (closing time, booking system URL, social links, review URL),
// the surrounding UI is built to degrade gracefully rather than guess.

export const siteConfig = {
  name: "Riviera",
  fullName: "Riviera Padel Lounge and Sports",
  tagline: "Joacă. Conectează-te. Revino.",
  description:
    "Padel, ping-pong și biliard într-un lounge sportiv premium din București. Riviera Padel Lounge and Sports — Strada Mehadia 41.",
  email: null as string | null,
  domain: "riviera-padel.ro",
  phoneDisplay: "0722 391 441",
  phoneHref: "tel:+40722391441",
  addressLine1: "Strada Mehadia 41",
  addressLine2: "060543 București, România",
  addressShort: "Strada Mehadia 41, București",
  city: "București",
  postalCode: "060543",
  rating: 4.8,
  reviewCount: 99,
  openingFrom: "10:00",
  // No real booking system connected yet — every "REZERVĂ" CTA falls back
  // to #contact until this is set. Swap in the real booking URL here once
  // it exists and every CTA in the site picks it up automatically.
  bookingUrl: null as string | null,
  mapsDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Riviera+Padel+Lounge+and+Sports+Strada+Mehadia+41+Bucuresti",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Strada+Mehadia+41,+060543+Bucuresti,+Romania&output=embed",
  mapsReviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Riviera+Padel+Lounge+and+Sports+Strada+Mehadia+41+Bucuresti",
};

export const navLinks = [
  { label: "Acasă", href: "#acasa" },
  { label: "Padel", href: "#padel" },
  { label: "Facilități", href: "#facilitati" },
  { label: "Riviera", href: "#riviera" },
  { label: "Galerie", href: "#galerie" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export const activities = ["Padel", "Ping-Pong", "Biliard"] as const;

export const whyRiviera = [
  {
    index: "01",
    name: "Sport",
    description:
      "Padelul e vedeta — un joc rapid, social, ușor de învățat și greu de abandonat după primul meci.",
  },
  {
    index: "02",
    name: "Atmosferă",
    description:
      "Lumini de seară, texturi premium, un spațiu gândit să arate la fel de bine cât se simte jocul.",
  },
  {
    index: "03",
    name: "Comunitate",
    description:
      "Un loc unde intri cu doi prieteni și pleci cunoscând alți patru. Terenul e doar începutul.",
  },
  {
    index: "04",
    name: "Experiență",
    description:
      "Nu vii doar să joci un meci. Vii să-ți petreci seara — jocul e pretextul, nu tot programul.",
  },
] as const;

export const faqItems = [
  {
    question: "Unde se află Riviera?",
    answer: `Riviera Padel Lounge and Sports se află pe ${siteConfig.addressLine1}, ${siteConfig.addressLine2}.`,
  },
  {
    question: "Ce activități pot face la Riviera?",
    answer:
      "Padel, ping-pong și biliard — sub același acoperiș, în același lounge. Padelul este activitatea principală.",
  },
  {
    question: "Cum pot face o rezervare?",
    answer:
      "Cel mai simplu — sună-ne direct la " +
      siteConfig.phoneDisplay +
      ". Lucrăm și la un sistem de rezervare online, care va apărea aici de îndată ce este gata.",
  },
  {
    question: "Pot veni cu prietenii?",
    answer:
      "Riviera este gândită exact pentru asta — padelul se joacă în perechi, iar lounge-ul e făcut pentru grupuri.",
  },
  {
    question: "Care este programul Riviera?",
    answer:
      "Deschidem de la ora 10:00. Pentru programul complet și disponibilitate, cel mai sigur este să suni la " +
      siteConfig.phoneDisplay +
      ".",
  },
  {
    question: "Cum pot lua legătura cu Riviera?",
    answer:
      "Telefonic la " +
      siteConfig.phoneDisplay +
      " sau prin formularul de contact de mai jos — răspundem cât de repede putem.",
  },
] as const;

export const formServiceOptions = [
  { value: "padel", label: "Rezervare Padel" },
  { value: "ping-pong", label: "Ping-Pong" },
  { value: "biliard", label: "Biliard" },
  { value: "grup-eveniment", label: "Grup / Eveniment privat" },
  { value: "altceva", label: "Altceva" },
] as const;
