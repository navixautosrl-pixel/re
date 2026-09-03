import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductCard } from "@/components/shared/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { productCategories } from "@/lib/constants";

export function HostingProducts() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          index="04"
          eyebrow="Produse"
          title="Un sistem, nu o listă de servicii"
          description="Fiecare produs e gândit să funcționeze cu celelalte — de la un site simplu la infrastructură dedicată."
        />
        <Reveal delay={0.1} className="mt-14">
          <div>
            {productCategories.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
