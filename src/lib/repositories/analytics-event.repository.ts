import { db } from "@/lib/db";
import type { AnalyticsEvent, Prisma } from "@prisma/client";

export interface CreateAnalyticsEventInput {
  type: string;
  entity?: string | null;
  entityId?: string | null;
  path?: string | null;
  referrer?: string | null;
  sessionId?: string | null;
  country?: string | null;
  device?: string | null;
  browser?: string | null;
}

export class AnalyticsEventRepository {
  async create(data: CreateAnalyticsEventInput): Promise<AnalyticsEvent> {
    return db.analyticsEvent.create({ data });
  }

  async stats(): Promise<{
    totalEvents: number;
    pageViews: number;
    downloads: number;
    uniqueSessions: number;
    daily: Array<{ date: string; count: number }>;
    topEntities: Array<{ entity: string; entityId: string; count: number }>;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalEvents, pageViews, downloads, uniqueSessionsArr, recentEvents] =
      await Promise.all([
        db.analyticsEvent.count(),
        db.analyticsEvent.count({ where: { type: "PAGE_VIEW" } }),
        db.analyticsEvent.count({ where: { type: "DOWNLOAD" } }),
        db.analyticsEvent.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { sessionId: true, createdAt: true, type: true, entity: true, entityId: true },
          take: 5000,
        }),
        db.analyticsEvent.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true },
          take: 5000,
        }),
      ]);

    const uniqueSessions = new Set(
      uniqueSessionsArr.map((e) => e.sessionId).filter(Boolean)
    ).size;

    // Build daily counts (last 30 days)
    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, 0);
    }
    for (const e of recentEvents) {
      const key = e.createdAt.toISOString().slice(0, 10);
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    }
    const daily = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    // Top entities (PAGE_VIEW on Book)
    const entityCounts = new Map<string, number>();
    for (const e of uniqueSessionsArr) {
      if (e.type === "PAGE_VIEW" && e.entity === "Book" && e.entityId) {
        const key = `${e.entity}:${e.entityId}`;
        entityCounts.set(key, (entityCounts.get(key) || 0) + 1);
      }
    }
    const topEntities = Array.from(entityCounts.entries())
      .map(([key, count]) => {
        const [entity, entityId] = key.split(":");
        return { entity, entityId, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents,
      pageViews,
      downloads,
      uniqueSessions,
      daily,
      topEntities,
    };
  }
}

export const analyticsEventRepository = new AnalyticsEventRepository();
