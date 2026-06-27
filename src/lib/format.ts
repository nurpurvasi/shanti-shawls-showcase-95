export function formatINR(value: number | null | undefined): string {
  if (value == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/[^\d]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function telLink(number: string): string {
  return `tel:${number.replace(/\s+/g, "")}`;
}
