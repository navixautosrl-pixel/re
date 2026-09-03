import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductCard } from "@/components/shared/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { productCategories } from "@/lib/constants";

export function HostingProducts() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="PRODUSE"
            title="Un stack complet, nu doar hosting"
            description="De la un site simplu la infrastructură dedicată — alege nivelul potrivit acum și crește fără migrare de date."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productCategories.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
