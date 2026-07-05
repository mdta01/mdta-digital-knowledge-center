import { db } from "@/lib/db";
import type { Tag, Prisma } from "@prisma/client";

export interface CreateTagInput {
  name: string;
  slug: string;
}

export class TagRepository {
  async create(data: CreateTagInput): Promise<Tag> {
    return db.tag.create({ data });
  }

  async findAll(params: { search?: string } = {}): Promise<Tag[]> {
    const where: Prisma.TagWhereInput = {
      deletedAt: null,
      ...(params.search ? { name: { contains: params.search } } : {}),
    };
    return db.tag.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    return db.tag.findMany({ where: { id: { in: ids } } });
  }
}

export const tagRepository = new TagRepository();
