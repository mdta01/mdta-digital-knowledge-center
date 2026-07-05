import { NextRequest, NextResponse } from "next/server";
import {
  bookService,
  authorService,
  categoryService,
  pageService,
} from "@/lib/services";

export const dynamic = "force-dynamic";

// Pencarian cepat untuk Command Palette — minimal fields untuk respons ringan.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(Number(searchParams.get("limit") || "10"), 25);

  if (!q.trim()) {
    return NextResponse.json({
      books: [],
      authors: [],
      categories: [],
      pages: [],
    });
  }

  const [books, authors, categories, pages] = await Promise.all([
    bookService.listPublished({ search: q, pageSize: limit }),
    authorService.list({ search: q, pageSize: limit }),
    categoryService.list({ search: q }),
    pageService.list({ search: q, pageSize: limit }),
  ]);

  // Ambil hanya field yang dibutuhkan untuk dropdown Command Palette.
  return NextResponse.json({
    books: (books.data || []).map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      type: "book",
      collectionType: b.collectionType,
    })),
    authors: (authors.data || []).map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      type: "author",
    })),
    categories: (categories.data || []).slice(0, limit).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      type: "category",
    })),
    pages: (pages.data || [])
      .filter((p) => p.status === "PUBLISHED")
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: "page",
      })),
  });
}
