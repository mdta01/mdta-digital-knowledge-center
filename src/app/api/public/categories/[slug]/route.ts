import { NextRequest, NextResponse } from "next/server";
import { categoryService, bookService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const category = await categoryService.getBySlug(slug);
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const books = await bookService.listPublished({
    pageSize: 100,
    categoryId: category.id,
  });
  return NextResponse.json({ category, books });
}
