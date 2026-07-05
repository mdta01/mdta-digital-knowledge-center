import { NextResponse } from "next/server";
import { cacheService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

// POST — bangun ulang indeks pencarian.
export const POST = withAdmin(
  async () => {
    const result = await cacheService.rebuildSearchIndex();
    return NextResponse.json(result);
  },
  { requireRole: "SUPER_ADMIN", action: "UPDATE", entity: "Setting" }
);
