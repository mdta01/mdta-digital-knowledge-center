import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { activityLogRepository } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session) {
    await activityLogRepository.create({
      userId: session.userId,
      action: "LOGOUT",
      entity: "User",
      entityId: session.userId,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
