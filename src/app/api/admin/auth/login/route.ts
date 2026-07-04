import { NextRequest, NextResponse } from "next/server";
import { userRepository, activityLogRepository } from "@/lib/repositories";
import { verifyPassword, setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email atau password tidak valid" },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await userRepository.findByEmail(email);
    if (!user || user.deletedAt || !user.isActive) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    await userRepository.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    await setSessionCookie(payload);

    await activityLogRepository.create({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error("[admin login] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
