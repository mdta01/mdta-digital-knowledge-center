import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// GET — daftar notifikasi (semua admin). Filter isRead opsional via ?isRead=true|false.
export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const isReadParam = searchParams.get("isRead");
  const isRead =
    isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;

  const result = await notificationService.list({ page, pageSize, isRead });
  return NextResponse.json(result);
});
