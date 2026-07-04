import { NextRequest, NextResponse } from "next/server";
import { bookService, authorService, categoryService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = Number(searchParams.get("limit") || "8");

  const [books, authors, categories] = await Promise.all([
    bookService.listPublished({ search: q, pageSize: limit }),
    authorService.list({ search: q, pageSize: limit }),
    categoryService.list({ search: q }),
  ]);

  return NextResponse.json({
    query: q,
    books: books.data,
    authors: authors.data,
    categories: categories.data.slice(0, limit),
  });
}
