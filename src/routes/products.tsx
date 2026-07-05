import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { fetchStorefront } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

const sfq = { queryKey: ["storefront"], queryFn: () => fetchStorefront() } as const;

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "The Collection — Shanti Shawls Emporium" },
      { name: "description", content: "Browse our hand-woven Kashmiri shawls — Pashmina, Kani, Sozni, Cashmere and silk-wool blends." },
      { property: "og:title", content: "The Collection — Shanti Shawls Emporium" },
      { property: "og:description", content: "Hand-woven Kashmiri shawls — Pashmina, Kani, Sozni, Cashmere." },
      { property: "og:url", content: "/products" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(sfq),
  component: ProductsPage,
});

function ProductsPage() {
  const { data } = useSuspenseQuery(sfq);
  const { category: initialCat, q: initialQ } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(initialQ ?? "");
  const activeCat = initialCat ?? "all";
  const contact = (data.settings.contact as any) ?? {};

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.products.filter((p) => {
      const catMatch = activeCat === "all" || data.categories.find((c) => c.id === p.category_id)?.slug === activeCat;
      const qMatch = !term || p.name.toLowerCase().includes(term) || (p.description ?? "").toLowerCase().includes(term) || (p.material ?? "").toLowerCase().includes(term);
      return catMatch && qMatch;
    });
  }, [data, q, activeCat]);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <h1 className="sr-only">The Collection — Hand-woven Kashmiri shawls, suits &amp; sarees</h1>
      <section className="px-6 md:px-10 pt-16 pb-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="The Collection" title="Hand-woven, one piece at a time" align="left">
            Each shawl below was made by a named artisan in Kashmir. Filter by tradition or search by name and material.
          </SectionHeading>

          <div className="mt-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap">
              <button
                onClick={() => navigate({ search: (s: any) => ({ ...s, category: undefined }) })}
                className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border ${activeCat === "all" ? "bg-maroon text-cream border-maroon" : "border-maroon/20 text-maroon hover:bg-maroon/5"}`}
              >
                All
              </button>
              {data.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ search: (s: any) => ({ ...s, category: c.slug }) })}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border ${activeCat === c.slug ? "bg-maroon text-cream border-maroon" : "border-maroon/20 text-maroon hover:bg-maroon/5"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); navigate({ search: (s: any) => ({ ...s, q: e.target.value || undefined }) }); }}
                placeholder="Search by name or material"
                aria-label="Search products by name or material"
                type="search"
                className="w-full pl-10 pr-4 py-3 rounded-full bg-ivory border border-maroon/15 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold transition"
              />

            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-24">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No pieces match that search. Try clearing the filter.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
              {filtered.map((p) => (<ProductCard key={p.id} p={p} />))}
            </div>
          )}
        </div>
      </section>
      </main>

      <SiteFooter contact={contact} social={(data.settings.social as any) ?? {}} designer={(data.settings.designer as any) ?? {}} brand={(data.settings.brand as any) ?? {}} categories={data.categories} />
      <WhatsAppFab number={contact.whatsapp} phone={contact.phone} />
    </div>
  );
}
