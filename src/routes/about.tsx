import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";
import { atelierImg, detailImg1, detailImg2 } from "@/lib/asset-map";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Shanti Shawls Emporium" },
      { name: "description", content: "Five decades of preserving Kashmiri shawl craftsmanship. The story, the mission and the people behind Shanti Shawls Emporium." },
      { property: "og:title", content: "Our Story — Shanti Shawls Emporium" },
      { property: "og:description", content: "Five decades of preserving Kashmiri shawl craftsmanship." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <article className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Our Story · Est. 1974</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-maroon text-balance leading-tight">
            Fifty years of weaving Kashmir into cloth.
          </h1>
          <div className="mt-8 grain-overlay rounded-3xl overflow-hidden bg-mist">
            <img src={atelierImg} alt="Master artisan at the loom in Srinagar" loading="lazy" className="w-full aspect-[16/10] object-cover" />
          </div>
          <div className="mt-12 prose prose-stone max-w-none text-ink/85 leading-relaxed space-y-6 text-base">
            <p>
              Shanti Shawls Emporium began in 1974 as a single wooden cabinet of Kashmiri pashmina in the by-lanes of old Delhi.
              Three generations later, we remain a family-run atelier — still working with the same weaver families in Srinagar,
              still refusing to let a single machine touch the loom.
            </p>
            <p>
              Every piece in our showroom is hand-woven, hand-embroidered and hand-finished. A pashmina shawl can take four to six
              months to complete. A bridal Kani may take a year. We carry only what we can vouch for, and we carry it well.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-2 gap-12">
            <div className="rounded-3xl bg-ivory p-8 border border-maroon/5">
              <p className="eyebrow">Mission</p>
              <h2 className="mt-3 font-display text-2xl text-maroon">Preserve the craft</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                To keep the looms of the Kashmir Valley working — by paying fair wages, by educating buyers, and by refusing the
                shortcuts that have hollowed out so much of the Indian textile industry.
              </p>
            </div>
            <div className="rounded-3xl bg-ivory p-8 border border-maroon/5">
              <p className="eyebrow">Vision</p>
              <h2 className="mt-3 font-display text-2xl text-maroon">A heirloom in every home</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                A Shanti shawl is meant to be inherited. Our vision is a generation that buys fewer things, but better — pieces
                worth keeping, worth caring for, worth passing on.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <SectionHeading eyebrow="Quality Assurance" title="What every shawl carries" align="left" />
            <ul className="mt-8 grid md:grid-cols-2 gap-x-10 gap-y-4 text-sm text-ink/85">
              <li className="flex gap-3"><span className="text-gold">·</span>GI authenticity certificate</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Weaver provenance card</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Fibre composition certificate</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Lifetime complimentary cleaning</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Insured pan-India delivery</li>
              <li className="flex gap-3"><span className="text-gold">·</span>7-day no-questions return</li>
            </ul>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-3">
            <img src={detailImg1} alt="Macro detail of gold zari thread on maroon pashmina" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover w-full grain-overlay" />
            <img src={detailImg2} alt="Folded heritage shawls" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover w-full grain-overlay" />
          </div>
        </div>
      </article>
      <SiteFooter contact={contact} />
      <WhatsAppFab number={contact.whatsapp} />
    </div>
  );
}
