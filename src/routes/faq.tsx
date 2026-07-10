import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Authenticity, Materials, Care & Visits | Shanti Shawls" },
      { name: "description", content: "Answers on wool authenticity, materials, care instructions and visiting our Nurpur showroom in Kangra, Himachal Pradesh." },
      { property: "og:title", content: "FAQ — Shanti Shawls Emporium" },
      { property: "og:description", content: "Questions about authenticity, materials, care and visiting our showroom." },
      { property: "og:url", content: SITE_URL + "/faq" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/faq" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: FaqPage,
  pendingComponent: PageSkeleton,
});

function FaqPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  const faqs = data.sections.filter((s) => s.section_key === "faq");
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.title,
      acceptedAnswer: { "@type": "Answer", text: f.content ?? "" },
    })),
  };
  const bcLd = breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }]);
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader brand={(data.settings.brand as any) ?? {}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} />
      <h1 className="sr-only">Frequently Asked Questions</h1>
      <section className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Frequently Asked" title="Quietly, all the practical questions" />
          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="rounded-2xl bg-ivory border border-maroon/10 px-6">
                <AccordionTrigger className="text-left font-display text-lg text-maroon hover:no-underline py-5">
                  {f.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {f.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      </main>
      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={(data.settings.brand as any) ?? {}} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
