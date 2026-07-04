import { db } from "@/lib/db";
import {
  BaseRepository,
  RepositoryQueryParams,
  RepositoryResult,
} from "./base.repository";
import type { User, Prisma } from "@prisma/client";

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  lastLoginAt?: Date;
}

export class UserRepository extends BaseRepository<
  User,
  CreateUserInput,
  UpdateUserInput
> {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  }

  async findAll(
    params: RepositoryQueryParams = {}
  ): Promise<RepositoryResult<User>> {
    const {
      where = {},
      orderBy = { createdAt: "desc" },
      page = 1,
      pageSize = 20,
      search,
      searchFields = ["name", "email"],
    } = params;

    const { skip, take } = this.paginate(page, pageSize);

    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
      ...where,
    };

    if (search && searchFields.length > 0) {
      whereClause.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }));
    }

    const [data, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          // password excluded for safety
        } as unknown as Prisma.UserSelect,
      }),
      db.user.count({ where: whereClause }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async create(data: CreateUserInput): Promise<User> {
    return db.user.create({ data });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return db.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<User> {
    return db.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await db.user.delete({ where: { id } });
  }
}

export const userRepository = new UserRepository();
