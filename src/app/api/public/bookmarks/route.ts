import { NextRequest, NextResponse } from "next/server";
import { bookmarkService } from "@/lib/services";

export const dynamic = "force-dynamic";

// Mengambil session ID dari header atau query (fallback: ID anonim acak).
function getSessionId(req: NextRequest): string {
  return (
    req.headers.get("x-session-id") ||
    new URL(req.url).searchParams.get("sessionId") ||
    "anon-" + Math.random().toString(36).slice(2, 10)
  );
}

// GET — daftar bookmark milik sesi ini (termasuk data buku).
export async function GET(req: NextRequest) {
  const sessionId = getSessionId(req);
  const bookmarks = await bookmarkService.listBySession(sessionId);
  return NextResponse.json({ data: bookmarks });
}
