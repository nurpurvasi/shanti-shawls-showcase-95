import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Shanti Shawls Emporium" },
      { name: "description", content: "Questions about authenticity, shipping, care, returns and bespoke orders — answered." },
      { property: "og:title", content: "FAQ — Shanti Shawls Emporium" },
      { property: "og:description", content: "Questions about authenticity, shipping, care, returns and bespoke orders." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: FaqPage,
});

function FaqPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  const faqs = data.sections.filter((s) => s.section_key === "faq");
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
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
