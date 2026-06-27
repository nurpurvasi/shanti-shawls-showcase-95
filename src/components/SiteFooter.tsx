import { Link } from "@tanstack/react-router";

type Contact = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  hours?: string;
};

export function SiteFooter({ contact }: { contact?: Contact }) {
  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-3xl tracking-tight">Shanti Shawls Emporium</h2>
            <p className="mt-4 text-cream/60 text-sm max-w-xs leading-relaxed">
              A family-run atelier preserving the heritage of hand-woven Kashmiri shawls since 1974.
            </p>
            {contact?.address && (
              <p className="mt-6 text-xs text-cream/50 leading-relaxed">{contact.address}</p>
            )}
            {contact?.hours && (
              <p className="mt-2 text-xs text-cream/50">{contact.hours}</p>
            )}
          </div>
          <div>
            <p className="eyebrow !text-gold">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/products" className="text-cream/70 hover:text-gold">Collection</Link></li>
              <li><Link to="/gallery" className="text-cream/70 hover:text-gold">Gallery</Link></li>
              <li><Link to="/about" className="text-cream/70 hover:text-gold">Our Story</Link></li>
              <li><Link to="/reviews" className="text-cream/70 hover:text-gold">Reviews</Link></li>
              <li><Link to="/faq" className="text-cream/70 hover:text-gold">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-gold">Reach Us</p>
            <ul className="mt-4 space-y-2 text-sm">
              {contact?.phone && <li><a href={`tel:${contact.phone}`} className="text-cream/70 hover:text-gold">{contact.phone}</a></li>}
              {contact?.email && <li><a href={`mailto:${contact.email}`} className="text-cream/70 hover:text-gold">{contact.email}</a></li>}
              <li><Link to="/contact" className="text-cream/70 hover:text-gold">Visit our showroom</Link></li>
              <li><Link to="/auth" className="text-cream/40 hover:text-gold text-xs">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-6 border-t border-cream/10 flex flex-col md:flex-row justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-cream/40">
          <span>© {new Date().getFullYear()} Shanti Shawls Emporium</span>
          <span>Hand-woven in the Kashmir Valley</span>
        </div>
      </div>
    </footer>
  );
}
