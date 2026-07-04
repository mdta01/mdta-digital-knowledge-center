import { NextRequest, NextResponse } from "next/server";
import { activityLogService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const entity = searchParams.get("entity") || undefined;
  const result = await activityLogService.list({ page, pageSize, entity });
  return NextResponse.json(result);
});
