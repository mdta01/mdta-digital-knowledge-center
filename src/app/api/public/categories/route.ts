import { NextResponse } from "next/server";
import { categoryService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await categoryService.list();
  return NextResponse.json(result);
}
