import { NextRequest, NextResponse } from "next/server";
import { tagService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const tags = await tagService.list(search);
  return NextResponse.json(tags);
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    const body = await req.json();
    const tag = await tagService.create(body);
    return NextResponse.json(tag, { status: 201 });
  },
  { action: "CREATE", entity: "Tag" }
);
