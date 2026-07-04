import { db } from "@/lib/db";
import {
  BaseRepository,
  RepositoryQueryParams,
  RepositoryResult,
} from "./base.repository";
import type { Category, Prisma } from "@prisma/client";

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: { _count: { select: { books: true } } };
}>;

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryRepository extends BaseRepository<
  CategoryWithRelations,
  CreateCategoryInput,
  UpdateCategoryInput
> {
  private include = { _count: { select: { books: true } } } as const;

  async findById(id: string): Promise<CategoryWithRelations | null> {
    return db.category.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findBySlug(slug: string): Promise<CategoryWithRelations | null> {
    return db.category.findUnique({
      where: { slug },
      include: this.include,
    });
  }

  async findAll(
    params: RepositoryQueryParams = {}
  ): Promise<RepositoryResult<CategoryWithRelations>> {
    const {
      where = {},
      orderBy = { sortOrder: "asc" },
      page = 1,
      pageSize = 50,
      search,
      searchFields = ["name", "description"],
    } = params;

    const { skip, take } = this.paginate(page, pageSize);

    const whereClause: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...where,
    };

    if (search && searchFields.length > 0) {
      whereClause.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }));
    }

    const [data, total] = await Promise.all([
      db.category.findMany({
        where: whereClause,
        include: this.include,
        orderBy,
        skip,
        take,
      }),
      db.category.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(data: CreateCategoryInput): Promise<CategoryWithRelations> {
    return db.category.create({ data, include: this.include });
  }

  async update(
    id: string,
    data: UpdateCategoryInput
  ): Promise<CategoryWithRelations> {
    return db.category.update({ where: { id }, data, include: this.include });
  }

  async softDelete(id: string): Promise<void> {
    await db.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<CategoryWithRelations> {
    return db.category.update({
      where: { id },
      data: { deletedAt: null },
      include: this.include,
    });
  }

  async hardDelete(id: string): Promise<void> {
    await db.category.delete({ where: { id } });
  }
}

export const categoryRepository = new CategoryRepository();
