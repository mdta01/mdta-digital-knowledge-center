import { NextRequest, NextResponse } from "next/server";
import { pageRepository, pageService } from "@/lib/repositories";
import { updatePageSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const p = await pageRepository.findById(id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(p);
  }
);

export const PUT = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const p = await pageService.update(id, parsed.data);
    return NextResponse.json(p);
  },
  { action: "UPDATE", entity: "Page", entityIdParam: "id" }
);

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await pageService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Page", entityIdParam: "id" }
);
