import { db } from "@/lib/db";
import type { BookFile, Prisma } from "@prisma/client";

export interface CreateBookFileInput {
  bookId: string;
  format: string;
  url: string;
  filename: string;
  size?: number;
}

export class BookFileRepository {
  async create(data: CreateBookFileInput): Promise<BookFile> {
    return db.bookFile.create({ data });
  }

  async findByBookId(bookId: string): Promise<BookFile[]> {
    return db.bookFile.findMany({
      where: { bookId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  }

  async delete(id: string): Promise<void> {
    await db.bookFile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDeleteByBookId(bookId: string): Promise<void> {
    await db.bookFile.deleteMany({ where: { bookId } });
  }
}

export const bookFileRepository = new BookFileRepository();
