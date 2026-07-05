import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// PATCH — tandai notifikasi sebagai sudah dibaca.
export const PATCH = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await notificationService.markAsRead(id);
    return NextResponse.json({ success: true });
  },
  { action: "UPDATE", entity: "Notification", entityIdParam: "id" }
);

// DELETE — hapus notifikasi.
export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await notificationService.delete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Notification", entityIdParam: "id" }
);
