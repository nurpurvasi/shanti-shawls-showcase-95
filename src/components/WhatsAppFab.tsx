import { useEffect, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/format";

type Props = {
  number?: string;
  phone?: string;
};

/**
 * Floating action stack: WhatsApp + Call + Back-to-top.
 * Keeps the existing component name so all routes render the full stack
 * without additional imports.
 */
export function WhatsAppFab({ number, phone }: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="grid place-items-center rounded-full bg-maroon text-cream shadow-lg shadow-black/20 transition hover:scale-105"
          style={{ width: 46, height: 46 }}
        >
          <ArrowUp className="size-5" />
        </button>
      )}
      {phone && (
        <a
          href={telLink(phone)}
          aria-label={`Call ${phone}`}
          className="grid place-items-center rounded-full bg-gold text-ink shadow-lg shadow-black/20 transition hover:scale-105"
          style={{ width: 52, height: 52 }}
        >
          <Phone className="size-5" />
        </a>
      )}
      {number && (
        <a
          href={whatsappLink(number, "Hello Shanti Shawls, I'd like to know more about your collection.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="grid place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
          style={{ width: 52, height: 52 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
        </a>
      )}
    </div>
  );
}
