import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SectionHeading } from "@/components/SectionHeading";
import { telLink, whatsappLink } from "@/lib/format";
import { toast } from "sonner";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please share your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shanti Shawls Emporium, Nurpur (Kangra), Himachal Pradesh" },
      { name: "description", content: "Phone, WhatsApp, email and showroom address for Shanti Shawls Emporium. We respond within the same day." },
      { property: "og:title", content: "Contact — Shanti Shawls Emporium" },
      { property: "og:description", content: "Phone, WhatsApp, email and showroom address." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useSuspenseQuery(sfq);
  const contact = (data.settings.contact as any) ?? {};
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (contact.whatsapp) {
      const text = `Hi Shanti Shawls,\n\nI'm ${result.data.name} (${result.data.email}).\n\n${result.data.message}`;
      window.open(whatsappLink(contact.whatsapp, text), "_blank", "noopener,noreferrer");
      toast.success("Opening WhatsApp with your message…");
    } else if (contact.email) {
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent("Inquiry from " + result.data.name)}&body=${encodeURIComponent(result.data.message)}`;
    } else {
      toast.success("Thank you — we'll be in touch.");
    }
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <h1 className="sr-only">Contact Shanti Shawls Emporium — Nurpur, Kangra</h1>
      <section className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16">
          <div>
            <SectionHeading eyebrow="Get In Touch" title="Come visit, or just say hello" align="left">
              The fastest reply is on WhatsApp — usually within the hour during showroom hours. For inquiries, the form below sends straight to our team.
            </SectionHeading>
            <dl className="mt-10 space-y-6 text-sm">
              {contact.address && (
                <div className="flex gap-4"><MapPin className="size-4 text-gold mt-1 shrink-0" /><div><dt className="eyebrow">Showroom</dt><dd className="mt-1 text-ink leading-relaxed">{contact.address}</dd></div></div>
              )}
              {contact.hours && (
                <div className="flex gap-4"><Clock className="size-4 text-gold mt-1 shrink-0" /><div><dt className="eyebrow">Hours</dt><dd className="mt-1 text-ink">{contact.hours}</dd></div></div>
              )}
              {contact.phone && (
                <div className="flex gap-4"><Phone className="size-4 text-gold mt-1 shrink-0" /><div><dt className="eyebrow">Phone</dt><dd className="mt-1"><a href={telLink(contact.phone)} className="text-maroon">{contact.phone}</a></dd></div></div>
              )}
              {contact.whatsapp && (
                <div className="flex gap-4"><MessageCircle className="size-4 text-gold mt-1 shrink-0" /><div><dt className="eyebrow">WhatsApp</dt><dd className="mt-1"><a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-maroon">{contact.whatsapp}</a></dd></div></div>
              )}
              {contact.email && (
                <div className="flex gap-4"><Mail className="size-4 text-gold mt-1 shrink-0" /><div><dt className="eyebrow">Email</dt><dd className="mt-1"><a href={`mailto:${contact.email}`} className="text-maroon">{contact.email}</a></dd></div></div>
              )}
            </dl>
          </div>

          <form onSubmit={submit} className="rounded-3xl bg-ivory border border-maroon/10 p-8 md:p-10 space-y-5">
            <p className="eyebrow">Send an Inquiry</p>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-ink/70">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-ink/70">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-ink/70">Message</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} required rows={5} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold resize-none" />
            </label>
            <button type="submit" className="w-full rounded-full bg-maroon text-cream py-3.5 text-xs font-medium uppercase tracking-[0.25em] hover:bg-maroon-deep transition">
              Send
            </button>
          </form>
        </div>

        {contact.map_embed && (
          <div className="mx-auto max-w-6xl mt-16 rounded-3xl overflow-hidden border border-maroon/10 bg-mist">
            <iframe src={contact.map_embed} title="Map" className="w-full h-[420px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </section>
      </main>
      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={(data.settings.brand as any) ?? {}} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
