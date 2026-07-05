import { NextResponse } from "next/server";
import { settingService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await settingService.getAll();
  return NextResponse.json(settings);
}
