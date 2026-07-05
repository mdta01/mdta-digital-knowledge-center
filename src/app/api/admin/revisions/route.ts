import { NextRequest, NextResponse } from "next/server";
import { revisionService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// GET — daftar revisi untuk sebuah buku. ?bookId=...&limit=20
export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
  if (!bookId) {
    return NextResponse.json(
      { error: "Parameter bookId wajib diisi" },
      { status: 400 }
    );
  }
  const data = await revisionService.listByBook(bookId, limit);
  return NextResponse.json({ data });
});
