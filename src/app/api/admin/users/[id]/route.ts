import { NextRequest, NextResponse } from "next/server";
import { userRepository, userService } from "@/lib/repositories";
import { updateUserWithoutPasswordSchema } from "@/lib/validators";
import { getSession } from "@/lib/auth/session";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const u = await userRepository.findById(id);
    if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { password, ...safe } = u;
    return NextResponse.json(safe);
  },
  { requireRole: "ADMIN" }
);

export const PUT = withAdmin(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const session = await getSession();
    // Only SUPER_ADMIN can change role
    const body = await req.json();
    const parsed = updateUserWithoutPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (parsed.data.role && session?.role !== "SUPER_ADMIN") {
      delete parsed.data.role;
    }
    const u = await userService.update(id, parsed.data);
    const { password, ...safe } = u;
    return NextResponse.json(safe);
  },
  { requireRole: "ADMIN", action: "UPDATE", entity: "User", entityIdParam: "id" }
);

export const DELETE = withAdmin(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const session = await getSession();
    if (session?.userId === id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }
    await userService.softDelete(id);
    return NextResponse.json({ success: true });
  },
  { requireRole: "SUPER_ADMIN", action: "DELETE", entity: "User", entityIdParam: "id" }
);
