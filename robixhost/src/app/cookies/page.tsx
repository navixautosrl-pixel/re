import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CookiePreferencesTrigger } from "@/components/cookies/CookiePreferencesTrigger";

export const metadata: Metadata = { title: "Politica cookie" };

export default function CookiesPage() {
  return (
    <>
      <LegalPageLayout
        title="Politica cookie"
        intro="Ce cookie-uri folosim pe robixhost.ro și cum îți poți administra preferințele."
        sections={[
          { heading: "1. Ce sunt cookie-urile", note: "Explicație generală despre cookie-uri și tehnologii similare (localStorage)." },
          {
            heading: "2. Categoriile de cookie-uri folosite",
            note: "Necesare (mereu active — ex: reținerea preferinței de consimțământ), Analytics și Marketing (active doar cu acordul tău) — corespund exact categoriilor din bannerul de consimțământ implementat pe site.",
          },
          { heading: "3. Cookie-uri terțe", note: "Orice cookie setat de servicii terțe (analytics, plăți) — de listat pe măsură ce sunt conectate." },
          { heading: "4. Durata de stocare", note: "Cât timp este păstrată fiecare categorie de cookie." },
          { heading: "5. Actualizări ale politicii", note: "Cum sunt comunicate modificările acestei politici." },
        ]}
      />
      <div className="border-t border-border pb-16 pt-2 text-center">
        <CookiePreferencesTrigger className="text-sm text-accent underline underline-offset-2" />
      </div>
    </>
  );
}
