import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services";
import { createBookSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const result = await bookService.listAll({ page, pageSize, search, status });
  return NextResponse.json(result);
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const parsed = createBookSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validasi gagal", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const book = await bookService.create(parsed.data);
      return NextResponse.json(book, { status: 201 });
    } catch (e) {
      console.error("[admin books POST]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  },
  { action: "CREATE", entity: "Book" }
);
