import type { MetadataRoute } from "next";
import { bookService, authorService, categoryService, pageService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mdta-miftahululum.sch.id";
  const staticRoutes = [
    "/",
    "/books",
    "/kitab",
    "/artikel",
    "/audio",
    "/video",
    "/materi",
    "/bookmarks",
    "/categories",
    "/authors",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const [books, authors, categories, pages] = await Promise.all([
    bookService.listPublished({ pageSize: 1000 }),
    authorService.list({ pageSize: 1000 }),
    categoryService.list(),
    pageService.list({ pageSize: 100 }),
  ]);

  const urls: MetadataRoute.Sitemap = [
    ...staticRoutes.map((r) => ({
      url: `${base}${r}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: r === "/" ? 1 : 0.8,
    })),
    ...books.data.map((b) => ({
      url: `${base}/books/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...books.data
      .filter((b) => b.files.some((f) => f.format === "PDF" || f.format === "EPUB") || b.videoUrl || b.audioUrl)
      .map((b) => ({
        url: `${base}/read/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...authors.data.map((a) => ({
      url: `${base}/authors/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...categories.data.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...pages.data.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
  return urls;
}
