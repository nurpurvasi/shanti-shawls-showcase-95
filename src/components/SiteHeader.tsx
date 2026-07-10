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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? "bg-cream/90 backdrop-blur-xl shadow-[0_1px_0_0_color-mix(in_oklch,var(--color-maroon)_10%,transparent)]" : "bg-cream/60 backdrop-blur-md"}`}>
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-6 md:px-10 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
        <Link to="/" className="flex items-center gap-3 leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm group" aria-label={`${brandName} — home`}>
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className={`w-auto object-contain transition-all duration-500 ${scrolled ? "h-9" : "h-11"} max-w-[180px] group-hover:opacity-90`} />
          ) : (
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl italic text-maroon">Shanti</span>
              <span className="mt-1 text-[8px] tracking-[0.5em] uppercase text-muted-foreground">Shawls Emporium</span>
            </span>
          )}
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="link-underline text-[11px] uppercase tracking-[0.22em] text-ink/75 hover:text-maroon transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm py-1"
              activeProps={{ className: "text-maroon", "data-active": "true" } as any}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-maroon p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm hover:bg-maroon/5 transition"
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
