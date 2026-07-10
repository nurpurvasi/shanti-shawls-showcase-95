export const SITE_URL = "https://shanti-threads-showcase.lovable.app";

export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export function productJsonLd(p: {
  name: string;
  description?: string | null;
  images?: string[] | null;
  price?: number | null;
  discount_price?: number | null;
  is_available?: boolean | null;
  material?: string | null;
}, url: string) {
  const price = p.discount_price ?? p.price ?? undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    image: (p.images ?? []).map(absUrl),
    ...(p.material ? { material: p.material } : {}),
    url: absUrl(url),
    ...(price != null ? {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: String(price),
        availability: p.is_available === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        url: absUrl(url),
      },
    } : {}),
  };
}

export function itemListJsonLd(items: Array<{ name: string; url: string; image?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absUrl(it.url),
      ...(it.image ? { image: absUrl(it.image) } : {}),
    })),
  };
}

export function localBusinessJsonLd(brand: any, contact: any, social: any) {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: brand?.name || "Shanti Shawls Emporium",
    description: brand?.tagline || undefined,
    image: brand?.logo_url ? absUrl(brand.logo_url) : undefined,
    url: SITE_URL,
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.address ? {
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.address,
        addressCountry: "IN",
      },
    } : {}),
    ...(contact?.hours ? { openingHours: contact.hours } : {}),
    ...(contact?.map_link ? { hasMap: contact.map_link } : {}),
    sameAs: [social?.facebook, social?.instagram, social?.youtube, social?.twitter].filter(Boolean),
  };
}
