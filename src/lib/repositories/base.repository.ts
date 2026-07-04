/**
 * Repository Pattern - Base Interface
 * All entity repositories implement this contract so the underlying datasource
 * (Prisma/SQLite now, Supabase/PostgreSQL later) can be swapped in one place.
 */

export interface IBaseRepository<T, CreateInput, UpdateInput> {
  findById(id: string): Promise<T | null>;
  findAll(params?: RepositoryQueryParams): Promise<RepositoryResult<T>>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<T>;
  hardDelete(id: string): Promise<void>;
}

export interface RepositoryQueryParams {
  where?: Record<string, unknown>;
  include?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, "asc" | "desc">;
  page?: number;
  pageSize?: number;
  search?: string;
  searchFields?: string[];
}

export interface RepositoryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class BaseRepository<T, CreateInput, UpdateInput>
  implements IBaseRepository<T, CreateInput, UpdateInput>
{
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(params?: RepositoryQueryParams): Promise<RepositoryResult<T>>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: string, data: UpdateInput): Promise<T>;
  abstract softDelete(id: string): Promise<void>;
  abstract restore(id: string): Promise<T>;
  abstract hardDelete(id: string): Promise<void>;

  protected paginate(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return { skip, take };
  }
}
