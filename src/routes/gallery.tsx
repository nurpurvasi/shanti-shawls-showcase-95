import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
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
      { title: "Gallery — Inside the Shanti Shawls Emporium" },
      { name: "description", content: "Photographs from inside our Delhi showroom, the Srinagar atelier, and the shawls themselves." },
      { property: "og:title", content: "Gallery — Shanti Shawls Emporium" },
      { property: "og:description", content: "Inside our showroom and atelier — heritage Kashmiri textiles." },
      { property: "og:url", content: "/gallery" },
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

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <section className="px-6 md:px-10 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Gallery" title="Quiet moments from the emporium" />
          <div className="mt-14 columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
            {items.map((g, i) => (
              <figure key={i} className="mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-mist grain-overlay">
                <img src={g.src} alt={g.caption || "Gallery image"} loading="lazy" className="w-full h-auto object-cover" />
                {g.caption && (
                  <figcaption className="px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{g.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={(data.settings.brand as any) ?? {}} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
