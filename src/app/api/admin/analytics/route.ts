import { NextRequest, NextResponse } from "next/server";
import { analyticsService, bookService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// GET — ringkasan statistik analitik + breakdown konten buku.
export const GET = withAdmin(async (_req: NextRequest) => {
  const [analytics, bookStats] = await Promise.all([
    analyticsService.stats(),
    bookService.stats(),
  ]);
  return NextResponse.json({ analytics, books: bookStats });
});
