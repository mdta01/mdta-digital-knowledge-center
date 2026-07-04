import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const overview = await dashboardService.getOverview();
  return NextResponse.json(overview);
});
