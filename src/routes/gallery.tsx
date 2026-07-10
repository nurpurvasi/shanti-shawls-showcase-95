import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";
import { galleryFallback, productImages } from "@/lib/asset-map";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Inside Shanti Shawls Emporium" },
      { name: "description", content: "Photographs from inside our Nurpur showroom and the shawls, suits and stoles we curate." },
      { property: "og:title", content: "Gallery — Shanti Shawls Emporium" },
      { property: "og:description", content: "Inside our showroom — heritage Himachali textiles." },
      { property: "og:url", content: "/gallery" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: GalleryPage,
});

function GalleryPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  const items = data.gallery.length > 0
    ? data.gallery.map((g) => ({ src: g.image_url, caption: g.caption ?? "" }))
    : [...galleryFallback, ...Object.values(productImages).slice(0, 6).map((src) => ({ src, caption: "" }))];

  const [lightbox, setLightbox] = useState<number | null>(null);
  const total = items.length;
  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i === null ? null : (i - 1 + total) % total));
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % total));

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, total]);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader brand={(data.settings.brand as any) ?? {}} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <h1 className="sr-only">Gallery — Inside the emporium</h1>
      <section className="px-6 md:px-10 pt-20 pb-24 fade-up">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Gallery" title="Quiet moments from the emporium" />
          <div className="mt-14 columns-2 md:columns-3 lg:columns-4 gap-5 [column-fill:_balance]">
            {items.map((g, i) => (
              <figure key={i} className="group mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-mist grain-overlay shadow-luxe cursor-zoom-in">
                <button type="button" onClick={() => setLightbox(i)} aria-label={`Open image ${i + 1}`} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  <img src={g.src} alt={g.caption || "Gallery image"} loading="lazy" className="w-full h-auto object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]" />
                  {g.caption && (
                    <figcaption className="px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{g.caption}</figcaption>
                  )}
                </button>
              </figure>
            ))}
          </div>
        </div>
      </section>
      </main>

      {lightbox !== null && items[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[9999] bg-ink/95 backdrop-blur-md flex items-center justify-center animate-[fade-in_0.3s_ease-out]"
          onClick={close}
        >
          <button onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Close" className="absolute top-5 right-5 grid place-items-center size-11 rounded-full bg-cream/10 text-cream hover:bg-cream/20 transition">
            <X className="size-5" />
          </button>
          {total > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="absolute left-4 md:left-8 grid place-items-center size-11 md:size-12 rounded-full bg-cream/10 text-cream hover:bg-cream/20 transition">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="absolute right-4 md:right-8 grid place-items-center size-11 md:size-12 rounded-full bg-cream/10 text-cream hover:bg-cream/20 transition">
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <figure className="max-w-[92vw] max-h-[85vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img src={items[lightbox].src} alt={items[lightbox].caption || "Gallery image"} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-luxe animate-[scale-in_0.35s_ease-out]" />
            {items[lightbox].caption && (
              <figcaption className="text-cream/85 text-xs uppercase tracking-[0.3em] text-center">{items[lightbox].caption}</figcaption>
            )}
            <p className="text-cream/50 text-[10px] uppercase tracking-[0.3em]">{lightbox + 1} / {total}</p>
          </figure>
        </div>
      )}

      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={(data.settings.brand as any) ?? {}} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
