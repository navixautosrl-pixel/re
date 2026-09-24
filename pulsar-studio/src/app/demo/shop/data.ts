// Fictional demo business — built to showcase CreareWebsitePro's work, not a
// real store. Products, prices, and stock are illustrative only.

export const shop = {
  name: "Haven",
  tagline: "Obiecte simple, bine făcute, pentru casa ta.",
  email: "contact@haven-demo.ro",
};

export const navLinks = [
  { label: "Produse", href: "#produse" },
  { label: "Despre", href: "#despre" },
  { label: "Contact", href: "#contact" },
];

export const categories = ["Toate", "Ceramică", "Lumânări", "Textile", "Accesorii"] as const;
export type Category = (typeof categories)[number];

export type Product = {
  id: string;
  name: string;
  category: Exclude<Category, "Toate">;
  price: number;
  description: string;
  color: string;
};

export const products: Product[] = [
  { id: "p1", name: "Vază Terra", category: "Ceramică", price: 149, description: "Vază din ceramică arsă manual, finisaj mat.", color: "#c9a084" },
  { id: "p2", name: "Bol Nordic Set 2", category: "Ceramică", price: 129, description: "Set două boluri, glazură reactivă unică.", color: "#8a9a8e" },
  { id: "p3", name: "Cană Minimal", category: "Ceramică", price: 59, description: "Cană de 300ml, formă simplă, toartă confortabilă.", color: "#d8cbb8" },
  { id: "p4", name: "Lumânare Santal", category: "Lumânări", price: 89, description: "Ceară de soia, ardere 45h, aromă lemnoasă caldă.", color: "#b5673e" },
  { id: "p5", name: "Lumânare Fum Alb", category: "Lumânări", price: 79, description: "Notă florală discretă, borcan reutilizabil.", color: "#e8e4dc" },
  { id: "p6", name: "Set 3 Pastile Parfumate", category: "Lumânări", price: 45, description: "Pentru dulap sau mașină, aromă persistentă.", color: "#a8845c" },
  { id: "p7", name: "Pled Lână Reciclată", category: "Textile", price: 219, description: "1.5×2m, țesut gros, lână reciclată certificată.", color: "#5f6f5a" },
  { id: "p8", name: "Set Prosoape Baie", category: "Textile", price: 139, description: "Bumbac organic, set 2 piese, absorbție rapidă.", color: "#c4c9c2" },
  { id: "p9", name: "Față de Masă In", category: "Textile", price: 169, description: "In natural, 140×250cm, finisaj lejer șifonat.", color: "#e0d6c3" },
  { id: "p10", name: "Suport Reviste Stejar", category: "Accesorii", price: 99, description: "Lemn masiv de stejar, finisaj natural cu ulei.", color: "#9c7b52" },
  { id: "p11", name: "Oglindă Rotundă", category: "Accesorii", price: 259, description: "Ramă metalică fină, Ø50cm, montare inclusă.", color: "#4a4a4a" },
  { id: "p12", name: "Coș Fibre Naturale", category: "Accesorii", price: 119, description: "Împletit manual, potrivit pentru depozitare textile.", color: "#b8a67c" },
];
