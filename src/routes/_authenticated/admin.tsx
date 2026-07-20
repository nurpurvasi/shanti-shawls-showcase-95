import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Star, Upload, Save, ImagePlus, LayoutDashboard, Package, FolderTree, Images, MessageSquare, FileText, Settings as SettingsIcon, Search, Users as UsersIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  upsertProduct, deleteProduct,
  upsertCategory, deleteCategory,
  upsertReview, deleteReview,
  upsertGalleryItem, deleteGalleryItem,
  upsertSetting, upsertSection, deleteSection,
  uploadMedia,
  checkIsAdmin, listUsers, setUserRole, deleteUser, inviteAdminUser,
} from "@/lib/admin.functions";
import { fetchAdminData } from "@/lib/admin.functions";

import { formatINR } from "@/lib/format";


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Shanti Shawls Emporium" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => fetchAdminData(),
  });
  const { data: whoami } = useQuery({
    queryKey: ["admin-whoami"],
    queryFn: () => checkIsAdmin(),
  });
  const isSuperAdmin = !!whoami?.isSuperAdmin;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function refresh() {
    await refetch();
    qc.invalidateQueries({ queryKey: ["admin-data"] });
    qc.invalidateQueries({ queryKey: ["storefront"] });
  }

  if (isLoading || !data) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  const brand = (data.settings?.brand as any) ?? {};


  const nav = [
    { v: "overview", l: "Overview", icon: LayoutDashboard, show: true },
    { v: "products", l: "Products", icon: Package, show: true },
    { v: "categories", l: "Collections", icon: FolderTree, show: true },
    { v: "gallery", l: "Gallery", icon: Images, show: true },
    { v: "reviews", l: "Reviews", icon: MessageSquare, show: true },
    { v: "sections", l: "Pages & Content", icon: FileText, show: true },
    { v: "settings", l: "Site Settings", icon: SettingsIcon, show: true },
    { v: "seo", l: "SEO", icon: Search, show: isSuperAdmin },
    { v: "users", l: "Users", icon: UsersIcon, show: isSuperAdmin },
  ].filter(x => x.show);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 border-r border-maroon/10 bg-ivory transition-transform`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-maroon/10">
          {brand.logo_url && (
            <img src={brand.logo_url} alt={brand.name ?? "Shanti Shawls Emporium"} width={40} height={40} className="h-10 w-10 rounded-full object-contain shrink-0" />
          )}
          <div className="min-w-0">
            <p className="eyebrow text-[10px]">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
            <h1 className="font-display text-sm text-maroon truncate">{brand.name ?? "Shanti Shawls Emporium"}</h1>
          </div>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          {nav.map(({ v, l, icon: Icon }) => (
            <button
              key={v}
              onClick={() => { setActive(v); setMobileOpen(false); }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition ${active === v ? "bg-maroon text-cream" : "text-maroon hover:bg-maroon/5"}`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{l}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-maroon/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-maroon hover:bg-maroon/5">
            <LayoutDashboard className="size-4" /> View site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-maroon hover:bg-maroon/5">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-30 border-b border-maroon/10 bg-ivory/90 backdrop-blur px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="rounded-md border border-maroon/20 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-maroon">Menu</button>
          <span className="font-display text-sm text-maroon truncate">{nav.find(n => n.v === active)?.l}</span>
          <span className="w-12" />
        </header>

        <main className="px-4 md:px-8 py-6 md:py-10 max-w-7xl">
          {active === "overview" && <OverviewTab data={data} isSuperAdmin={isSuperAdmin} />}
          {active === "products" && <ProductsTab data={data} onChange={refresh} />}
          {active === "categories" && <CategoriesTab data={data} onChange={refresh} />}
          {active === "gallery" && <GalleryTab data={data} onChange={refresh} />}
          {active === "reviews" && <ReviewsTab data={data} onChange={refresh} />}
          {active === "sections" && <SectionsTab data={data} onChange={refresh} />}
          {active === "settings" && <SettingsTab data={data} onChange={refresh} />}
          {active === "seo" && isSuperAdmin && <SeoTab data={data} onChange={refresh} />}
          {active === "users" && isSuperAdmin && <UsersTab />}
        </main>
      </div>
    </div>
  );
}

function OverviewTab({ data, isSuperAdmin }: { data: any; isSuperAdmin: boolean }) {
  const products = data.products ?? [];
  const stats = [
    { label: "Products", value: products.length, sub: `${products.filter((p: any) => p.active).length} active` },
    { label: "Collections", value: (data.categories ?? []).length },
    { label: "Gallery images", value: (data.gallery ?? []).length },
    { label: "Reviews", value: (data.reviews ?? []).length },
    { label: "Featured", value: products.filter((p: any) => p.is_featured).length },
    { label: "Best sellers", value: products.filter((p: any) => p.is_best_seller).length },
    { label: "New arrivals", value: products.filter((p: any) => p.is_new_arrival).length },
    { label: "Out of stock", value: products.filter((p: any) => !p.is_available).length },
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">{isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}</p>
        <h2 className="font-display text-3xl md:text-4xl text-maroon mt-2">Welcome back</h2>
        <p className="text-muted-foreground mt-2 max-w-xl">Manage every product, image and page from one place. All content stays editable — nothing is hardcoded.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-maroon/10 bg-ivory p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-maroon/70">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-maroon">{s.value}</p>
            {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}


// ---------- helpers ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold";

function PrimaryBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`inline-flex items-center gap-2 rounded-full bg-maroon text-cream px-5 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-maroon-deep transition disabled:opacity-60 ${p.className ?? ""}`}>{children}</button>;
}

async function pickAndUpload(folder: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        toast.loading("Uploading…", { id: "up" });
        const url = await uploadMedia({ data: { folder, fileName: file.name, contentType: file.type, base64: await toBase64(file) } });
        toast.success("Uploaded", { id: "up" });
        resolve(url);
      } catch (e: any) {
        toast.error(e?.message ?? "Upload failed", { id: "up" });
        resolve(null);
      }
    };
    input.click();
  });
}

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ---------- PRODUCTS ----------

