import { db } from "@/lib/db";
import type { Notification, Prisma } from "@prisma/client";

export interface CreateNotificationInput {
  type: string;
  title: string;
  message: string;
  level?: string;
  userId?: string | null;
  metadata?: string | null;
}

export class NotificationRepository {
  async create(data: CreateNotificationInput): Promise<Notification> {
    return db.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        level: data.level || "info",
        userId: data.userId ?? null,
        metadata: data.metadata ?? null,
      },
    });
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    userId?: string;
    isRead?: boolean;
  } = {}): Promise<{ data: Notification[]; total: number; unread: number }> {
    const { page = 1, pageSize = 20, userId, isRead } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.NotificationWhereInput = {};
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total, unread] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { ...where, isRead: false } }),
    ]);
    return { data, total, unread };
  }

  async markAsRead(id: string): Promise<void> {
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId?: string): Promise<void> {
    const where: Prisma.NotificationWhereInput = {};
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }
    await db.notification.updateMany({
      where: { ...where, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string): Promise<void> {
    await db.notification.delete({ where: { id } });
  }
}

export const notificationRepository = new NotificationRepository();
