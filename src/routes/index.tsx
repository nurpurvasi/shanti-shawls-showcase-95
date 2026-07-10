import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle, Phone, Star } from "lucide-react";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { heroImg, detailImg2, atelierImg, categoryImages, galleryFallback } from "@/lib/asset-map";
import { formatINR, telLink, whatsappLink } from "@/lib/format";

const storefrontQuery = {
  queryKey: ["storefront"],
  queryFn: () => fetchStorefront(),
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shanti Shawls Emporium — Premium Woollen Shawls, Suits & Sarees | Nurpur, Kangra" },
      { name: "description", content: "A trusted woollen garments and handicrafts emporium in Village Bodh, Jassur, Nurpur (Kangra), Himachal Pradesh." },
      { property: "og:title", content: "Shanti Shawls Emporium — Woollen heritage of Himachal Pradesh" },
      { property: "og:description", content: "Premium shawls, ladies suits, stoles, sarees & Himachali caps from Kangra." },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(storefrontQuery),
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(storefrontQuery);
  const contact = (data.settings.contact as any) ?? {};
  const brand = (data.settings.brand as any) ?? {};
  const hero = (data.settings.hero as any) ?? {};
  const home = (data.settings.home as any) ?? {};

  const bySection = (key: string) => data.sections.filter((s) => s.section_key === key && s.is_active !== false);
  const whyUs = bySection("why_us");
  const trustBadges = bySection("trust_badges");
  const stats = bySection("home_stats");
  const highlights = bySection("store_highlights");

  const featured = data.products.filter((p) => p.is_featured).slice(0, 3);
  const arrivals = data.products.filter((p) => p.is_new_arrival).slice(0, 4);
  const reviews = data.reviews.slice(0, 3);
  const galleryPreview = data.gallery.length > 0
    ? data.gallery.slice(0, 4).map((g) => ({ src: g.image_url, caption: g.caption ?? "" }))
    : galleryFallback.slice(0, 4);

  return (
    <div className="min-h-screen bg-cream text-ink">
      {home.promo_text && (
        <div className="bg-maroon text-cream text-center text-[11px] uppercase tracking-[0.25em] py-2 px-4">
          {home.promo_link ? (
            <a href={home.promo_link} className="hover:text-gold-soft transition">{home.promo_text}</a>
          ) : home.promo_text}
        </div>
      )}
      <SiteHeader brand={brand} />

      <main id="main" tabIndex={-1} className="focus:outline-none">
      {/* HERO */}
      <section className="px-6 md:px-10 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2 md:items-end">
          <div>
            {brand.logo_url && (
              <img
                src={brand.logo_url}
                alt={brand.name ?? "Shanti Shawls Emporium"}
                width={128}
                height={128}
                className="mb-6 h-24 w-24 md:h-28 md:w-28 rounded-full object-contain"
                loading="eager"
                fetchPriority="high"
              />
            )}
            <p className="eyebrow">{hero.eyebrow ?? `Kangra Valley · Himachal Pradesh · Est. ${brand.established ?? "1985"}`}</p>
            <h1 className="mt-5 font-display text-5xl md:text-7xl leading-[1.05] text-balance text-maroon">
              {hero.title ?? "The Warmth of the Himalayas, Woven by Hand."}
            </h1>
            <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
              {hero.subtitle ?? "Premium shawls, stoles, ladies suits, sarees and traditional Himachali caps — crafted in the foothills of the Dhauladhar and trusted by families across India for over three decades."}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md">
              <a
                href={hero.cta_primary_link || "/products"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream hover:bg-maroon-deep transition"
              >
                {hero.cta_primary_label || "View Products"} <ArrowRight className="size-3.5" />
              </a>
              <a
                href={hero.cta_secondary_link || "/contact"}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-maroon/25 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-maroon hover:bg-maroon/5 transition"
              >
                <Phone className="size-3.5" /> {hero.cta_secondary_label || "Contact Us"}
              </a>
              {contact.whatsapp && (
                <a
                  href={whatsappLink(contact.whatsapp, "Hi Shanti Shawls, I'd like to know more.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white hover:opacity-90 transition"
                >
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="relative grain-overlay rounded-3xl overflow-hidden bg-mist">
            <img
              src={hero.image_url || heroImg}
              alt={hero.title ?? "Hero"}
              width={1024}
              height={1280}
              fetchPriority="high"
              className="w-full aspect-[4/5] object-cover"
            />
            {hero.badge && (
              <div className="absolute bottom-6 left-6 bg-cream/95 backdrop-blur px-5 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] text-maroon font-semibold">
                {hero.badge}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      {trustBadges.length > 0 && (
        <section className="px-6 md:px-10 py-10 border-y border-maroon/10 bg-ivory/60">
          <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((b) => (
              <div key={b.id} className="text-center">
                <p className="font-display text-lg text-maroon">{b.title}</p>
                {b.subtitle && <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{b.subtitle}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {data.categories.length > 0 && (
        <section className="px-6 md:px-10 py-20 bg-ivory">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow={home.categories_eyebrow ?? "The Curations"}
              title={home.categories_title ?? "Our Specialities"}
              align="left"
            >
              {home.categories_desc ?? "Distinct weaving traditions, each preserved through generations of Himachali craftsmanship."}
            </SectionHeading>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.categories.map((c) => (
                <Link to="/products" search={{ category: c.slug } as any} key={c.id} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-mist grain-overlay">
                    <img
                      src={c.image_url || categoryImages[c.slug] || categoryImages.pashmina}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] font-medium text-maroon">{c.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      {whyUs.length > 0 && (
        <section className="px-6 md:px-10 py-24 bg-maroon text-cream relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-gold/20" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full border border-gold/10" />
          <div className="mx-auto max-w-6xl relative">
            <p className="eyebrow !text-gold-soft">{home.why_eyebrow ?? "Why Shanti"}</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-balance max-w-2xl">
              {home.why_title ?? "Fifty years of trust, woven into every thread."}
            </h2>
            <div className="mt-14 grid md:grid-cols-2 gap-12">
              {whyUs.map((w, i) => (
                <div key={w.id} className="flex gap-5">
                  <span className="text-gold font-display italic text-2xl shrink-0 w-10">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-base font-medium tracking-wide">{w.title}</h3>
                    <p className="mt-2 text-cream/70 text-sm leading-relaxed">{w.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STORE HIGHLIGHTS */}
      {highlights.length > 0 && (
        <section className="px-6 md:px-10 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-6">
              {highlights.map((h) => (
                <article key={h.id} className="rounded-3xl bg-ivory border border-maroon/5 overflow-hidden">
                  {h.image_url && <img src={h.image_url} alt={h.title ?? ""} loading="lazy" className="w-full aspect-[4/3] object-cover" />}
                  <div className="p-6">
                    <h3 className="font-display text-xl text-maroon">{h.title}</h3>
                    {h.content && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{h.content}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CUSTOMER STATS */}
      {stats.length > 0 && (
        <section className="px-6 md:px-10 py-16 bg-ivory">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.id}>
                <p className="font-display text-4xl md:text-5xl text-maroon">{s.title}</p>
                {s.subtitle && <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{s.subtitle}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LATEST ARRIVALS */}
      {arrivals.length > 0 && (
        <section className="px-6 md:px-10 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-12">
              <SectionHeading eyebrow={home.arrivals_eyebrow ?? "New Arrivals"} title={home.arrivals_title ?? "Latest from the loom"} align="left" />
              <Link to="/products" className="hidden md:inline text-xs uppercase tracking-[0.25em] text-gold border-b border-gold/40 pb-1">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {arrivals.map((p) => (<ProductCard key={p.id} p={p} />))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED CARD */}
      {featured[0] && (
        <section className="px-6 md:px-10 py-24 bg-ivory">
          <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            <div className="grain-overlay rounded-3xl overflow-hidden bg-mist">
              <img src={featured[0].images?.[0] || detailImg2} alt={featured[0].name} loading="lazy" className="w-full aspect-[4/5] object-cover" />
            </div>
            <div>
              <p className="eyebrow">The Heritage Piece</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-maroon leading-tight">{featured[0].name}</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">{featured[0].description}</p>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-2xl text-maroon">{formatINR(featured[0].discount_price ?? featured[0].price)}</span>
                {featured[0].discount_price && (
                  <span className="text-sm line-through text-muted-foreground">{formatINR(featured[0].price)}</span>
                )}
              </div>
              <Link to="/products" className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-maroon border-b border-maroon/30 pb-1">
                Browse the collection <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="px-6 md:px-10 py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow={home.reviews_eyebrow ?? "Customer Stories"} title={home.reviews_title ?? "Words from our patrons"} />
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {reviews.map((r) => (
                <figure key={r.id} className="rounded-3xl bg-ivory p-8 border border-maroon/5">
                  <div className="flex gap-1 mb-4 text-gold">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-gold" />
                    ))}
                  </div>
                  <blockquote className="font-display italic text-lg text-maroon leading-snug text-pretty">
                    "{r.content}"
                  </blockquote>
                  <figcaption className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {r.customer_name}{r.location ? ` · ${r.location}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY PREVIEW */}
      <section className="px-6 md:px-10 py-24 bg-ivory">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <SectionHeading eyebrow={home.gallery_eyebrow ?? "Inside the Emporium"} title={home.gallery_title ?? "The store, the looms, the people"} align="left" />
            <Link to="/gallery" className="hidden md:inline text-xs uppercase tracking-[0.25em] text-gold border-b border-gold/40 pb-1">
              Open gallery
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryPreview.map((g, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-2xl bg-mist grain-overlay">
                <img src={g.src} alt={g.caption || "Store moment"} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP / VISIT */}
      <section className="px-6 md:px-10 py-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
          <div>
            <SectionHeading eyebrow={home.visit_eyebrow ?? "Visit Us"} title={home.visit_title ?? "Step into the showroom"} align="left">
              {home.visit_desc ?? "Walk among hand-loomed pieces, feel the weight of real pashmina, and meet the family behind decades of work."}
            </SectionHeading>
            <dl className="mt-8 space-y-4 text-sm">
              {contact.address && <div><dt className="eyebrow">Address</dt><dd className="mt-1 text-ink">{contact.address}</dd></div>}
              {contact.hours && <div><dt className="eyebrow">Hours</dt><dd className="mt-1 text-ink">{contact.hours}</dd></div>}
              {contact.phone && <div><dt className="eyebrow">Phone</dt><dd className="mt-1"><a href={telLink(contact.phone)} className="text-maroon">{contact.phone}</a></dd></div>}
            </dl>
          </div>
          <div className="rounded-3xl overflow-hidden border border-maroon/10 bg-mist aspect-[4/3] md:aspect-auto">
            {contact.map_embed ? (
              <iframe
                src={contact.map_embed}
                title="Shanti Shawls Emporium location"
                className="w-full h-full min-h-[300px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <img src={atelierImg} alt="Atelier" loading="lazy" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </section>
      </main>

      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={brand} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
