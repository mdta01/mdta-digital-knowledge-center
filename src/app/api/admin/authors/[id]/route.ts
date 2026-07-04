import { NextRequest, NextResponse } from "next/server";
import { authorService } from "@/lib/services";
import { updateAuthorSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const author = await authorService.getBySlug
      ? await import("@/lib/repositories").then((m) =>
          m.authorRepository.findById(id)
        )
      : null;
    if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(author);
  }
);

export const PUT = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateAuthorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const author = await authorService.update(id, parsed.data);
    return NextResponse.json(author);
  },
  { action: "UPDATE", entity: "Author", entityIdParam: "id" }
);

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await authorService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Author", entityIdParam: "id" }
);
