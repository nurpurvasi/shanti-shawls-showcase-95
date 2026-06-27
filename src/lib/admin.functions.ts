import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin only");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(5000).optional().nullable(),
  short_description: z.string().max(500).optional().nullable(),
  images: z.array(z.string().url()).max(20).default([]),
  price: z.number().min(0),
  discount_price: z.number().min(0).nullable().optional(),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  material: z.string().max(200).optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error, data: row } = await context.supabase
      .from("products")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => categorySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error, data: row } = await context.supabase
      .from("categories")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  customer_name: z.string().min(1).max(120),
  location: z.string().max(120).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1).max(2000),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const upsertReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error, data: row } = await context.supabase
      .from("reviews")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const gallerySchema = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().url(),
  caption: z.string().max(200).optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const upsertGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => gallerySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error, data: row } = await context.supabase
      .from("gallery")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("gallery").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const upsertSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ key: z.string().min(1).max(100), value: z.any() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error, data: row } = await context.supabase
      .from("settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

// Returns a long-lived signed URL for an uploaded storage path
export const signMediaUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // 100-year expiry — effectively permanent for storefront images
    const { data: signed, error } = await context.supabase
      .storage
      .from("shanti-media")
      .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 100);
    if (error || !signed) throw error ?? new Error("Failed to sign URL");
    return { url: signed.signedUrl };
  });
