import { db } from "@/lib/db";
import {
  BaseRepository,
  RepositoryQueryParams,
  RepositoryResult,
} from "./base.repository";
import type { Page as StaticPage, Prisma } from "@prisma/client";

export interface CreatePageInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
}

export type UpdatePageInput = Partial<CreatePageInput>;

export class PageRepository extends BaseRepository<
  StaticPage,
  CreatePageInput,
  UpdatePageInput
> {
  async findById(id: string): Promise<StaticPage | null> {
    return db.page.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<StaticPage | null> {
    return db.page.findFirst({
      where: { slug, deletedAt: null, status: "PUBLISHED" },
    });
  }

  async findAll(
    params: RepositoryQueryParams = {}
  ): Promise<RepositoryResult<StaticPage>> {
    const {
      where = {},
      orderBy = { updatedAt: "desc" },
      page = 1,
      pageSize = 20,
      search,
      searchFields = ["title", "content"],
    } = params;

    const { skip, take } = this.paginate(page, pageSize);

    const whereClause: Prisma.PageWhereInput = {
      deletedAt: null,
      ...where,
    };

    if (search && searchFields.length > 0) {
      whereClause.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }));
    }

    const [data, total] = await Promise.all([
      db.page.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
      }),
      db.page.count({ where: whereClause }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async create(data: CreatePageInput): Promise<StaticPage> {
    return db.page.create({ data });
  }

  async update(id: string, data: UpdatePageInput): Promise<StaticPage> {
    return db.page.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await db.page.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<StaticPage> {
    return db.page.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await db.page.delete({ where: { id } });
  }
}

export const pageRepository = new PageRepository();
