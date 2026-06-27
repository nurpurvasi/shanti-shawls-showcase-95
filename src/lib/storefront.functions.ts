import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Server-side publishable Supabase client. Reads public data only, respects RLS as anon.
function publicSupabase() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const fetchStorefront = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicSupabase();
  const [categories, products, reviews, gallery, sections, settings] = await Promise.all([
    sb.from("categories").select("*").eq("is_active", true).order("sort_order"),
    sb.from("products").select("*").eq("is_available", true).order("sort_order"),
    sb.from("reviews").select("*").eq("is_published", true).order("sort_order"),
    sb.from("gallery").select("*").eq("is_active", true).order("sort_order"),
    sb.from("homepage_sections").select("*").eq("is_active", true).order("sort_order"),
    sb.from("settings").select("*"),
  ]);
  const settingsMap: Record<string, any> = {};
  (settings.data ?? []).forEach((row: any) => { settingsMap[row.key] = row.value; });
  return {
    categories: categories.data ?? [],
    products: products.data ?? [],
    reviews: reviews.data ?? [],
    gallery: gallery.data ?? [],
    sections: sections.data ?? [],
    settings: settingsMap,
  };
});

export type StorefrontData = Awaited<ReturnType<typeof fetchStorefront>>;
