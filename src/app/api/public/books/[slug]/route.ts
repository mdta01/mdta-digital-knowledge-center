import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = await bookService.getBySlug(slug);
  if (!book || book.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Increment views (fire and forget)
  bookService.incrementViews(book.id).catch(() => {});
  return NextResponse.json(book);
}
