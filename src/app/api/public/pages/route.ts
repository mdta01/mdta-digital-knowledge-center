import { NextRequest, NextResponse } from "next/server";
import { pageService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const result = await pageService.list({ pageSize: 50 });
  return NextResponse.json(result);
}
