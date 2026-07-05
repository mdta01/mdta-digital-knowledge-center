import { NextRequest, NextResponse } from "next/server";
import { pageService } from "@/lib/services";
import { createPageSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "50");
  const search = searchParams.get("search") || undefined;
  const result = await pageService.list({ page, pageSize, search });
  return NextResponse.json(result);
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const page = await pageService.create(parsed.data);
    return NextResponse.json(page, { status: 201 });
  },
  { action: "CREATE", entity: "Page" }
);
