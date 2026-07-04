import { NextRequest, NextResponse } from "next/server";
import { contactMessageService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const isReadParam = searchParams.get("isRead");
  const isRead = isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;
  const result = await contactMessageService.list({ page, pageSize, isRead });
  return NextResponse.json(result);
});
