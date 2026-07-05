import { NextRequest, NextResponse } from "next/server";
import { readingProgressService } from "@/lib/services";
import { readingProgressSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

function getSessionId(req: NextRequest): string {
  return (
    req.headers.get("x-session-id") ||
    new URL(req.url).searchParams.get("sessionId") ||
    "anon-" + Math.random().toString(36).slice(2, 10)
  );
}

// GET — riwayat baca untuk sesi ini.
export async function GET(req: NextRequest) {
  const sessionId = getSessionId(req);
  const items = await readingProgressService.listBySession(sessionId);
  return NextResponse.json({ data: items });
}

// POST — upsert progres baca { bookId, progress, lastPage? }.
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionId(req);
    const body = await req.json();
    const parsed = readingProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const progress = await readingProgressService.upsert(
      parsed.data.bookId,
      sessionId,
      parsed.data.progress,
      parsed.data.lastPage
    );
    return NextResponse.json(progress);
  } catch (e) {
    console.error("[public progress POST]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
