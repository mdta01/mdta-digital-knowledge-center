import { db } from "@/lib/db";
import {
  BaseRepository,
  RepositoryQueryParams,
  RepositoryResult,
} from "./base.repository";
import type { Author, Prisma } from "@prisma/client";

export type AuthorWithRelations = Prisma.AuthorGetPayload<{
  include: { books: true };
}>;

export interface CreateAuthorInput {
  name: string;
  slug: string;
  bio?: string;
  photo?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
}

export type UpdateAuthorInput = Partial<CreateAuthorInput>;

export class AuthorRepository extends BaseRepository<
  AuthorWithRelations,
  CreateAuthorInput,
  UpdateAuthorInput
> {
  private include = { books: true } as const;

  async findById(id: string): Promise<AuthorWithRelations | null> {
    return db.author.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async findBySlug(slug: string): Promise<AuthorWithRelations | null> {
    return db.author.findUnique({
      where: { slug },
      include: this.include,
    });
  }

  async findAll(
    params: RepositoryQueryParams = {}
  ): Promise<RepositoryResult<AuthorWithRelations>> {
    const {
      where = {},
      orderBy = { name: "asc" },
      page = 1,
      pageSize = 12,
      search,
      searchFields = ["name", "bio"],
    } = params;

    const { skip, take } = this.paginate(page, pageSize);

    const whereClause: Prisma.AuthorWhereInput = {
      deletedAt: null,
      ...where,
    };

    if (search && searchFields.length > 0) {
      whereClause.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }));
    }

    const [data, total] = await Promise.all([
      db.author.findMany({
        where: whereClause,
        include: this.include,
        orderBy,
        skip,
        take,
      }),
      db.author.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(data: CreateAuthorInput): Promise<AuthorWithRelations> {
    return db.author.create({ data, include: this.include });
  }

  async update(id: string, data: UpdateAuthorInput): Promise<AuthorWithRelations> {
    return db.author.update({ where: { id }, data, include: this.include });
  }

  async softDelete(id: string): Promise<void> {
    await db.author.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<AuthorWithRelations> {
    return db.author.update({
      where: { id },
      data: { deletedAt: null },
      include: this.include,
    });
  }

  async hardDelete(id: string): Promise<void> {
    await db.author.delete({ where: { id } });
  }
}

export const authorRepository = new AuthorRepository();
