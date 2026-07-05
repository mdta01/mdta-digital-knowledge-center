import { NextResponse } from "next/server";
import { backupService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// GET — ekspor seluruh database sebagai JSON (SUPER_ADMIN only).
// File unduhan: mdta-backup-YYYY-MM-DD.json
export const GET = withAdmin(
  async () => {
    const data = await backupService.exportAll();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `mdta-backup-${date}.json`;
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  },
  { requireRole: "SUPER_ADMIN", action: "READ", entity: "Backup" }
);
