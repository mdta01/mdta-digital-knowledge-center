import { NextRequest, NextResponse } from "next/server";
import { authorService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const result = await authorService.list({ search, pageSize: 100 });
  return NextResponse.json(result);
}
