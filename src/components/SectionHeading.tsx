import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  align = "center",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  align?: "center" | "left";
  children?: ReactNode;
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl md:text-4xl text-maroon text-balance leading-tight">{title}</h2>
      {children && <div className="mt-4 text-muted-foreground text-sm leading-relaxed">{children}</div>}
      <div className={`mt-5 h-px w-12 bg-gold/60 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
