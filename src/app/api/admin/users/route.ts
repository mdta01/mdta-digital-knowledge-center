import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services";
import { createUserSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "50");
    const search = searchParams.get("search") || undefined;
    const result = await userService.list({ page, pageSize, search });
    return NextResponse.json(result);
  },
  { requireRole: "ADMIN" }
);

export const POST = withAdmin(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const user = await userService.create(parsed.data);
    return NextResponse.json(user, { status: 201 });
  },
  { requireRole: "SUPER_ADMIN", action: "CREATE", entity: "User" }
);
