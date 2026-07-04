import { NextRequest, NextResponse } from "next/server";
import { categoryRepository, categoryService } from "@/lib/repositories";
import { updateCategorySchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const cat = await categoryRepository.findById(id);
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(cat);
  }
);

export const PUT = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const cat = await categoryService.update(id, parsed.data);
    return NextResponse.json(cat);
  },
  { action: "UPDATE", entity: "Category", entityIdParam: "id" }
);

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await categoryService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Category", entityIdParam: "id" }
);
