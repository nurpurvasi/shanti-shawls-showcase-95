import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Star, Upload, Save, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  upsertProduct, deleteProduct,
  upsertCategory, deleteCategory,
  upsertReview, deleteReview,
  upsertGalleryItem, deleteGalleryItem,
  upsertSetting, upsertSection, deleteSection,
  uploadMedia,
} from "@/lib/admin.functions";
import { fetchAdminData } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => fetchAdminData(),
  });

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

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-maroon/10 bg-ivory/80 backdrop-blur sticky top-0 z-40">
        <div className="px-6 md:px-10 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="font-display text-xl text-maroon">Shanti Shawls Emporium</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs uppercase tracking-[0.18em] text-maroon hover:underline">View site</Link>
            <button onClick={signOut} className="ml-3 inline-flex items-center gap-2 rounded-full border border-maroon/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-maroon hover:bg-maroon/5">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="flex flex-wrap gap-1 bg-ivory border border-maroon/10 rounded-full p-1 h-auto w-full md:w-auto">
            {["products","categories","gallery","reviews","homepage","settings"].map((t) => (
              <TabsTrigger key={t} value={t} className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] data-[state=active]:bg-maroon data-[state=active]:text-cream">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="products" className="mt-8"><ProductsTab data={data} onChange={refresh} /></TabsContent>
          <TabsContent value="categories" className="mt-8"><CategoriesTab data={data} onChange={refresh} /></TabsContent>
          <TabsContent value="gallery" className="mt-8"><GalleryTab data={data} onChange={refresh} /></TabsContent>
          <TabsContent value="reviews" className="mt-8"><ReviewsTab data={data} onChange={refresh} /></TabsContent>
          <TabsContent value="homepage" className="mt-8"><SectionsTab data={data} onChange={refresh} /></TabsContent>
          <TabsContent value="settings" className="mt-8"><SettingsTab data={data} onChange={refresh} /></TabsContent>
        </Tabs>
      </main>
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
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-2xl text-maroon">Products ({data.products.length})</h2>
          <PrimaryBtn onClick={() => setEditing({ name: "", slug: "", price: 0, is_available: true, sort_order: 0, images: [] })}>
            <Plus className="size-3.5" /> New
          </PrimaryBtn>
        </div>
        <div className="rounded-2xl border border-maroon/10 bg-ivory divide-y divide-maroon/5">
          {data.products.map((p: any) => (
            <button key={p.id} onClick={() => setEditing(p)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-maroon/5">
              <img src={p.images?.[0] ?? "/placeholder.svg"} alt="" className="size-14 rounded-lg object-cover bg-mist" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatINR(p.discount_price ?? p.price)} {p.is_featured && "· ★"} {p.is_new_arrival && "· NEW"} {!p.is_available && "· OOS"}</p>
              </div>
            </button>
          ))}
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
      await upsertProduct({ data: { ...f, slug, price: Number(f.price), discount_price: f.discount_price ? Number(f.discount_price) : null, sort_order: Number(f.sort_order || 0) } });
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

  return (
    <div className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 sticky top-24">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-maroon">{f.id ? "Edit" : "New"} product</h3>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-maroon">Close</button>
      </div>
      <Field label="Name"><input className={inputCls} value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Slug (auto from name)"><input className={inputCls} value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="optional" /></Field>
      <Field label="Category">
        <select className={inputCls} value={f.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
          <option value="">— None —</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Description"><textarea rows={3} className={inputCls} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (INR)"><input type="number" className={inputCls} value={f.price ?? 0} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="Discount price"><input type="number" className={inputCls} value={f.discount_price ?? ""} onChange={(e) => set("discount_price", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Field label="Material"><input className={inputCls} value={f.material ?? ""} onChange={(e) => set("material", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_available} onChange={(e) => set("is_available", e.target.checked)} /> In stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_new_arrival} onChange={(e) => set("is_new_arrival", e.target.checked)} /> New</label>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Images</span>
          <button onClick={addImage} className="text-xs text-maroon flex items-center gap-1"><ImagePlus className="size-3.5" /> Add</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(f.images ?? []).map((url: string, i: number) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-mist">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => set("images", f.images.filter((_: any, j: number) => j !== i))} className="absolute top-1 right-1 bg-maroon text-cream rounded-full p-1 opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>
            </div>
          ))}
        </div>
      </div>
      <Field label="Sort order"><input type="number" className={inputCls} value={f.sort_order ?? 0} onChange={(e) => set("sort_order", e.target.value)} /></Field>
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
          <div key={g.id} className="rounded-2xl overflow-hidden bg-ivory border border-maroon/10">
            <img src={g.image_url} alt="" className="w-full aspect-square object-cover" />
            <div className="p-3 space-y-2">
              <input defaultValue={g.caption ?? ""} placeholder="Caption" onBlur={(e) => e.target.value !== (g.caption ?? "") && updateCaption(g, e.target.value)} className={inputCls + " text-xs"} />
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

// ---------- HOMEPAGE SECTIONS ----------

function SectionsTab({ data, onChange }: any) {
  const grouped = useMemo(() => {
    const m: Record<string, any[]> = {};
    data.sections.forEach((s: any) => { (m[s.section_key] = m[s.section_key] || []).push(s); });
    return m;
  }, [data.sections]);

  async function addNew(key: string) {
    try { await upsertSection({ data: { section_key: key, title: "New item", content: "", sort_order: (grouped[key]?.length ?? 0) } }); onChange(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function save(s: any) {
    try { await upsertSection({ data: s }); toast.success("Saved"); onChange(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    try { await deleteSection({ data: { id } }); onChange(); } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-10">
      {(["why_us","faq"] as const).map((key) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display text-2xl text-maroon capitalize">{key.replace("_"," ")}</h2>
            <PrimaryBtn onClick={() => addNew(key)}><Plus className="size-3.5" /> Add</PrimaryBtn>
          </div>
          <div className="space-y-3">
            {(grouped[key] ?? []).map((s) => <SectionRow key={s.id} item={s} onSave={save} onRemove={remove} hasSubtitle={key === "why_us"} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionRow({ item, onSave, onRemove, hasSubtitle }: any) {
  const [f, setF] = useState<any>(item);
  useEffect(() => setF(item), [item]);
  return (
    <div className="rounded-2xl border border-maroon/10 bg-ivory p-5 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
      <input className={inputCls} value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" />
      {hasSubtitle
        ? <input className={inputCls} value={f.subtitle ?? ""} onChange={(e) => setF({ ...f, subtitle: e.target.value })} placeholder="Subtitle" />
        : <textarea rows={2} className={inputCls} value={f.content ?? ""} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Answer" />}
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} className="rounded-full bg-maroon text-cream px-4 py-2 text-xs uppercase tracking-[0.18em]"><Save className="size-3.5" /></button>
        <button onClick={() => onRemove(f.id)} className="rounded-full border border-maroon/20 px-4 py-2 text-xs"><Trash2 className="size-3.5" /></button>
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
  const [busy, setBusy] = useState(false);

  async function saveAll() {
    setBusy(true);
    try {
      await Promise.all([
        upsertSetting({ data: { key: "contact", value: contact } }),
        upsertSetting({ data: { key: "hero", value: hero } }),
        upsertSetting({ data: { key: "brand", value: brand } }),
        upsertSetting({ data: { key: "social", value: social } }),
      ]);
      toast.success("Settings saved");
      onChange();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); } finally { setBusy(false); }
  }
  async function uploadHero() {
    const url = await pickAndUpload("hero");
    if (url) setHero({ ...hero, image_url: url });
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4">
        <h3 className="font-display text-xl text-maroon">Contact</h3>
        <Field label="Phone"><input className={inputCls} value={contact.phone ?? ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
        <Field label="WhatsApp (with country code)"><input className={inputCls} value={contact.whatsapp ?? ""} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="+91..." /></Field>
        <Field label="Email"><input className={inputCls} value={contact.email ?? ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
        <Field label="Address"><textarea rows={2} className={inputCls} value={contact.address ?? ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></Field>
        <Field label="Business Hours"><input className={inputCls} value={contact.hours ?? ""} onChange={(e) => setContact({ ...contact, hours: e.target.value })} /></Field>
        <Field label="Google Maps Embed URL"><input className={inputCls} value={contact.map_embed ?? ""} onChange={(e) => setContact({ ...contact, map_embed: e.target.value })} placeholder="https://www.google.com/maps/embed?..." /></Field>
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

        <h3 className="font-display text-xl text-maroon pt-4 border-t border-maroon/10">Brand</h3>
        <Field label="Tagline"><input className={inputCls} value={brand.tagline ?? ""} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} /></Field>
        <Field label="Established Year"><input className={inputCls} value={brand.established ?? ""} onChange={(e) => setBrand({ ...brand, established: e.target.value })} /></Field>
      </section>

      <section className="rounded-2xl border border-maroon/10 bg-ivory p-6 space-y-4 md:col-span-2">
        <h3 className="font-display text-xl text-maroon">Social Links</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Facebook URL"><input className={inputCls} value={social.facebook ?? ""} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://www.facebook.com/..." /></Field>
          <Field label="Instagram URL"><input className={inputCls} value={social.instagram ?? ""} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="https://www.instagram.com/..." /></Field>
        </div>
      </section>

      <div className="md:col-span-2"><PrimaryBtn onClick={saveAll} disabled={busy}><Save className="size-3.5" /> Save all settings</PrimaryBtn></div>
    </div>
  );
}
