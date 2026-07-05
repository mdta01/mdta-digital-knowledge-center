import { Metadata } from "next";
import { categoryService, bookService } from "@/lib/services";
import { KnowledgeHubClient } from "./knowledge-hub-client";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description:
    "Jelajahi seluruh pengetahuan Islam dalam satu halaman — Kitab, Buku, Artikel, Audio, Video, Materi Diniyah, dan Dokumen. Filter, grid/list/compact views.",
};

export const dynamic = "force-dynamic";

export default async function KnowledgeHubPage() {
  const [categories, counts] = await Promise.all([
    categoryService.list(),
    bookService.stats(),
  ]);

  const byType = counts.byType || {};

  return (
    <KnowledgeHubClient
      categories={categories.data}
      counts={{
        total: counts.total,
        published: counts.published,
        byType,
      }}
    />
  );
}
