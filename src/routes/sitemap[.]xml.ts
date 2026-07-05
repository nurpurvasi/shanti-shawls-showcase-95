import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/products?category=premium-shawls", priority: "0.8" },
  { path: "/products?category=ladies-suits", priority: "0.8" },
  { path: "/products?category=winter-stoles", priority: "0.8" },
  { path: "/products?category=sarees", priority: "0.8" },
  { path: "/products?category=himachali-caps", priority: "0.8" },
  { path: "/gallery", priority: "0.7" },
  { path: "/about", priority: "0.6" },
  { path: "/reviews", priority: "0.6" },
  { path: "/faq", priority: "0.6" },
  { path: "/contact", priority: "0.7" },
];

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const req = getRequest();
        const url = new URL(req.url);
        const forwardedProto = req.headers.get("x-forwarded-proto");
        const forwardedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
        const protocol = forwardedProto ?? url.protocol.replace(":", "");
        const host = forwardedHost ?? url.host;
        const base = `${protocol}://${host}`;

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(base + e.path)}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
