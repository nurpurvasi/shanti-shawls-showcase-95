import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Collection" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "Our Story" },
  { to: "/reviews", label: "Reviews" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

type Brand = { name?: string; logo_url?: string; established?: string };

export function SiteHeader({ brand }: { brand?: Brand } = {}) {
  const logoUrl = brand?.logo_url;
  const brandName = brand?.name ?? "Shanti Shawls Emporium";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-full focus:bg-maroon focus:text-cream focus:text-xs focus:uppercase focus:tracking-widest"
    >
      Skip to content
    </a>
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-maroon/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3 leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm" aria-label={`${brandName} — home`}>
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-10 w-auto max-w-[180px] object-contain" />
          ) : (
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-medium uppercase tracking-tight text-maroon">Shanti</span>
              <span className="mt-0.5 eyebrow !text-[8px] !tracking-[0.5em] text-muted-foreground">Shawls Emporium</span>
            </span>
          )}
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs uppercase tracking-[0.18em] text-ink/80 hover:text-maroon transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm px-1"
              activeProps={{ className: "text-maroon" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-maroon p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>
    </header>
    

    {open && (
      <div
        id="mobile-nav"
        className="fixed inset-0 z-[9999] md:hidden flex flex-col"
        style={{ opacity: 1, backgroundColor: "var(--color-cream)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-maroon/10 shrink-0">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 leading-none" aria-label={`${brandName} — home`}>
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-10 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-medium uppercase tracking-tight text-maroon">Shanti</span>
                <span className="mt-0.5 eyebrow !text-[8px] !tracking-[0.5em] text-muted-foreground">Shawls Emporium</span>
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile primary" className="flex flex-1 flex-col px-6 py-10 gap-6 overflow-y-auto">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="font-display text-3xl text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="mt-8 eyebrow !text-muted-foreground"
          >
            Admin sign in
          </Link>
        </nav>
      </div>
    )}
    </>
  );
}
