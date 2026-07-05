import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services";
import { analyticsEventSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

function getSessionId(req: NextRequest): string {
  return (
    req.headers.get("x-session-id") ||
    new URL(req.url).searchParams.get("sessionId") ||
    "anon-" + Math.random().toString(36).slice(2, 10)
  );
}

// Deteksi tipe perangkat dari User-Agent.
function detectDevice(ua: string | null): string {
  if (!ua) return "unknown";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

// Deteksi browser kasar dari User-Agent (untuk kolom `browser`).
function detectBrowser(ua: string | null): string {
  if (!ua) return "unknown";
  if (/edg/i.test(ua)) return "edge";
  if (/chrome|crios/i.test(ua)) return "chrome";
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/safari/i.test(ua)) return "safari";
  return "other";
}

// POST — catat event analitik. Selalu 200 agar tidak memblokir pengguna.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 200 } // tetap 200, jangan ganggu pengguna
      );
    }
    const ua = req.headers.get("user-agent");
    await analyticsService.track({
      type: parsed.data.type,
      entity: parsed.data.entity || null,
      entityId: parsed.data.entityId || null,
      path: parsed.data.path || null,
      referrer: parsed.data.referrer || null,
      sessionId: getSessionId(req),
      device: detectDevice(ua),
      browser: detectBrowser(ua),
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[analytics track]", e);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
