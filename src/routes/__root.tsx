import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchStorefront } from "@/lib/storefront.functions";

function NotFoundComponent() {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-display text-maroon">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The thread you followed leads nowhere. Let's return to the loom.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-maroon px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-cream transition hover:bg-maroon-deep"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Something unraveled</p>
        <h1 className="mt-3 text-3xl font-display text-maroon">This page didn't load</h1>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-maroon px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-cream"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-maroon/20 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-maroon">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    try {
      const data = await context.queryClient.ensureQueryData({
        queryKey: ["storefront"],
        queryFn: () => fetchStorefront(),
      });
      const brand = (data.settings.brand as any) ?? {};
      const seo = (data.settings.seo as any) ?? {};
      const contact = (data.settings.contact as any) ?? {};
      const social = (data.settings.social as any) ?? {};
      return {
        faviconUrl: (brand.favicon_url as string | undefined) ?? undefined,
        seo: {
          title: seo.default_title || brand.name || "Shanti Shawls Emporium",
          description: seo.default_description || brand.tagline || "Premium woollen shawls, ladies suits, stoles, sarees & traditional Himachali caps.",
          keywords: seo.keywords || "",
          ogImage: seo.og_image_url || brand.logo_url || undefined,
          themeColor: seo.theme_color || "#fdfbf7",
          siteName: brand.name || "Shanti Shawls Emporium",
          gscVerification: seo.gsc_verification || "",
        },
        jsonLd: {
          name: brand.name || "Shanti Shawls Emporium",
          description: seo.default_description || brand.tagline || "",
          founded: brand.established || "",
          phone: contact.phone || "",
          email: contact.email || "",
          address: contact.address || "",
          sameAs: [social.facebook, social.instagram, social.youtube, social.twitter].filter(Boolean),
        },
      };
    } catch {
      return { faviconUrl: undefined, seo: null, jsonLd: null } as any;
    }
  },
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const jsonLd = loaderData?.jsonLd;
    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: seo?.title || "Shanti Shawls Emporium" },
      { name: "description", content: seo?.description || "" },
      { name: "author", content: seo?.siteName || "Shanti Shawls Emporium" },
      { property: "og:site_name", content: seo?.siteName || "Shanti Shawls Emporium" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: seo?.themeColor || "#fdfbf7" },
    ];
    if (seo?.keywords) meta.push({ name: "keywords", content: seo.keywords });
    if (seo?.gscVerification) meta.push({ name: "google-site-verification", content: seo.gscVerification });
    if (seo?.ogImage) {
      meta.push({ property: "og:image", content: seo.ogImage });
      meta.push({ name: "twitter:image", content: seo.ogImage });
    }
    const scripts: any[] = [
      { src: "https://www.googletagmanager.com/gtag/js?id=G-0GLXYQXTCK", async: true },
      {
        children:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-0GLXYQXTCK');",
      },
    ];
    if (jsonLd) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          name: jsonLd.name,
          description: jsonLd.description,
          ...(jsonLd.founded ? { foundingDate: String(jsonLd.founded) } : {}),
          ...(jsonLd.phone ? { telephone: jsonLd.phone } : {}),
          ...(jsonLd.email ? { email: jsonLd.email } : {}),
          ...(jsonLd.address ? { address: { "@type": "PostalAddress", streetAddress: jsonLd.address, addressCountry: "IN" } } : {}),
          ...(jsonLd.sameAs?.length ? { sameAs: jsonLd.sameAs } : {}),
        }),
      });
    }

    return {
      meta,
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap" },
        { rel: "icon", href: loaderData?.faviconUrl || "/favicon.ico" },
      ],
      scripts,
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  useEffect(() => {
    const track = () => {
      const g = (window as any).gtag;
      if (typeof g === "function") {
        g("event", "page_view", {
          page_path: window.location.pathname + window.location.search,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };
    const unsub = router.subscribe("onResolved", track);
    return () => unsub();
  }, [router]);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