function ProductsTab({ data, onChange }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = data.products.filter((p: any) => {
    const t = q.trim().toLowerCase();
    if (t && !(`${p.name} ${p.sku ?? ""} ${p.material ?? ""}`.toLowerCase().includes(t))) return false;
    if (catFilter !== "all" && p.category_id !== catFilter) return false;
    if (statusFilter === "active" && !p.is_available) return false;
    if (statusFilter === "hidden" && p.is_available) return false;
    if (statusFilter === "featured" && !p.is_featured) return false;
    if (statusFilter === "new" && !p.is_new_arrival) return false;
    if (statusFilter === "best" && !p.is_best_seller) return false;
    return true;
  });

  async function duplicate(p: any) {
    const { id, created_at, updated_at, slug, name, sort_order, ...rest } = p;
    const dupName = `${name} (Copy)`;
    const dupSlug = `${slug}-copy-${Date.now().toString(36)}`;
    try {
      await upsertProduct({ data: { ...rest, name: dupName, slug: dupSlug, sort_order: (sort_order ?? 0) + 1 } as any });
      toast.success("Duplicated");
      onChange();
    } catch (e: any) { toast.error(e?.message ?? "Duplicate failed"); }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-8">
      <div className="space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="font-display text-2xl text-maroon">Products ({filtered.length}/{data.products.length})</h2>
          <PrimaryBtn onClick={() => setEditing({ name: "", slug: "", price: 0, is_available: true, sort_order: 0, images: [] })}>
            <Plus className="size-3.5" /> New
          </PrimaryBtn>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className={inputCls + " flex-1 min-w-[180px]"} placeholder="Search name, SKU, material…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls + " w-auto"} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="all">All categories</option>
            {data.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={inputCls + " w-auto"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="hidden">Out of stock</option>
            <option value="featured">Featured</option>
            <option value="new">New Arrival</option>
            <option value="best">Best Seller</option>
          </select>
        </div>
        <div className="rounded-2xl border border-maroon/10 bg-ivory divide-y divide-maroon/5">
          {filtered.map((p: any) => (
            <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-maroon/5">
              <button onClick={() => setEditing(p)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                <img src={p.images?.[0] ?? "/placeholder.svg"} alt="" className="size-14 rounded-lg object-cover bg-mist" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name} {p.sku && <span className="text-[10px] text-muted-foreground">· {p.sku}</span>}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(p.discount_price ?? p.price)}
                    {p.is_featured && " · ★ Featured"}
                    {p.is_new_arrival && " · NEW"}
                    {p.is_best_seller && " · BEST"}
                    {!p.is_available && " · Hidden"}
                  </p>
                </div>
              </button>
              <button onClick={() => duplicate(p)} title="Duplicate" className="text-xs px-2 py-1 rounded border border-maroon/20 text-maroon hover:bg-maroon/5">Copy</button>
            </div>
          ))}
          {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No products match.</p>}
        </div>
      </div>
      <div>{editing && <ProductForm key={editing.id ?? "new"} initial={editing} categories={data.categories} onSaved={() => { setEditing(null); onChange(); }} onCancel={() => setEditing(null)} />}</div>
    </div>
  );
}

function ProductForm({ initial, categories, onSaved, onCancel }: any) {
  const [f, setF] = useState<any>(initial);
  const [busy, setBusy] = useState(false);
  function set<K extends string>(k: K, v: any) { setF((s: any) => ({ ...s, [k]: v })); }

  async function save() {
    setBusy(true);
    try {
      const slug = (f.slug || f.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await upsertProduct({ data: {
        ...f,
        slug,
        price: Number(f.price),
        discount_price: f.discount_price ? Number(f.discount_price) : null,
        sort_order: Number(f.sort_order || 0),
        sku: f.sku?.trim() || null,
        short_description: f.short_description?.trim() || null,
      } });
      toast.success("Saved");
      onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!f.id || !confirm("Delete this product?")) return;
    setBusy(true);
    try { await deleteProduct({ data: { id: f.id } }); toast.success("Deleted"); onSaved(); }
    catch (e: any) { toast.error(e?.message ?? "Delete failed"); } finally { setBusy(false); }
  }
  async function addImage() {
    const url = await pickAndUpload("products");
    if (url) set("images", [...(f.images ?? []), url]);
  }
  function moveImage(i: number, dir: -1 | 1) {
    const imgs = [...(f.images ?? [])];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  }

  return (
    <div className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-maroon">{f.id ? "Edit" : "New"} product</h3>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-maroon">Close</button>
      </div>
      <Field label="Name"><input className={inputCls} value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Slug (auto)"><input className={inputCls} value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="optional" /></Field>
        <Field label="SKU (optional)"><input className={inputCls} value={f.sku ?? ""} onChange={(e) => set("sku", e.target.value)} placeholder="SHW-001" /></Field>
      </div>
      <Field label="Category">
        <select className={inputCls} value={f.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
          <option value="">— None —</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Short description (card blurb)"><textarea rows={2} className={inputCls} value={f.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} /></Field>
      <Field label="Full description"><textarea rows={4} className={inputCls} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (INR)"><input type="number" className={inputCls} value={f.price ?? 0} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="Sale price"><input type="number" className={inputCls} value={f.discount_price ?? ""} onChange={(e) => set("discount_price", e.target.value)} /></Field>
      </div>
      <Field label="Material"><input className={inputCls} value={f.material ?? ""} onChange={(e) => set("material", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_available} onChange={(e) => set("is_available", e.target.checked)} /> In stock / active</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_new_arrival} onChange={(e) => set("is_new_arrival", e.target.checked)} /> New arrival</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_best_seller} onChange={(e) => set("is_best_seller", e.target.checked)} /> Best seller</label>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Images (drag order with arrows)</span>
          <button onClick={addImage} className="text-xs text-maroon flex items-center gap-1"><ImagePlus className="size-3.5" /> Add</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(f.images ?? []).map((url: string, i: number) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-mist">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/60">
                <button onClick={() => moveImage(i, -1)} className="text-cream text-[10px] px-1.5 rounded bg-black/40">←</button>
                <button onClick={() => set("images", f.images.filter((_: any, j: number) => j !== i))} className="text-cream text-[10px] px-1.5 rounded bg-maroon"><Trash2 className="size-3" /></button>
                <button onClick={() => moveImage(i, 1)} className="text-cream text-[10px] px-1.5 rounded bg-black/40">→</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Field label="Sort order (lower shows first)"><input type="number" className={inputCls} value={f.sort_order ?? 0} onChange={(e) => set("sort_order", e.target.value)} /></Field>
      <div className="flex gap-2 pt-2">
        <PrimaryBtn onClick={save} disabled={busy}><Save className="size-3.5" /> Save</PrimaryBtn>
        {f.id && <button onClick={remove} disabled={busy} className="rounded-full border border-maroon/20 text-maroon px-4 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-maroon/5"><Trash2 className="size-3.5 inline" /></button>}
      </div>
    </div>
  );
}


// ---------- CATEGORIES ----------

function CategoriesTab({ data, onChange }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display text-2xl text-maroon">Categories</h2>
          <PrimaryBtn onClick={() => setEditing({ name: "", slug: "", sort_order: 0 })}><Plus className="size-3.5" /> New</PrimaryBtn>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.categories.map((c: any) => (
            <button key={c.id} onClick={() => setEditing(c)} className="text-left rounded-2xl border border-maroon/10 bg-ivory p-4 flex gap-3 hover:bg-maroon/5">
              {c.image_url && <img src={c.image_url} className="size-16 rounded-lg object-cover bg-mist" alt="" />}
              <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.slug}</p></div>
            </button>
          ))}
        </div>
      </div>
      <div>{editing && <CategoryForm key={editing.id ?? "new"} initial={editing} onSaved={() => { setEditing(null); onChange(); }} onCancel={() => setEditing(null)} />}</div>
    </div>
  );
}

