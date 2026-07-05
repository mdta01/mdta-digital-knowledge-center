import { NextRequest, NextResponse } from "next/server";
import { settingService } from "@/lib/services";
import { settingsSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const settings = await settingService.getAll();
  return NextResponse.json(settings);
});

export const PUT = withAdmin(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await settingService.updateAll(parsed.data);
    return NextResponse.json({ success: true });
  },
  { requireRole: "SUPER_ADMIN", action: "UPDATE", entity: "Setting" }
);
