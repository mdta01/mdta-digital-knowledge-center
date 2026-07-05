import { db } from "@/lib/db";
import type { BookRevision, Prisma } from "@prisma/client";

export interface CreateRevisionInput {
  bookId: string;
  content: string;
  title: string;
  message?: string | null;
  userId: string;
}

export class BookRevisionRepository {
  async create(data: CreateRevisionInput): Promise<BookRevision> {
    return db.bookRevision.create({ data });
  }

  async findByBookId(
    bookId: string,
    limit = 20
  ): Promise<BookRevision[]> {
    return db.bookRevision.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findById(id: string): Promise<BookRevision | null> {
    return db.bookRevision.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await db.bookRevision.delete({ where: { id } });
  }

  async countByBookId(bookId: string): Promise<number> {
    return db.bookRevision.count({ where: { bookId } });
  }
}

export const bookRevisionRepository = new BookRevisionRepository();
