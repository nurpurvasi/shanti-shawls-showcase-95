// Static fallback images bundled with the build. Admins can override via uploads
// stored on `products.images[]` (full URLs); when empty, we look up by slug here.
import hero from "@/assets/hero.jpg";
import detail1 from "@/assets/detail-1.jpg";
import detail2 from "@/assets/detail-2.jpg";
import atelier from "@/assets/atelier.jpg";
import catPashmina from "@/assets/cat-pashmina.jpg";
import catKani from "@/assets/cat-kani.jpg";
import catSozni from "@/assets/cat-sozni.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import pCrimson from "@/assets/p-crimson.jpg";
import pIvory from "@/assets/p-ivory.jpg";
import pEmerald from "@/assets/p-emerald.jpg";
import pSaffron from "@/assets/p-saffron.jpg";
import pMidnight from "@/assets/p-midnight.jpg";
import pBlush from "@/assets/p-blush.jpg";
import pOchre from "@/assets/p-ochre.jpg";
import pBridal from "@/assets/p-bridal.jpg";

export const heroImg = hero;
export const detailImg1 = detail1;
export const detailImg2 = detail2;
export const atelierImg = atelier;

export const categoryImages: Record<string, string> = {
  pashmina: catPashmina,
  kani: catKani,
  sozni: catSozni,
  cashmere: pSaffron,
  "silk-wool": pBlush,
};

export const productImages: Record<string, string> = {
  "crimson-heritage-pashmina": pCrimson,
  "ivory-sozni-wrap": pIvory,
  "emerald-kani-stole": pEmerald,
  "saffron-cashmere-shawl": pSaffron,
  "midnight-jamawar": pMidnight,
  "blush-silk-stole": pBlush,
  "ochre-pashmina": pOchre,
  "bridal-crimson-kani": pBridal,
};

export const galleryFallback = [
  { src: gallery1, caption: "Inside our Delhi emporium" },
  { src: gallery2, caption: "Crimson silk paisley wrap" },
  { src: gallery3, caption: "Hand-feel of pure pashmina" },
  { src: detail1, caption: "Gold zari border detail" },
  { src: detail2, caption: "The winter edit stacked" },
  { src: atelier, caption: "On the loom in Srinagar" },
];

export function productImage(slug: string, uploaded: string[] | null | undefined): string {
  if (uploaded && uploaded.length > 0) return uploaded[0];
  return productImages[slug] ?? pCrimson;
}

export function productAllImages(slug: string, uploaded: string[] | null | undefined): string[] {
  if (uploaded && uploaded.length > 0) return uploaded;
  const fallback = productImages[slug];
  return fallback ? [fallback] : [pCrimson];
}
