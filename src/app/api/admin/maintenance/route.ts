import { NextRequest, NextResponse } from "next/server";
import { maintenanceService } from "@/lib/services";
import { maintenanceSchema } from "@/lib/validators";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// GET — status maintenance saat ini (semua admin).
export const GET = withAdmin(async () => {
  const status = await maintenanceService.getStatus();
  return NextResponse.json(status);
});

// PUT — perbarui status maintenance (SUPER_ADMIN only).
// Body sesuai `maintenanceSchema` (enabled, message?, startTime?, endTime?, whitelistedIps?).
export const PUT = withAdmin(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const parsed = maintenanceSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validasi gagal", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      // maintenanceService.setStatus menerima `start`/`end`, sedangkan schema
      // menggunakan `startTime`/`endTime` — petakan di sini.
      await maintenanceService.setStatus({
        enabled: parsed.data.enabled,
        message: parsed.data.message,
        start: parsed.data.startTime,
        end: parsed.data.endTime,
        whitelistedIps: parsed.data.whitelistedIps,
      });
      const status = await maintenanceService.getStatus();
      return NextResponse.json(status);
    } catch (e) {
      console.error("[admin maintenance PUT]", e);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  { requireRole: "SUPER_ADMIN", action: "UPDATE", entity: "Setting" }
);
