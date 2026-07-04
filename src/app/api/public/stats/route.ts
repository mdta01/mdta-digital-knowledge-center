import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET() {
  // Public stats — limited subset
  const overview = await dashboardService.getOverview();
  return NextResponse.json({
    books: overview.books.total,
    published: overview.books.published,
    authors: overview.authors,
    categories: overview.categories,
    popularBooks: overview.popularBooks,
  });
}
