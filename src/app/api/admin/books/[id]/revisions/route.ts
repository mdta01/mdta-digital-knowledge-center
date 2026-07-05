import { NextRequest, NextResponse } from "next/server";
import { revisionService } from "@/lib/services";
import { getSession } from "@/lib/auth/session";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// POST — simpan snapshot revisi baru untuk buku ini.
// Body: { content, title, message? }
export const POST = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      if (typeof body?.content !== "string" || typeof body?.title !== "string") {
        return NextResponse.json(
          { error: "Field content dan title wajib diisi" },
          { status: 400 }
        );
      }
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const revision = await revisionService.saveRevision({
        bookId: id,
        content: body.content,
        title: body.title,
        message: typeof body.message === "string" ? body.message : undefined,
        userId: session.userId,
      });
      return NextResponse.json(revision, { status: 201 });
    } catch (e) {
      console.error("[admin book revisions POST]", e);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  { action: "CREATE", entity: "BookRevision", entityIdParam: "id" }
);
