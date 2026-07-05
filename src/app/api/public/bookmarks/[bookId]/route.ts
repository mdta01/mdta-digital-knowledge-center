import { NextRequest, NextResponse } from "next/server";
import { bookmarkService } from "@/lib/services";

export const dynamic = "force-dynamic";

function getSessionId(req: NextRequest): string {
  return (
    req.headers.get("x-session-id") ||
    new URL(req.url).searchParams.get("sessionId") ||
    "anon-" + Math.random().toString(36).slice(2, 10)
  );
}

// GET — cek apakah buku sudah di-bookmark oleh sesi ini.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await ctx.params;
  const sessionId = getSessionId(req);
  const bookmarked = await bookmarkService.isBookmarked(bookId, sessionId);
  return NextResponse.json({ bookmarked });
}

// POST — toggle bookmark (buat / hapus). Body opsional: { note }.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await ctx.params;
    const sessionId = getSessionId(req);
    let note: string | undefined;
    try {
      const body = await req.json();
      note = typeof body?.note === "string" ? body.note : undefined;
    } catch {
      // Body kosong / bukan JSON — abaikan.
    }
    const result = await bookmarkService.toggle(bookId, sessionId, note);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[public bookmarks POST]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — hapus bookmark untuk sesi ini.
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await ctx.params;
    const sessionId = getSessionId(req);
    await bookmarkService.toggle(bookId, sessionId);
    return NextResponse.json({ bookmarked: false });
  } catch (e) {
    console.error("[public bookmarks DELETE]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
