import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="px-6 md:px-10 pt-6">
      <ol className="mx-auto max-w-6xl flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-maroon transition">Home</Link>
        </li>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 opacity-50" aria-hidden />
              {isLast ? (
                <span aria-current="page" className="text-maroon">{c.name}</span>
              ) : (
                <Link to={c.path as any} className="hover:text-maroon transition">{c.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
