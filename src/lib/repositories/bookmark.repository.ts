import { db } from "@/lib/db";
import type { Bookmark, Prisma } from "@prisma/client";

export interface CreateBookmarkInput {
  bookId: string;
  sessionId: string;
  note?: string | null;
}

export class BookmarkRepository {
  async upsert(data: CreateBookmarkInput): Promise<Bookmark> {
    return db.bookmark.upsert({
      where: {
        bookId_sessionId: { bookId: data.bookId, sessionId: data.sessionId },
      },
      create: data,
      update: { note: data.note },
    });
  }

  async findBySession(sessionId: string): Promise<Bookmark[]> {
    return db.bookmark.findMany({
      where: { sessionId },
      include: { book: { include: { author: true, category: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async isBookmarked(bookId: string, sessionId: string): Promise<boolean> {
    const count = await db.bookmark.count({
      where: { bookId, sessionId },
    });
    return count > 0;
  }

  async delete(bookId: string, sessionId: string): Promise<void> {
    await db.bookmark.deleteMany({
      where: { bookId, sessionId },
    });
  }
}

export const bookmarkRepository = new BookmarkRepository();