function CategoryForm({ initial, onSaved, onCancel }: any) {
  const [f, setF] = useState<any>(initial);
  const [busy, setBusy] = useState(false);
  function set(k: string, v: any) { setF((s: any) => ({ ...s, [k]: v })); }
  async function save() {
    setBusy(true);
    try {
      const slug = (f.slug || f.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      await upsertCategory({ data: { ...f, slug, sort_order: Number(f.sort_order || 0) } });
      toast.success("Saved"); onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); } finally { setBusy(false); }
  }
  async function remove() {
    if (!f.id || !confirm("Delete category?")) return;
    try { await deleteCategory({ data: { id: f.id } }); toast.success("Deleted"); onSaved(); }
    catch (e: any) { toast.error(e?.message ?? "Delete failed"); }
  }
  async function pickImage() { const u = await pickAndUpload("categories"); if (u) set("image_url", u); }
  return (
    <div className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 sticky top-24">
      <div className="flex justify-between items-center"><h3 className="font-display text-lg text-maroon">{f.id ? "Edit" : "New"}</h3><button onClick={onCancel} className="text-xs text-muted-foreground">Close</button></div>
      <Field label="Name"><input className={inputCls} value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Slug"><input className={inputCls} value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></Field>
      <Field label="Description"><textarea rows={2} className={inputCls} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Image">
        <div className="flex gap-3 items-center">
          {f.image_url && <img src={f.image_url} className="size-16 rounded-lg object-cover bg-mist" alt="" />}
          <button onClick={pickImage} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
        </div>
      </Field>
      <Field label="Sort order"><input type="number" className={inputCls} value={f.sort_order ?? 0} onChange={(e) => set("sort_order", e.target.value)} /></Field>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.is_active !== false} onChange={(e) => set("is_active", e.target.checked)} /> Visible on site</label>
      <div className="flex gap-2"><PrimaryBtn onClick={save} disabled={busy}><Save className="size-3.5" /> Save</PrimaryBtn>{f.id && <button onClick={remove} className="rounded-full border border-maroon/20 px-4 py-2.5 text-xs"><Trash2 className="size-3.5" /></button>}</div>
    </div>
  );
}

// ---------- GALLERY ----------

