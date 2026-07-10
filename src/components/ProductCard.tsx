import { formatINR } from "@/lib/format";
import { productImage } from "@/lib/asset-map";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  material: string | null;
  price: number;
  discount_price: number | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller?: boolean;
  is_available: boolean;
  images: string[];
  category_id?: string | null;
};

export function ProductCard({ p, categoryName }: { p: ProductCardData; categoryName?: string | null }) {
  const img = productImage(p.slug, p.images);
  const hasDiscount = p.discount_price != null && p.discount_price < p.price;
  const inStock = p.is_available !== false;
  const label = categoryName ?? p.material ?? null;
  return (
    <article className="group card-lift">
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-mist grain-overlay shadow-luxe">
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className="w-full aspect-[4/5] object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {p.is_featured && (
            <span className="bg-maroon/95 backdrop-blur text-cream text-[9px] font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.22em]">Featured</span>
          )}
          {p.is_new_arrival && (
            <span className="bg-cream/90 backdrop-blur text-maroon text-[9px] font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.22em]">New Arrival</span>
          )}
          {p.is_best_seller && (
            <span className="bg-ink/85 backdrop-blur text-cream text-[9px] font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.22em]">Bestseller</span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <span className={`inline-flex items-center gap-1.5 text-[9px] font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.22em] backdrop-blur ${inStock ? "bg-cream/85 text-maroon" : "bg-ink/80 text-cream"}`}>
            <span className={`size-1.5 rounded-full ${inStock ? "bg-emerald-600" : "bg-cream/70"}`} />
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          {label && <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-2">{label}</p>}
          <h3 className="font-display text-xl md:text-2xl text-maroon leading-tight truncate transition-colors group-hover:text-maroon-deep">{p.name}</h3>
          {p.short_description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{p.short_description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-lg text-maroon">{formatINR(hasDiscount ? p.discount_price! : p.price)}</p>
          {hasDiscount && (
            <p className="text-[10px] line-through text-muted-foreground mt-0.5">{formatINR(p.price)}</p>
          )}
        </div>
      </div>
    </article>
  );
}
