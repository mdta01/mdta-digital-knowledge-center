import { NextRequest, NextResponse } from "next/server";
import { revisionService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// GET — ambil satu revisi berdasarkan id.
export const GET = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const revision = await revisionService.getById(id);
    if (!revision) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(revision);
  }
);

// DELETE — hapus revisi (SUPER_ADMIN only).
export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await revisionService.delete(id);
    return NextResponse.json({ success: true });
  },
  {
    requireRole: "SUPER_ADMIN",
    action: "DELETE",
    entity: "BookRevision",
    entityIdParam: "id",
  }
);
