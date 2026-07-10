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
    <article className="group">
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-mist grain-overlay">
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className="w-full aspect-[4/5] object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {p.is_featured && (
            <span className="bg-maroon text-cream text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.18em]">Featured</span>
          )}
          {p.is_new_arrival && (
            <span className="bg-gold text-ink text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.18em]">New Arrival</span>
          )}
          {p.is_best_seller && (
            <span className="bg-ink text-cream text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.18em]">Bestseller</span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.18em] ${inStock ? "bg-emerald-700/90 text-cream" : "bg-black/70 text-cream"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {label && <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-1">{label}</p>}
          <h3 className="font-display text-lg text-maroon leading-tight truncate">{p.name}</h3>
          {p.short_description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.short_description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-base text-maroon">{formatINR(hasDiscount ? p.discount_price! : p.price)}</p>
          {hasDiscount && (
            <p className="text-[10px] line-through text-muted-foreground">{formatINR(p.price)}</p>
          )}
        </div>
      </div>
    </article>
  );
}
