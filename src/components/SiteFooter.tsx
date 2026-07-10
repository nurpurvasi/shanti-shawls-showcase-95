import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Phone, Mail, MessageCircle, Youtube } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/format";

type Contact = {
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  hours?: string;
  maps_link?: string;
};

type Social = { facebook?: string; instagram?: string; youtube?: string };
type Designer = { name?: string; email?: string; phone?: string };
type Brand = { name?: string; established?: string; tagline?: string; copyright?: string };

type Category = { slug: string; name: string };

const defaultCategories: Category[] = [
  { slug: "premium-shawls", name: "Premium Shawls" },
  { slug: "ladies-suits", name: "Ladies Suits" },
  { slug: "winter-stoles", name: "Winter Stoles" },
  { slug: "sarees", name: "Sarees" },
  { slug: "himachali-caps", name: "Himachali Caps" },
];

export function SiteFooter({
  contact,
  social,
  designer,
  brand,
  categories,
}: {
  contact?: Contact;
  social?: Social;
  designer?: Designer;
  brand?: Brand;
  categories?: Category[];
}) {
  const cats = categories && categories.length > 0 ? categories : defaultCategories;
  const brandName = brand?.name ?? "Shanti Shawls Emporium";
  const tagline =
    brand?.tagline ??
    "A trusted woollen garments and handicrafts emporium from the foothills of the Dhauladhar, Himachal Pradesh.";
  const established = brand?.established ?? "1985";

  return (
    <footer className="relative bg-ink text-cream mt-24">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="font-display italic text-3xl tracking-tight">{brandName}</h2>
            <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-gold">Est. {established}</p>
            <p className="mt-5 text-cream/65 text-sm leading-relaxed">{tagline}</p>
            {(social?.facebook || social?.instagram || social?.youtube) && (
              <div className="mt-6 flex gap-3">
                {social?.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid place-items-center size-9 rounded-full border border-cream/15 hover:border-gold hover:text-gold transition">
                    <Facebook className="size-4" />
                  </a>
                )}
                {social?.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid place-items-center size-9 rounded-full border border-cream/15 hover:border-gold hover:text-gold transition">
                    <Instagram className="size-4" />
                  </a>
                )}
                {social?.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid place-items-center size-9 rounded-full border border-cream/15 hover:border-gold hover:text-gold transition">
                    <Youtube className="size-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer quick links">
            <p className="eyebrow !text-gold">Quick Links</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="text-cream/80 hover:text-gold">Home</Link></li>
              <li><Link to="/products" className="text-cream/80 hover:text-gold">Collection</Link></li>
              <li><Link to="/gallery" className="text-cream/80 hover:text-gold">Gallery</Link></li>
              <li><Link to="/about" className="text-cream/80 hover:text-gold">Our Story</Link></li>
              <li><Link to="/reviews" className="text-cream/80 hover:text-gold">Reviews</Link></li>
              <li><Link to="/faq" className="text-cream/80 hover:text-gold">FAQ</Link></li>
              <li><Link to="/contact" className="text-cream/80 hover:text-gold">Contact</Link></li>
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Footer categories">
            <p className="eyebrow !text-gold">Categories</p>
            <ul className="mt-4 space-y-2 text-sm">
              {cats.map((c) => (
                <li key={c.slug}>
                  <Link to="/products" search={{ category: c.slug } as any} className="text-cream/80 hover:text-gold">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>


          {/* Contact */}
          <div>
            <p className="eyebrow !text-gold">Reach Us</p>
            <ul className="mt-4 space-y-3 text-sm">
              {contact?.address && (
                <li className="flex gap-2 text-cream/70"><MapPin className="size-4 mt-0.5 text-gold shrink-0" /><span className="leading-relaxed">{contact.address}</span></li>
              )}
              {contact?.phone && (
                <li className="flex gap-2"><Phone className="size-4 mt-0.5 text-gold shrink-0" /><a href={telLink(contact.phone)} className="text-cream/70 hover:text-gold">{contact.phone}</a></li>
              )}
              {contact?.phone2 && (
                <li className="flex gap-2"><Phone className="size-4 mt-0.5 text-gold shrink-0" /><a href={telLink(contact.phone2)} className="text-cream/70 hover:text-gold">{contact.phone2}</a></li>
              )}
              {contact?.whatsapp && (
                <li className="flex gap-2"><MessageCircle className="size-4 mt-0.5 text-gold shrink-0" /><a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-cream/70 hover:text-gold">{contact.whatsapp}</a></li>
              )}
              {contact?.email && (
                <li className="flex gap-2"><Mail className="size-4 mt-0.5 text-gold shrink-0" /><a href={`mailto:${contact.email}`} className="text-cream/70 hover:text-gold break-all">{contact.email}</a></li>
              )}
              {contact?.maps_link && (
                <li><a href={contact.maps_link} target="_blank" rel="noopener noreferrer" className="text-cream/70 hover:text-gold underline underline-offset-4">View on Google Maps</a></li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-cream/15 flex flex-col md:flex-row justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-cream/75">
          <span>{brand?.copyright ?? `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}</span>
          <span>
            Designed &amp; Developed by{" "}
            <span className="text-gold normal-case tracking-normal">
              {designer?.name ?? "Gaurav Bharti"}
            </span>
            {designer?.email && (
              <>
                {" · "}
                <a href={`mailto:${designer.email}`} className="text-cream/85 normal-case tracking-normal hover:text-gold">{designer.email}</a>
              </>
            )}
            {designer?.phone && (
              <>
                {" · "}
                <a href={telLink(designer.phone)} className="text-cream/85 normal-case tracking-normal hover:text-gold">{designer.phone}</a>
              </>
            )}
          </span>
        </div>

      </div>
    </footer>
  );
}
