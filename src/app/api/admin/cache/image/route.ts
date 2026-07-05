import { NextResponse } from "next/server";
import { cacheService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// POST — bersihkan cache gambar (bust token di settings).
export const POST = withAdmin(
  async () => {
    const result = await cacheService.clearImageCache();
    return NextResponse.json(result);
  },
  { requireRole: "SUPER_ADMIN", action: "UPDATE", entity: "Setting" }
);
