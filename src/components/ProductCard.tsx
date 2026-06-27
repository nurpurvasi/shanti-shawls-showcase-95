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
  images: string[];
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const img = productImage(p.slug, p.images);
  const hasDiscount = p.discount_price != null && p.discount_price < p.price;
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
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {p.material && <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-1">{p.material}</p>}
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
