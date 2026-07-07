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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
    </div>
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Shanti Shawls Emporium — Premium Woollen Shawls, Suits & Sarees | Nurpur, Himachal Pradesh" },
      { name: "description", content: "Trusted woollen garments and handicrafts emporium in Village Bodh, Jassur, Nurpur (Kangra), Himachal Pradesh. Premium shawls, ladies suits, winter stoles, sarees and traditional Himachali caps — retail & wholesale." },
      { name: "keywords", content: "Shanti Shawls Emporium, Kangra shawls, Himachali caps, Kullu shawl, Kinnauri cap, woollen suits, winter stoles, sarees, Nurpur, Jassur, Kangra, Himachal Pradesh" },
      { name: "author", content: "Shanti Shawls Emporium" },
      { property: "og:site_name", content: "Shanti Shawls Emporium" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#fdfbf7" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,700;1,6..96,400&family=Inter:wght@300;400;500;600&display=swap" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          name: "Shanti Shawls Emporium",
          description: "Premium woollen shawls, ladies suits, stoles, sarees and traditional Himachali caps. A trusted family emporium in Kangra, Himachal Pradesh.",
          foundingDate: "1985",
          telephone: "+91-9418248882",
          email: "shantishawlsemporium@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Village Bodh, PO Jassur, Tehsil Nurpur",
            addressLocality: "Nurpur",
            addressRegion: "Himachal Pradesh",
            addressCountry: "IN",
          },
          sameAs: [
            "https://www.facebook.com/share/1D35NWUmVW/?mibextid=wwXIfr",
            "https://www.instagram.com/shanti_shawls_emporium",
          ],
        }),
      },
    ],
  }),
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
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
