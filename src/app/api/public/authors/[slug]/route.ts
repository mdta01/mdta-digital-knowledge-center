import { NextRequest, NextResponse } from "next/server";
import { authorService, bookService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const author = await authorService.getBySlug(slug);
  if (!author) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const books = await bookService.listPublished({
    pageSize: 100,
    authorId: author.id,
  });
  return NextResponse.json({ author, books });
}
