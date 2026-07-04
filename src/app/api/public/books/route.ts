import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "12");
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const authorId = searchParams.get("authorId") || undefined;

  const result = await bookService.listPublished({
    page,
    pageSize,
    search,
    categoryId: categoryId || undefined,
    authorId: authorId || undefined,
  });
  return NextResponse.json(result);
}