function GalleryTab({ data, onChange }: any) {
  async function addNew() {
    const url = await pickAndUpload("gallery");
    if (!url) return;
    try { await upsertGalleryItem({ data: { image_url: url, sort_order: data.gallery.length, is_visible: true } }); toast.success("Added"); onChange(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Remove?")) return;
    try { await deleteGalleryItem({ data: { id } }); onChange(); } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function updateCaption(item: any, caption: string) {
    try { await upsertGalleryItem({ data: { ...item, caption } }); onChange(); } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl text-maroon">Gallery</h2>
        <PrimaryBtn onClick={addNew}><Upload className="size-3.5" /> Upload</PrimaryBtn>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.gallery.map((g: any) => (
          <div key={g.id} className={`rounded-2xl overflow-hidden bg-ivory border ${g.is_active === false ? "border-maroon/30 opacity-60" : "border-maroon/10"}`}>
            <img src={g.image_url} alt="" className="w-full aspect-square object-cover" />
            <div className="p-3 space-y-2">
              <input defaultValue={g.caption ?? ""} placeholder="Caption" onBlur={(e) => e.target.value !== (g.caption ?? "") && updateCaption(g, e.target.value)} className={inputCls + " text-xs"} />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={g.is_active !== false} onChange={(e) => upsertGalleryItem({ data: { ...g, is_active: e.target.checked } }).then(onChange)} /> Visible</label>
              <button onClick={() => remove(g.id)} className="text-xs text-maroon hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- REVIEWS ----------

function ReviewsTab({ data, onChange }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display text-2xl text-maroon">Reviews</h2>
          <PrimaryBtn onClick={() => setEditing({ customer_name: "", content: "", rating: 5, is_published: true, sort_order: 0 })}><Plus className="size-3.5" /> New</PrimaryBtn>
        </div>
        <div className="space-y-3">
          {data.reviews.map((r: any) => (
            <button key={r.id} onClick={() => setEditing(r)} className="w-full text-left rounded-2xl border border-maroon/10 bg-ivory p-4 hover:bg-maroon/5">
              <div className="flex justify-between text-xs text-muted-foreground"><span>{r.customer_name}{r.location ? ` · ${r.location}` : ""}</span><span className="flex gap-0.5 text-gold">{Array.from({length: r.rating}).map((_,i) => <Star key={i} className="size-3 fill-gold" />)}</span></div>
              <p className="mt-2 text-sm">{r.content}</p>
            </button>
          ))}
        </div>
      </div>
      <div>{editing && <ReviewForm key={editing.id ?? "new"} initial={editing} onSaved={() => { setEditing(null); onChange(); }} onCancel={() => setEditing(null)} />}</div>
    </div>
  );
}

function ReviewForm({ initial, onSaved, onCancel }: any) {
  const [f, setF] = useState<any>(initial);
  const [busy, setBusy] = useState(false);
  function set(k: string, v: any) { setF((s: any) => ({ ...s, [k]: v })); }
  async function save() {
    setBusy(true);
    try { await upsertReview({ data: { ...f, rating: Number(f.rating), sort_order: Number(f.sort_order || 0) } }); toast.success("Saved"); onSaved(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); } finally { setBusy(false); }
  }
  async function remove() {
    if (!f.id || !confirm("Delete?")) return;
    try { await deleteReview({ data: { id: f.id } }); onSaved(); } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  return (
    <div className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 sticky top-24">
      <div className="flex justify-between items-center"><h3 className="font-display text-lg text-maroon">{f.id ? "Edit" : "New"} review</h3><button onClick={onCancel} className="text-xs text-muted-foreground">Close</button></div>
      <Field label="Name"><input className={inputCls} value={f.customer_name ?? ""} onChange={(e) => set("customer_name", e.target.value)} /></Field>
      <Field label="Location"><input className={inputCls} value={f.location ?? ""} onChange={(e) => set("location", e.target.value)} /></Field>
      <Field label="Review"><textarea rows={4} className={inputCls} value={f.content ?? ""} onChange={(e) => set("content", e.target.value)} /></Field>
      <Field label="Rating (1-5)"><input type="number" min={1} max={5} className={inputCls} value={f.rating ?? 5} onChange={(e) => set("rating", e.target.value)} /></Field>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!f.is_published} onChange={(e) => set("is_published", e.target.checked)} /> Published</label>
      <div className="flex gap-2"><PrimaryBtn onClick={save} disabled={busy}><Save className="size-3.5" /> Save</PrimaryBtn>{f.id && <button onClick={remove} className="rounded-full border border-maroon/20 px-4 py-2.5 text-xs"><Trash2 className="size-3.5" /></button>}</div>
    </div>
  );
}

// ---------- PAGE SECTIONS (why us, trust badges, stats, highlights, timeline, faq) ----------

type FieldKey = "title" | "subtitle" | "content" | "image";
const SECTION_TYPES: Record<string, { label: string; help: string; fields: FieldKey[]; titleLabel?: string; subtitleLabel?: string; contentLabel?: string }> = {
  why_us:          { label: "Why Choose Us",      help: "Bulleted points on the home page.",                fields: ["title","subtitle"] },
  trust_badges:    { label: "Trust Badges",       help: "Short badges (e.g. '3 Generations', 'Pure Wool').", fields: ["title","subtitle"] },
  home_stats:      { label: "Customer Statistics",help: "Number + label pairs.",                             fields: ["title","subtitle"], titleLabel: "Number (e.g. 40+)", subtitleLabel: "Label (e.g. Years serving families)" },
  store_highlights:{ label: "Store Highlights",   help: "Feature cards on the home page.",                   fields: ["title","content","image"] },
  timeline:        { label: "About – Timeline",   help: "Milestones on the About page.",                     fields: ["title","subtitle","content"], titleLabel: "Year", subtitleLabel: "Heading", contentLabel: "Description" },
  faq:             { label: "FAQ",                help: "Questions & answers.",                              fields: ["title","content"], titleLabel: "Question", contentLabel: "Answer" },
};

function SectionsTab({ data, onChange }: any) {
  const grouped = useMemo(() => {
    const m: Record<string, any[]> = {};
    data.sections.forEach((s: any) => { (m[s.section_key] = m[s.section_key] || []).push(s); });
    return m;
  }, [data.sections]);

  async function addNew(key: string) {
    try { await upsertSection({ data: { section_key: key, title: "New item", sort_order: (grouped[key]?.length ?? 0), is_active: true } }); onChange(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function save(s: any) {
    try { await upsertSection({ data: { ...s, sort_order: Number(s.sort_order || 0) } }); toast.success("Saved"); onChange(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    try { await deleteSection({ data: { id } }); onChange(); } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-12">
      <p className="text-sm text-muted-foreground max-w-2xl">Add, edit, reorder or hide the modular blocks that render on your public pages. Changes go live as soon as you save.</p>
      {Object.entries(SECTION_TYPES).map(([key, cfg]) => (
        <section key={key}>
          <div className="flex justify-between items-start mb-1 gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-2xl text-maroon">{cfg.label}</h2>
              <p className="text-xs text-muted-foreground">{cfg.help}</p>
            </div>
            <PrimaryBtn onClick={() => addNew(key)}><Plus className="size-3.5" /> Add</PrimaryBtn>
          </div>
          <div className="space-y-3 mt-4">
            {(grouped[key] ?? []).length === 0 && <p className="text-xs text-muted-foreground italic">No items yet.</p>}
            {(grouped[key] ?? []).map((s) => <SectionRow key={s.id} item={s} cfg={cfg} onSave={save} onRemove={remove} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionRow({ item, cfg, onSave, onRemove }: any) {
  const [f, setF] = useState<any>(item);
  useEffect(() => setF(item), [item]);
  async function pickImg() { const u = await pickAndUpload("sections"); if (u) setF({ ...f, image_url: u }); }
  return (
    <div className="rounded-2xl border border-maroon/10 bg-ivory p-5 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {cfg.fields.includes("title") && <Field label={cfg.titleLabel ?? "Title"}><input className={inputCls} value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>}
        {cfg.fields.includes("subtitle") && <Field label={cfg.subtitleLabel ?? "Subtitle"}><input className={inputCls} value={f.subtitle ?? ""} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></Field>}
      </div>
      {cfg.fields.includes("content") && <Field label={cfg.contentLabel ?? "Content"}><textarea rows={2} className={inputCls} value={f.content ?? ""} onChange={(e) => setF({ ...f, content: e.target.value })} /></Field>}
      {cfg.fields.includes("image") && (
        <Field label="Image">
          <div className="flex gap-3 items-center">
            {f.image_url && <img src={f.image_url} className="size-16 rounded-lg object-cover bg-mist" alt="" />}
            <button onClick={pickImg} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
            {f.image_url && <button onClick={() => setF({ ...f, image_url: "" })} className="text-xs text-muted-foreground hover:text-maroon">Clear</button>}
          </div>
        </Field>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Field label="Order"><input type="number" className={inputCls + " w-24"} value={f.sort_order ?? 0} onChange={(e) => setF({ ...f, sort_order: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-xs mt-4"><input type="checkbox" checked={f.is_active !== false} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Visible on site</label>
        <div className="ml-auto flex gap-2 mt-4">
          <button onClick={() => onSave(f)} className="rounded-full bg-maroon text-cream px-4 py-2 text-xs uppercase tracking-[0.18em]"><Save className="size-3.5 inline" /> Save</button>
          <button onClick={() => onRemove(f.id)} className="rounded-full border border-maroon/20 px-4 py-2 text-xs"><Trash2 className="size-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

// ---------- SETTINGS ----------

function SettingsTab({ data, onChange }: any) {
  const [contact, setContact] = useState<any>(data.settings.contact ?? {});
  const [hero, setHero] = useState<any>(data.settings.hero ?? {});
  const [brand, setBrand] = useState<any>(data.settings.brand ?? {});
  const [social, setSocial] = useState<any>(data.settings.social ?? {});
  const [designer, setDesigner] = useState<any>(data.settings.designer ?? {});
  const [home, setHome] = useState<any>(data.settings.home ?? {});
  const [about, setAbout] = useState<any>(data.settings.about ?? {});
  const [busy, setBusy] = useState(false);

  async function saveAll() {
    setBusy(true);
    try {
      await Promise.all([
        upsertSetting({ data: { key: "contact", value: contact } }),
        upsertSetting({ data: { key: "hero", value: hero } }),
        upsertSetting({ data: { key: "brand", value: brand } }),
        upsertSetting({ data: { key: "social", value: social } }),
        upsertSetting({ data: { key: "designer", value: designer } }),
        upsertSetting({ data: { key: "home", value: home } }),
        upsertSetting({ data: { key: "about", value: about } }),
      ]);
      toast.success("Settings saved — live on the site");
      onChange();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); } finally { setBusy(false); }
  }
  async function uploadHero() { const url = await pickAndUpload("hero"); if (url) setHero({ ...hero, image_url: url }); }
  async function uploadLogo() { const url = await pickAndUpload("brand"); if (url) setBrand({ ...brand, logo_url: url }); }
  async function uploadFavicon() { const url = await pickAndUpload("brand"); if (url) setBrand({ ...brand, favicon_url: url }); }
  async function uploadAboutImg() { const url = await pickAndUpload("about"); if (url) setAbout({ ...about, image_url: url }); }
  async function uploadFounderImg() { const url = await pickAndUpload("about"); if (url) setAbout({ ...about, founder_image_url: url }); }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4">
        <h3 className="font-display text-xl text-maroon">Contact</h3>
        <Field label="Phone"><input className={inputCls} value={contact.phone ?? ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
        <Field label="Second Phone (optional)"><input className={inputCls} value={contact.phone2 ?? ""} onChange={(e) => setContact({ ...contact, phone2: e.target.value })} /></Field>
        <Field label="WhatsApp (with country code)"><input className={inputCls} value={contact.whatsapp ?? ""} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="+91..." /></Field>
        <Field label="Email"><input className={inputCls} value={contact.email ?? ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
        <Field label="Address"><textarea rows={2} className={inputCls} value={contact.address ?? ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></Field>
        <Field label="Business Hours"><input className={inputCls} value={contact.hours ?? ""} onChange={(e) => setContact({ ...contact, hours: e.target.value })} /></Field>
        <Field label="Google Maps Embed URL (iframe src)"><input className={inputCls} value={contact.map_embed ?? ""} onChange={(e) => setContact({ ...contact, map_embed: e.target.value })} placeholder="https://www.google.com/maps/embed?..." /></Field>
        <Field label="Google Maps Share Link (footer)"><input className={inputCls} value={contact.maps_link ?? ""} onChange={(e) => setContact({ ...contact, maps_link: e.target.value })} placeholder="https://maps.app.goo.gl/..." /></Field>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4">
        <h3 className="font-display text-xl text-maroon">Hero Banner</h3>
        <Field label="Eyebrow"><input className={inputCls} value={hero.eyebrow ?? ""} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} /></Field>
        <Field label="Title"><input className={inputCls} value={hero.title ?? ""} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea rows={3} className={inputCls} value={hero.subtitle ?? ""} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></Field>
        <Field label="Image">
          <div className="flex gap-3 items-center">
            {hero.image_url && <img src={hero.image_url} className="size-20 rounded-lg object-cover bg-mist" alt="" />}
            <button onClick={uploadHero} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
          </div>
        </Field>
        <Field label="Image caption badge (e.g. Series No. 24-01)"><input className={inputCls} value={hero.badge ?? ""} onChange={(e) => setHero({ ...hero, badge: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary Button Label"><input className={inputCls} value={hero.cta_primary_label ?? ""} onChange={(e) => setHero({ ...hero, cta_primary_label: e.target.value })} placeholder="View Products" /></Field>
          <Field label="Primary Button Link"><input className={inputCls} value={hero.cta_primary_link ?? ""} onChange={(e) => setHero({ ...hero, cta_primary_link: e.target.value })} placeholder="/products" /></Field>
          <Field label="Secondary Button Label"><input className={inputCls} value={hero.cta_secondary_label ?? ""} onChange={(e) => setHero({ ...hero, cta_secondary_label: e.target.value })} placeholder="Contact Us" /></Field>
          <Field label="Secondary Button Link"><input className={inputCls} value={hero.cta_secondary_link ?? ""} onChange={(e) => setHero({ ...hero, cta_secondary_link: e.target.value })} placeholder="/contact" /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 md:col-span-2">
        <h3 className="font-display text-xl text-maroon">Home Page — Copy</h3>
        <p className="text-xs text-muted-foreground">Section headings and promotional strip that appear on the home page. Leave blank to hide.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Promo strip text (top bar)"><input className={inputCls} value={home.promo_text ?? ""} onChange={(e) => setHome({ ...home, promo_text: e.target.value })} placeholder="Visit our Nurpur showroom this winter" /></Field>
          <Field label="Promo strip link (optional)"><input className={inputCls} value={home.promo_link ?? ""} onChange={(e) => setHome({ ...home, promo_link: e.target.value })} placeholder="/products" /></Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <Field label="Collections eyebrow"><input className={inputCls} value={home.categories_eyebrow ?? ""} onChange={(e) => setHome({ ...home, categories_eyebrow: e.target.value })} placeholder="The Curations" /></Field>
          <Field label="Collections title"><input className={inputCls} value={home.categories_title ?? ""} onChange={(e) => setHome({ ...home, categories_title: e.target.value })} placeholder="Our Specialities" /></Field>
          <Field label="Collections description" ><input className={inputCls} value={home.categories_desc ?? ""} onChange={(e) => setHome({ ...home, categories_desc: e.target.value })} /></Field>
          <Field label="Why-us eyebrow"><input className={inputCls} value={home.why_eyebrow ?? ""} onChange={(e) => setHome({ ...home, why_eyebrow: e.target.value })} placeholder="Why Shanti" /></Field>
          <Field label="Why-us title"><input className={inputCls} value={home.why_title ?? ""} onChange={(e) => setHome({ ...home, why_title: e.target.value })} placeholder="Fifty years of trust, woven into every thread." /></Field>
          <Field label="New arrivals eyebrow"><input className={inputCls} value={home.arrivals_eyebrow ?? ""} onChange={(e) => setHome({ ...home, arrivals_eyebrow: e.target.value })} placeholder="New Arrivals" /></Field>
          <Field label="New arrivals title"><input className={inputCls} value={home.arrivals_title ?? ""} onChange={(e) => setHome({ ...home, arrivals_title: e.target.value })} placeholder="Latest from the loom" /></Field>
          <Field label="Reviews eyebrow"><input className={inputCls} value={home.reviews_eyebrow ?? ""} onChange={(e) => setHome({ ...home, reviews_eyebrow: e.target.value })} placeholder="Customer Stories" /></Field>
          <Field label="Reviews title"><input className={inputCls} value={home.reviews_title ?? ""} onChange={(e) => setHome({ ...home, reviews_title: e.target.value })} placeholder="Words from our patrons" /></Field>
          <Field label="Gallery preview eyebrow"><input className={inputCls} value={home.gallery_eyebrow ?? ""} onChange={(e) => setHome({ ...home, gallery_eyebrow: e.target.value })} /></Field>
          <Field label="Gallery preview title"><input className={inputCls} value={home.gallery_title ?? ""} onChange={(e) => setHome({ ...home, gallery_title: e.target.value })} /></Field>
          <Field label="Visit-us eyebrow"><input className={inputCls} value={home.visit_eyebrow ?? ""} onChange={(e) => setHome({ ...home, visit_eyebrow: e.target.value })} placeholder="Visit Us" /></Field>
          <Field label="Visit-us title"><input className={inputCls} value={home.visit_title ?? ""} onChange={(e) => setHome({ ...home, visit_title: e.target.value })} placeholder="Step into the showroom" /></Field>
        </div>
        <Field label="Visit-us description"><textarea rows={2} className={inputCls} value={home.visit_desc ?? ""} onChange={(e) => setHome({ ...home, visit_desc: e.target.value })} /></Field>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 md:col-span-2">
        <h3 className="font-display text-xl text-maroon">About Page</h3>
        <p className="text-xs text-muted-foreground">Story, mission, vision, heritage and founder blocks. Timeline milestones live under Pages & Content → About – Timeline.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Eyebrow"><input className={inputCls} value={about.eyebrow ?? ""} onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })} placeholder="Our Story" /></Field>
          <Field label="Title"><input className={inputCls} value={about.title ?? ""} onChange={(e) => setAbout({ ...about, title: e.target.value })} /></Field>
          <Field label="Hero image">
            <div className="flex gap-3 items-center">
              {about.image_url && <img src={about.image_url} className="size-20 rounded-lg object-cover bg-mist" alt="" />}
              <button onClick={uploadAboutImg} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
            </div>
          </Field>
        </div>
        <Field label="Story (one paragraph per line)"><textarea rows={6} className={inputCls} value={about.story ?? ""} onChange={(e) => setAbout({ ...about, story: e.target.value })} /></Field>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Mission — title"><input className={inputCls} value={about.mission_title ?? ""} onChange={(e) => setAbout({ ...about, mission_title: e.target.value })} placeholder="Our Mission" /></Field>
          <Field label="Vision — title"><input className={inputCls} value={about.vision_title ?? ""} onChange={(e) => setAbout({ ...about, vision_title: e.target.value })} placeholder="Our Vision" /></Field>
          <Field label="Heritage — title"><input className={inputCls} value={about.heritage_title ?? ""} onChange={(e) => setAbout({ ...about, heritage_title: e.target.value })} placeholder="Our Heritage" /></Field>
          <Field label="Mission — text"><textarea rows={3} className={inputCls} value={about.mission_text ?? ""} onChange={(e) => setAbout({ ...about, mission_text: e.target.value })} /></Field>
          <Field label="Vision — text"><textarea rows={3} className={inputCls} value={about.vision_text ?? ""} onChange={(e) => setAbout({ ...about, vision_text: e.target.value })} /></Field>
          <Field label="Heritage — text"><textarea rows={3} className={inputCls} value={about.heritage_text ?? ""} onChange={(e) => setAbout({ ...about, heritage_text: e.target.value })} /></Field>
        </div>
        <div className="pt-3 border-t border-maroon/10">
          <h4 className="font-display text-base text-maroon mb-2">Founder</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Founder name"><input className={inputCls} value={about.founder_name ?? ""} onChange={(e) => setAbout({ ...about, founder_name: e.target.value })} /></Field>
            <Field label="Founder role"><input className={inputCls} value={about.founder_role ?? ""} onChange={(e) => setAbout({ ...about, founder_role: e.target.value })} placeholder="Founder, Shanti Shawls" /></Field>
            <Field label="Founder photo">
              <div className="flex gap-3 items-center">
                {about.founder_image_url && <img src={about.founder_image_url} className="size-16 rounded-full object-cover bg-mist" alt="" />}
                <button onClick={uploadFounderImg} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
              </div>
            </Field>
          </div>
          <Field label="Founder bio"><textarea rows={3} className={inputCls} value={about.founder_bio ?? ""} onChange={(e) => setAbout({ ...about, founder_bio: e.target.value })} /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 md:col-span-2">
        <h3 className="font-display text-xl text-maroon">Brand Identity</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Brand Name"><input className={inputCls} value={brand.name ?? ""} onChange={(e) => setBrand({ ...brand, name: e.target.value })} placeholder="Shanti Shawls Emporium" /></Field>
          <Field label="Established Year"><input className={inputCls} value={brand.established ?? ""} onChange={(e) => setBrand({ ...brand, established: e.target.value })} /></Field>
          <Field label="Tagline"><input className={inputCls} value={brand.tagline ?? ""} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} /></Field>
          <Field label="Copyright Text (overrides default)"><input className={inputCls} value={brand.copyright ?? ""} onChange={(e) => setBrand({ ...brand, copyright: e.target.value })} /></Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <Field label="Logo Image (leave blank to keep text wordmark)">
            <div className="flex gap-3 items-center">
              {brand.logo_url && <img src={brand.logo_url} className="h-12 w-auto max-w-[160px] object-contain bg-cream rounded" alt="" />}
              <button onClick={uploadLogo} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
              {brand.logo_url && <button onClick={() => setBrand({ ...brand, logo_url: "" })} className="text-xs text-muted-foreground hover:text-maroon">Clear</button>}
            </div>
          </Field>
          <Field label="Favicon (square PNG/ICO recommended)">
            <div className="flex gap-3 items-center">
              {brand.favicon_url && <img src={brand.favicon_url} className="size-10 rounded bg-cream object-contain" alt="" />}
              <button onClick={uploadFavicon} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
              {brand.favicon_url && <button onClick={() => setBrand({ ...brand, favicon_url: "" })} className="text-xs text-muted-foreground hover:text-maroon">Clear</button>}
            </div>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4">
        <h3 className="font-display text-xl text-maroon">Social Links</h3>
        <Field label="Facebook URL"><input className={inputCls} value={social.facebook ?? ""} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://www.facebook.com/..." /></Field>
        <Field label="Instagram URL"><input className={inputCls} value={social.instagram ?? ""} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="https://www.instagram.com/..." /></Field>
        <Field label="YouTube URL"><input className={inputCls} value={social.youtube ?? ""} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} placeholder="https://www.youtube.com/@..." /></Field>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4">
        <h3 className="font-display text-xl text-maroon">Footer Credit</h3>
        <Field label="Designer Name"><input className={inputCls} value={designer.name ?? ""} onChange={(e) => setDesigner({ ...designer, name: e.target.value })} /></Field>
        <Field label="Designer Email"><input className={inputCls} value={designer.email ?? ""} onChange={(e) => setDesigner({ ...designer, email: e.target.value })} /></Field>
        <Field label="Designer Phone"><input className={inputCls} value={designer.phone ?? ""} onChange={(e) => setDesigner({ ...designer, phone: e.target.value })} /></Field>
      </section>

      <div className="md:col-span-2 sticky bottom-4 bg-cream/80 backdrop-blur rounded-full p-2 border border-maroon/10">
        <PrimaryBtn onClick={saveAll} disabled={busy}><Save className="size-3.5" /> Save all settings</PrimaryBtn>
      </div>
    </div>
  );
}

// ---------- SEO (super admin) ----------

function SeoTab({ data, onChange }: any) {
  const [seo, setSeo] = useState<any>(data.settings.seo ?? {});
  const [busy, setBusy] = useState(false);
  async function uploadOg() { const url = await pickAndUpload("seo"); if (url) setSeo({ ...seo, og_image_url: url }); }
  async function save() {
    setBusy(true);
    try { await upsertSetting({ data: { key: "seo", value: seo } }); toast.success("SEO saved"); onChange(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); } finally { setBusy(false); }
  }
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl text-maroon">SEO & Social Preview</h2>
        <p className="text-sm text-muted-foreground mt-1">Controls the browser tab title, meta description, Google search snippet, and how the site looks when shared on WhatsApp / Facebook / Instagram.</p>
      </div>
      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4">
        <Field label="Default page title (≤ 60 chars recommended)">
          <input className={inputCls} maxLength={80} value={seo.default_title ?? ""} onChange={(e) => setSeo({ ...seo, default_title: e.target.value })} placeholder="Shanti Shawls Emporium — Premium Woollen Shawls…" />
        </Field>
        <Field label="Default meta description (≤ 160 chars)">
          <textarea rows={3} maxLength={200} className={inputCls} value={seo.default_description ?? ""} onChange={(e) => setSeo({ ...seo, default_description: e.target.value })} />
        </Field>
        <Field label="Keywords (comma-separated)">
          <input className={inputCls} value={seo.keywords ?? ""} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} placeholder="Kangra shawls, Himachali caps, woollen suits…" />
        </Field>
        <Field label="Social share image (1200×630 recommended)">
          <div className="flex gap-3 items-center">
            {seo.og_image_url && <img src={seo.og_image_url} className="h-16 w-28 object-cover rounded bg-mist" alt="" />}
            <button onClick={uploadOg} className="text-xs text-maroon flex items-center gap-1"><Upload className="size-3.5" /> Upload</button>
            {seo.og_image_url && <button onClick={() => setSeo({ ...seo, og_image_url: "" })} className="text-xs text-muted-foreground hover:text-maroon">Clear</button>}
          </div>
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Theme color (browser bar)"><input className={inputCls} value={seo.theme_color ?? ""} onChange={(e) => setSeo({ ...seo, theme_color: e.target.value })} placeholder="#7b1a1a" /></Field>
          <Field label="Google Search Console verification"><input className={inputCls} value={seo.gsc_verification ?? ""} onChange={(e) => setSeo({ ...seo, gsc_verification: e.target.value })} placeholder="abcd1234…" /></Field>
        </div>
      </section>
      <PrimaryBtn onClick={save} disabled={busy}><Save className="size-3.5" /> Save SEO</PrimaryBtn>
    </div>
  );
}

// ---------- USERS (super admin) ----------

function UsersTab() {
  const qc = useQueryClient();
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsers(),
  });
  async function toggle(user_id: string, role: "admin" | "super_admin", grant: boolean) {
    try {
      await setUserRole({ data: { user_id, role, grant } });
      toast.success(grant ? "Role granted" : "Role revoked");
      refetch();
      qc.invalidateQueries({ queryKey: ["admin-whoami"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(user_id: string, email?: string | null) {
    if (!confirm(`Delete user ${email ?? user_id}? This cannot be undone.`)) return;
    try { await deleteUser({ data: { user_id } }); toast.success("Deleted"); refetch(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const [inviting, setInviting] = useState(false);
  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await inviteAdminUser({ data: { email: inviteEmail, role: inviteRole } });
      toast.success(res.existed ? "Role granted to existing user" : "Invitation sent");
      setInviteEmail("");
      refetch();
    } catch (e: any) { toast.error(e?.message ?? "Failed to invite"); }
    finally { setInviting(false); }
  }
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-maroon">Users & Roles</h2>
        <p className="text-sm text-muted-foreground mt-1">Super Admin can manage every account, dashboard, and setting. Admin manages content, products, gallery, contact & branding — but cannot manage users or SEO.</p>
      </div>
      <form onSubmit={invite} className="mb-6 rounded-2xl border border-maroon/10 bg-ivory p-4 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[220px]">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink/70">Invite by email</span>
          <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@example.com" className="mt-1 w-full px-3 py-2 rounded-lg bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold" />
        </label>
        <label>
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink/70">Role</span>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="mt-1 px-3 py-2 rounded-lg bg-cream border border-maroon/15 text-sm">
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>
        <button disabled={inviting} className="rounded-full bg-maroon text-cream px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] hover:bg-maroon-deep disabled:opacity-60">
          {inviting ? "Sending…" : "Send Invite"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users…</p>
      ) : (
        <div className="rounded-2xl border border-maroon/10 bg-ivory divide-y divide-maroon/5">
          {users.map((u: any) => {
            const isAdmin = u.roles.includes("admin");
            const isSuper = u.roles.includes("super_admin");
            return (
              <div key={u.id} className="p-4 grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.email ?? u.id}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    {u.last_sign_in_at && ` · last seen ${new Date(u.last_sign_in_at).toLocaleDateString()}`}
                  </p>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {isSuper && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-maroon text-cream">Super Admin</span>}
                    {isAdmin && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-maroon">Admin</span>}
                    {!isAdmin && !isSuper && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-mist text-muted-foreground">User</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button onClick={() => toggle(u.id, "admin", !isAdmin)} className="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-maroon/20 text-maroon hover:bg-maroon/5">
                    {isAdmin ? "Revoke Admin" : "Make Admin"}
                  </button>
                  <button onClick={() => toggle(u.id, "super_admin", !isSuper)} className="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-maroon/20 text-maroon hover:bg-maroon/5">
                    {isSuper ? "Revoke Super" : "Make Super"}
                  </button>
                  <button onClick={() => remove(u.id, u.email)} className="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-maroon/20 text-maroon hover:bg-maroon/5" title="Delete user">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {users.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No users found.</p>}
        </div>
      )}
    </div>
  );
}

