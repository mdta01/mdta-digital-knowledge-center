import { db } from "@/lib/db";
import type { ReadingProgress, Prisma } from "@prisma/client";

export interface UpsertProgressInput {
  bookId: string;
  sessionId: string;
  progress: number;
  lastPage?: number;
}

export class ReadingProgressRepository {
  async upsert(data: UpsertProgressInput): Promise<ReadingProgress> {
    return db.readingProgress.upsert({
      where: {
        bookId_sessionId: { bookId: data.bookId, sessionId: data.sessionId },
      },
      create: {
        bookId: data.bookId,
        sessionId: data.sessionId,
        progress: data.progress,
        lastPage: data.lastPage ?? 0,
        lastReadAt: new Date(),
      },
      update: {
        progress: data.progress,
        lastPage: data.lastPage ?? 0,
        lastReadAt: new Date(),
      },
    });
  }

  async find(bookId: string, sessionId: string): Promise<ReadingProgress | null> {
    return db.readingProgress.findUnique({
      where: {
        bookId_sessionId: { bookId, sessionId },
      },
    });
  }

  async findBySession(sessionId: string): Promise<ReadingProgress[]> {
    return db.readingProgress.findMany({
      where: { sessionId },
      include: { book: { include: { author: true } } },
      orderBy: { lastReadAt: "desc" },
      take: 20,
    });
  }

  async delete(bookId: string, sessionId: string): Promise<void> {
    await db.readingProgress.deleteMany({
      where: { bookId, sessionId },
    });
  }
}

export const readingProgressRepository = new ReadingProgressRepository();
