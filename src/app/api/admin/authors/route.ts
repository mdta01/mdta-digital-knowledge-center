import { NextRequest, NextResponse } from "next/server";
import { authorService } from "@/lib/services";
import { createAuthorSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "50");
  const search = searchParams.get("search") || undefined;
  const result = await authorService.list({ page, pageSize, search });
  return NextResponse.json(result);
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createAuthorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const author = await authorService.create(parsed.data);
    return NextResponse.json(author, { status: 201 });
  },
  { action: "CREATE", entity: "Author" }
);
