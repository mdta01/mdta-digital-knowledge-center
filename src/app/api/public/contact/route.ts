import { NextRequest, NextResponse } from "next/server";
import { contactMessageService } from "@/lib/services";
import { contactSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const msg = await contactMessageService.create(parsed.data);
    return NextResponse.json({ success: true, id: msg.id });
  } catch (e) {
    console.error("[contact] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
