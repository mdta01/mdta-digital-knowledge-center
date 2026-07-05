import { NextRequest, NextResponse } from "next/server";
import { contactMessageService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const PATCH = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await contactMessageService.markAsRead(id);
    return NextResponse.json({ success: true });
  }
);

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await contactMessageService.delete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "ContactMessage", entityIdParam: "id" }
);
