import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/lib/services";
import { createCategorySchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const result = await categoryService.list({ search });
  return NextResponse.json(result);
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const cat = await categoryService.create(parsed.data);
    return NextResponse.json(cat, { status: 201 });
  },
  { action: "CREATE", entity: "Category" }
);
