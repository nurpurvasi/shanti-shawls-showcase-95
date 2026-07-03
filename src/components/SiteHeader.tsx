import { Link } from "@tanstack/react-router";
import { useState } from "react";
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-maroon/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-xl font-medium uppercase tracking-tight text-maroon">Shanti</span>
          <span className="mt-0.5 eyebrow !text-[8px] !tracking-[0.5em] text-muted-foreground">Shawls Emporium</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs uppercase tracking-[0.18em] text-ink/70 hover:text-maroon transition"
              activeProps={{ className: "text-maroon" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-maroon p-2 -mr-2"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[9999] md:hidden bg-cream shadow-2xl animate-slide-in-right flex flex-col"
          style={{ opacity: 1, backgroundColor: "var(--color-cream)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-maroon/10 bg-cream">
            <Link to="/" onClick={() => setOpen(false)} className="flex flex-col leading-none">
              <span className="font-display text-xl font-medium uppercase tracking-tight text-maroon">Shanti</span>
              <span className="mt-0.5 eyebrow !text-[8px] !tracking-[0.5em] text-muted-foreground">Shawls Emporium</span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-maroon">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col px-6 py-10 gap-6 overflow-y-auto bg-cream">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display text-3xl text-maroon"
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
    </header>
  );
}
