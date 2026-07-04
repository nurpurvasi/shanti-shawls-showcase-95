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
      { title: "Our Story — Shanti Shawls Emporium, Nurpur (Kangra), Himachal Pradesh" },
      { name: "description", content: "Three generations of trust in woollen garments and handicrafts from the Kangra valley. The story, the craft and the people behind Shanti Shawls Emporium." },
      { property: "og:title", content: "Our Story — Shanti Shawls Emporium" },
      { property: "og:description", content: "Three generations of woollen heritage from the Kangra valley of Himachal Pradesh." },
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
  const social = (data.settings.social as any) ?? {};
  const designer = (data.settings.designer as any) ?? {};
  const brand = (data.settings.brand as any) ?? {};
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <article className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Our Story · Est. {brand.established ?? "1985"}</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-maroon text-balance leading-tight">
            Woollen heritage from the foothills of the Dhauladhar.
          </h1>
          <div className="mt-8 grain-overlay rounded-3xl overflow-hidden bg-mist">
            <img src={atelierImg} alt="Handloom weavers of the Kangra valley at work" loading="lazy" className="w-full aspect-[16/10] object-cover" />
          </div>

          <div className="mt-12 text-ink/85 leading-relaxed space-y-6 text-base">
            <p>
              Shanti Shawls Emporium began as a modest family shop in Village Bodh, on the road that winds from Jassur
              up into the Kangra valley. What started with a handful of Kullu shawls and Kinnauri caps has grown, over
              three generations, into a trusted destination for woollen garments and handicrafts of Himachal Pradesh.
            </p>
            <p>
              Every winter, our shelves fill with pieces sourced directly from weaver families across Kullu, Kinnaur,
              Kangra and Kulu — pure wool shawls, pashmina wraps, hand-embroidered ladies suits, sarees for festivals
              and the iconic Himachali caps that our region wears with pride.
            </p>
            <p>
              We serve retail customers who walk through our doors as well as wholesale buyers across India who trust
              us for consistent quality, honest pricing and pieces that last a lifetime.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-ivory p-8 border border-maroon/5">
              <p className="eyebrow">Himachali Heritage</p>
              <h2 className="mt-3 font-display text-2xl text-maroon">Woven in the hills</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                From the geometric pattis of Kullu to the fine floral borders of Kangra, every piece we sell carries
                the story of the hands that made it — pattern, colour and technique passed down for generations.
              </p>
            </div>
            <div className="rounded-3xl bg-ivory p-8 border border-maroon/5">
              <p className="eyebrow">Premium Woollen Products</p>
              <h2 className="mt-3 font-display text-2xl text-maroon">Warmth you can trust</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Pure merino, pashmina, angora and hand-spun sheep wool. We test every consignment for warmth, weight
                and finish before it earns a place on our shelves.
              </p>
            </div>
            <div className="rounded-3xl bg-ivory p-8 border border-maroon/5">
              <p className="eyebrow">Retail &amp; Wholesale</p>
              <h2 className="mt-3 font-display text-2xl text-maroon">For families &amp; for boutiques</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Whether you are buying a single wedding shawl or stocking a boutique for the winter season, we offer
                fair, transparent pricing and dependable service — with quantity discounts for our wholesale partners.
              </p>
            </div>
            <div className="rounded-3xl bg-ivory p-8 border border-maroon/5">
              <p className="eyebrow">Customer Satisfaction</p>
              <h2 className="mt-3 font-display text-2xl text-maroon">The reason we're still here</h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Three generations of returning customers is our proudest achievement. Every enquiry on WhatsApp or by
                phone is answered personally — usually within the hour during showroom hours.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <SectionHeading eyebrow="Quality Assurance" title="What every piece carries" align="left" />
            <ul className="mt-8 grid md:grid-cols-2 gap-x-10 gap-y-4 text-sm text-ink/85">
              <li className="flex gap-3"><span className="text-gold">·</span>Sourced directly from Himachali weaver families</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Fibre &amp; weave verified in-house before display</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Transparent, honest pricing — retail and wholesale</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Careful pan-India dispatch on request</li>
              <li className="flex gap-3"><span className="text-gold">·</span>WhatsApp support before, during and after purchase</li>
              <li className="flex gap-3"><span className="text-gold">·</span>Three generations of returning customers</li>
            </ul>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-3">
            <img src={detailImg1} alt="Macro detail of embroidered woollen shawl border" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover w-full grain-overlay" />
            <img src={detailImg2} alt="Stack of folded pure wool shawls" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover w-full grain-overlay" />
          </div>
        </div>
      </article>
      </main>
      <SiteFooter contact={contact} social={social} designer={designer} brand={brand} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
