import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services";
import { updateBookSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const book = await bookService.getById(id);
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(book);
  }
);

export const PUT = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    try {
      const body = await req.json();
      const parsed = updateBookSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validasi gagal", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const book = await bookService.update(id, parsed.data);
      return NextResponse.json(book);
    } catch (e) {
      console.error("[admin books PUT]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  },
  { action: "UPDATE", entity: "Book", entityIdParam: "id" }
);

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await bookService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { action: "DELETE", entity: "Book", entityIdParam: "id" }
);
