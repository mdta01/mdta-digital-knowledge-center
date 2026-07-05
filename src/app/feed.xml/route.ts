import { bookService } from "@/lib/services";

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mdta-miftahululum.sch.id";

  const result = await bookService.listPublished({ pageSize: 20 });
  const books = result.data;

  const items = books
    .map((b) => {
      const description =
        b.excerpt ||
        b.description ||
        (b.content ? stripHtml(b.content).slice(0, 280) : "");
      const url = `${base}/books/${b.slug}`;
      return `    <item>
      <title>${escapeXml(b.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(b.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
      ${b.author ? `<dc:creator>${escapeXml(b.author.name)}</dc:creator>` : ""}
      ${b.category ? `<category>${escapeXml(b.category.name)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MDTA Digital Knowledge Center</title>
    <link>${escapeXml(base)}</link>
    <atom:link href="${escapeXml(base + "/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>Pengetahuan Islam terbaru: kitab, buku, artikel, materi pembelajaran, audio, video, dan referensi keislaman dari MDTA Digital Knowledge Center. Membangun Peradaban Melalui Ilmu dan Teknologi.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js 16 — MDTA Digital Knowledge Center</generator>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
