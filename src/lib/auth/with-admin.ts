/** Helper for admin routes — wraps handlers with auth + activity logging. */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { activityLogRepository } from "@/lib/repositories";

type Handler<TParams = Record<string, string>> = (
  req: NextRequest,
  ctx: { params: Promise<TParams> }
) => Promise<NextResponse> | NextResponse;

interface AdminHandlerOptions {
  requireRole?: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  action?: string;
  entity?: string;
  entityIdParam?: string;
}

export function withAdmin<TParams = Record<string, string>>(
  handler: Handler<TParams>,
  options: AdminHandlerOptions = {}
) {
  return async (req: NextRequest, ctx: { params: Promise<TParams> }) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (options.requireRole) {
      const roleHierarchy = { EDITOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };
      const userLevel = roleHierarchy[session.role as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy[options.requireRole];
      if (userLevel < requiredLevel) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const result = await handler(req, ctx);

    if (options.action && options.entity) {
      let entityId: string | undefined;
      if (options.entityIdParam) {
        const params = await ctx.params;
        entityId = params[options.entityIdParam] as string;
      }
      await activityLogRepository.create({
        userId: session.userId,
        action: options.action,
        entity: options.entity,
        entityId,
        metadata: { method: req.method, path: req.nextUrl.pathname },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    }

    return result;
  };
}
