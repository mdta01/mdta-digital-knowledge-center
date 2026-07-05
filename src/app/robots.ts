import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mdta-miftahululum.sch.id";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin", "/api/public/progress", "/api/public/analytics"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
