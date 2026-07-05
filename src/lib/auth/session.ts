import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-production";
const COOKIE_NAME = "mdta_admin_session";
const SESSION_DAYS = 7;

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = signToken(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  // Verify the user is still active
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, isActive: true, deletedAt: true },
  });
  if (!user || !user.isActive || user.deletedAt) return null;
  return payload;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireAdmin();
  if (session.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/**
 * Seed an initial super admin if no users exist.
 * Reads credentials from env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
export async function ensureSeedAdmin(): Promise<void> {
  const count = await db.user.count();
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL || "admin@mdta-miftahululum.sch.id";
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const name = process.env.ADMIN_NAME || "Super Admin";
  const hashed = await hashPassword(password);
  await db.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`[seed] Created initial super admin: ${email}`);
}
