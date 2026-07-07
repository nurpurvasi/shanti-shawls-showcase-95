import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — What patrons say about Shanti Shawls" },
      { name: "description", content: "Real reviews from Shanti Shawls Emporium customers across India." },
      { property: "og:title", content: "Customer Reviews — Shanti Shawls" },
      { property: "og:description", content: "Real reviews from Shanti Shawls Emporium customers across India." },
      { property: "og:url", content: "/reviews" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader brand={(data.settings.brand as any) ?? {}} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <h1 className="sr-only">Customer Reviews &amp; Testimonials</h1>
      <section className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Customer Stories" title="Trust, in their own words" />
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            {data.reviews.map((r) => (
              <figure key={r.id} className="rounded-3xl bg-ivory border border-maroon/5 p-8">
                <div className="flex gap-1 mb-4 text-gold">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-gold" />)}
                </div>
                <blockquote className="font-display italic text-xl text-maroon leading-snug text-pretty">"{r.content}"</blockquote>
                <figcaption className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {r.customer_name}{r.location ? ` · ${r.location}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      </main>
      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={(data.settings.brand as any) ?? {}} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
