import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "super_admin"]);
  if (error || !data || data.length === 0) throw new Error("Forbidden: admin only");
}


export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r: any) => r.role);
    return {
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      isSuperAdmin: roles.includes("super_admin"),
    };
  });

async function assertSuperAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Forbidden: super admin only");
}

// Super-admin-only: list all users with their roles
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: authData, error: authErr }, { data: rolesData }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (authErr) throw authErr;
    const rolesByUser: Record<string, string[]> = {};
    (rolesData ?? []).forEach((r: any) => {
      (rolesByUser[r.user_id] = rolesByUser[r.user_id] || []).push(r.role);
    });
    return (authData?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      roles: rolesByUser[u.id] ?? [],
    }));
  });

const roleMutSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "super_admin", "user"]),
  grant: z.boolean(),
});

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => roleMutSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    // Prevent super admin from removing their own super_admin role (lockout guard)
    if (!data.grant && data.role === "super_admin" && data.user_id === context.userId) {
      throw new Error("You cannot remove your own Super Admin role.");
    }
    if (data.grant) {
      const { error } = await context.supabase
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw error;
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot delete your own account.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw error;
    return { ok: true };
  });


// Admin-only unfiltered snapshot of all content (includes hidden/inactive rows)
export const fetchAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase;
    const [categories, products, reviews, gallery, sections, settings] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("products").select("*").order("sort_order"),
      sb.from("reviews").select("*").order("sort_order"),
      sb.from("gallery").select("*").order("sort_order"),
      sb.from("homepage_sections").select("*").order("sort_order"),
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
  is_best_seller: z.boolean().default(false),
  sku: z.string().max(80).optional().nullable(),
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

// Aliases for clarity in UI code
export const upsertGalleryItem = upsertGallery;
export const deleteGalleryItem = deleteGallery;

const sectionSchema = z.object({
  id: z.string().uuid().optional(),
  section_key: z.string().min(1).max(60),
  title: z.string().max(500).optional().nullable(),
  subtitle: z.string().max(1000).optional().nullable(),
  content: z.string().max(5000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const upsertSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sectionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error, data: row } = await context.supabase
      .from("homepage_sections")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("homepage_sections").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Uploads a base64-encoded image to the shanti-media bucket and returns a long-lived signed URL.
export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      folder: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
      fileName: z.string().min(1).max(200),
      contentType: z.string().min(1).max(120),
      base64: z.string().min(1),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${data.folder}/${Date.now()}-${safe}`;
    const buffer = Buffer.from(data.base64, "base64");
    const { error: upErr } = await context.supabase.storage
      .from("shanti-media")
      .upload(path, buffer, { contentType: data.contentType, upsert: false });
    if (upErr) throw upErr;
    const { data: signed, error: signErr } = await context.supabase.storage
      .from("shanti-media")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 100);
    if (signErr || !signed) throw signErr ?? new Error("Failed to sign URL");
    return signed.signedUrl;
  });
