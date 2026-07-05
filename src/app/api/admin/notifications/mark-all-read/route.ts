import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// POST — tandai semua notifikasi sebagai sudah dibaca.
export const POST = withAdmin(
  async () => {
    await notificationService.markAllAsRead();
    return NextResponse.json({ success: true });
  },
  { action: "UPDATE", entity: "Notification" }
);
