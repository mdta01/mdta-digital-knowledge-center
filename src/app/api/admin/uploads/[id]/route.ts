import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await uploadService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Upload", entityIdParam: "id" }
);
