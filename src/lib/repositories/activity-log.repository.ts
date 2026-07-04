import { db } from "@/lib/db";
import type { ActivityLog, Prisma } from "@prisma/client";

export interface CreateActivityLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityLogRepository {
  async create(data: CreateActivityLogInput): Promise<ActivityLog> {
    return db.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: { user: true },
    });
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    entity?: string;
    userId?: string;
  } = {}): Promise<{ data: ActivityLog[]; total: number }> {
    const { page = 1, pageSize = 20, entity, userId } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.ActivityLogWhereInput = {};
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.activityLog.count({ where }),
    ]);
    return { data, total };
  }
}

export const activityLogRepository = new ActivityLogRepository();
