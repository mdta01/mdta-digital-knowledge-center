/**
 * Book Repository — Prisma implementation.
 * Swap this file to use Supabase client without touching service/UI layers.
 */
import { db } from "@/lib/db";
import {
  BaseRepository,
  RepositoryQueryParams,
  RepositoryResult,
} from "./base.repository";
import type { Book, Prisma } from "@prisma/client";

export type BookWithRelations = Prisma.BookGetPayload<{
  include: {
    category: true;
    author: true;
    tags: true;
    files: true;
  };
}>;

export interface CreateBookInput {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  coverImage?: string;
  pages?: number;
  language?: string;
  isbn?: string;
  publishedYear?: number;
  publisher?: string;
  status?: string;
  featured?: boolean;
  toc?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  categoryId: string;
  authorId: string;
  tagIds?: string[];
}

export interface UpdateBookInput extends Partial<CreateBookInput> {
  views?: number;
  downloads?: number;
}

export class BookRepository extends BaseRepository<
  BookWithRelations,
  CreateBookInput,
  UpdateBookInput
> {
  private include = {
    category: true,
    author: true,
    tags: true,
    files: true,
  } as const;

  async findById(id: string): Promise<BookWithRelations | null> {
    return db.book.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findBySlug(slug: string): Promise<BookWithRelations | null> {
    return db.book.findUnique({
      where: { slug },
      include: this.include,
    });
  }

  async findAll(
    params: RepositoryQueryParams = {}
  ): Promise<RepositoryResult<BookWithRelations>> {
    const {
      where = {},
      orderBy = { createdAt: "desc" },
      page = 1,
      pageSize = 12,
      search,
      searchFields = ["title", "description"],
    } = params;

    const { skip, take } = this.paginate(page, pageSize);

    const whereClause: Prisma.BookWhereInput = {
      deletedAt: null,
      ...where,
    };

    if (search && searchFields.length > 0) {
      whereClause.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }));
    }

    const [data, total] = await Promise.all([
      db.book.findMany({
        where: whereClause,
        include: this.include,
        orderBy,
        skip,
        take,
      }),
      db.book.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findFeatured(limit = 6): Promise<BookWithRelations[]> {
    return db.book.findMany({
      where: { featured: true, deletedAt: null, status: "PUBLISHED" },
      include: this.include,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findPopular(limit = 8): Promise<BookWithRelations[]> {
    return db.book.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: this.include,
      orderBy: { views: "desc" },
      take: limit,
    });
  }

  async findLatest(limit = 8): Promise<BookWithRelations[]> {
    return db.book.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: this.include,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findRelated(book: Book, limit = 4): Promise<BookWithRelations[]> {
    return db.book.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        categoryId: book.categoryId,
        id: { not: book.id },
      },
      include: this.include,
      take: limit,
      orderBy: { views: "desc" },
    });
  }

  async incrementViews(id: string): Promise<void> {
    await db.book.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async create(data: CreateBookInput): Promise<BookWithRelations> {
    const { tagIds, ...rest } = data;
    return db.book.create({
      data: {
        ...rest,
        tags: tagIds?.length
          ? { connect: tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: this.include,
    });
  }

  async update(id: string, data: UpdateBookInput): Promise<BookWithRelations> {
    const { tagIds, ...rest } = data;
    return db.book.update({
      where: { id },
      data: {
        ...rest,
        tags:
          tagIds !== undefined
            ? { set: tagIds.map((t) => ({ id: t })) }
            : undefined,
      },
      include: this.include,
    });
  }

  async softDelete(id: string): Promise<void> {
    await db.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<BookWithRelations> {
    return db.book.update({
      where: { id },
      data: { deletedAt: null },
      include: this.include,
    });
  }

  async hardDelete(id: string): Promise<void> {
    await db.book.delete({ where: { id } });
  }
}

export const bookRepository = new BookRepository();
