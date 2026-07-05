import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/lib/services";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// PATCH — ganti nama upload (originalName). ADMIN+ boleh.
export const PATCH = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      if (typeof body?.originalName !== "string" || !body.originalName.trim()) {
        return NextResponse.json(
          { error: "originalName wajib diisi" },
          { status: 400 }
        );
      }
      const updated = await db.upload.update({
        where: { id },
        data: { originalName: body.originalName },
      });
      return NextResponse.json(updated);
    } catch (e) {
      console.error("[admin media PATCH]", e);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  { action: "UPDATE", entity: "Upload", entityIdParam: "id" }
);

// DELETE — soft delete upload.
export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await uploadService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Upload", entityIdParam: "id" }
);
