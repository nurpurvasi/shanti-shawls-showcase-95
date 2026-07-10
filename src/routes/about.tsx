import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";
import { atelierImg } from "@/lib/asset-map";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Shanti Shawls Emporium | Kangra Valley Heritage" },
      { name: "description", content: "Three generations of trust in woollen garments and handicrafts from the Kangra valley of Himachal Pradesh. Meet the family behind Shanti Shawls Emporium." },
      { property: "og:title", content: "Our Story — Shanti Shawls Emporium" },
      { property: "og:description", content: "Three generations of woollen heritage from the Kangra valley of Himachal Pradesh." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: SITE_URL + "/about" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/about" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbJsonLd([{ name: "About", path: "/about" }])),
    }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: AboutPage,
  pendingComponent: PageSkeleton,
});

function AboutPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  const social = (data.settings.social as any) ?? {};
  const designer = (data.settings.designer as any) ?? {};
  const brand = (data.settings.brand as any) ?? {};
  const about = (data.settings.about as any) ?? {};
  const timeline = data.sections.filter((s) => s.section_key === "timeline" && s.is_active !== false);

  const storyParas: string[] = (about.story ?? "").split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
  const defaultStory = [
    "Shanti Shawls Emporium began as a modest family shop in Village Bodh, on the road that winds from Jassur up into the Kangra valley. What started with a handful of Kullu shawls and Kinnauri caps has grown, over three generations, into a trusted destination for woollen garments and handicrafts of Himachal Pradesh.",
    "Every winter, our shelves fill with pieces sourced directly from weaver families across Kullu, Kinnaur, Kangra and Kulu — pure wool shawls, pashmina wraps, hand-embroidered ladies suits, sarees for festivals and the iconic Himachali caps that our region wears with pride.",
    "We serve retail customers who walk through our doors as well as wholesale buyers across India who trust us for consistent quality, honest pricing and pieces that last a lifetime.",
  ];
  const paragraphs = storyParas.length > 0 ? storyParas : defaultStory;

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader brand={brand} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <article className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{about.eyebrow ?? `Our Story · Est. ${brand.established ?? "1985"}`}</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-maroon text-balance leading-tight">
            {about.title ?? "Woollen heritage from the foothills of the Dhauladhar."}
          </h1>
          <div className="mt-8 grain-overlay rounded-3xl overflow-hidden bg-mist">
            <img src={about.image_url || atelierImg} alt="Our story" loading="lazy" className="w-full aspect-[16/10] object-cover" />
          </div>

          <div className="mt-12 text-ink/85 leading-relaxed space-y-6 text-base">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* Mission / Vision / Heritage */}
          <div className="mt-20 grid md:grid-cols-3 gap-6">
            {[
              { t: about.mission_title ?? "Our Mission", d: about.mission_text ?? "To bring genuine, handcrafted Himachali woollens to families across India — honestly priced and lovingly made." },
              { t: about.vision_title ?? "Our Vision", d: about.vision_text ?? "A world where the warmth of the Himalayas travels far, and the weavers who make it are known and celebrated." },
              { t: about.heritage_title ?? "Our Heritage", d: about.heritage_text ?? "Three generations of family stewardship, guided by patterns, colours and techniques passed down the hillsides of Kangra." },
            ].map((b, i) => (
              <div key={i} className="rounded-3xl bg-ivory p-8 border border-maroon/5">
                <h2 className="font-display text-2xl text-maroon">{b.t}</h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="mt-20">
              <SectionHeading eyebrow="The Journey" title="A timeline of the emporium" align="left" />
              <ol className="mt-10 relative border-l border-maroon/15 pl-8 space-y-8">
                {timeline.map((t) => (
                  <li key={t.id} className="relative">
                    <span className="absolute -left-[38px] top-1 size-3 rounded-full bg-gold ring-4 ring-cream" />
                    <p className="eyebrow">{t.title}</p>
                    {t.subtitle && <h3 className="mt-1 font-display text-xl text-maroon">{t.subtitle}</h3>}
                    {t.content && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.content}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Founder */}
          {(about.founder_name || about.founder_bio) && (
            <div className="mt-20 rounded-3xl bg-ivory border border-maroon/5 p-8 flex flex-col md:flex-row gap-8 items-start">
              {about.founder_image_url && (
                <img src={about.founder_image_url} alt={about.founder_name ?? "Founder"} loading="lazy" className="size-32 rounded-full object-cover bg-mist shrink-0" />
              )}
              <div>
                <p className="eyebrow">Meet the Founder</p>
                {about.founder_name && <h2 className="mt-2 font-display text-2xl text-maroon">{about.founder_name}</h2>}
                {about.founder_role && <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mt-1">{about.founder_role}</p>}
                {about.founder_bio && <p className="mt-4 text-sm text-ink/85 leading-relaxed">{about.founder_bio}</p>}
              </div>
            </div>
          )}
        </div>
      </article>
      </main>
      <SiteFooter contact={contact} social={social} designer={designer} brand={brand} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
