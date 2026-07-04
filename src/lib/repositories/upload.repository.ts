import { db } from "@/lib/db";
import type { Upload, Prisma } from "@prisma/client";

export interface CreateUploadInput {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  category?: string;
}

export class UploadRepository {
  async create(data: CreateUploadInput): Promise<Upload> {
    return db.upload.create({ data });
  }

  async findById(id: string): Promise<Upload | null> {
    return db.upload.findUnique({ where: { id } });
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    category?: string;
  } = {}): Promise<{ data: Upload[]; total: number }> {
    const { page = 1, pageSize = 30, category } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.UploadWhereInput = {
      deletedAt: null,
      ...(category ? { category } : {}),
    };
    const [data, total] = await Promise.all([
      db.upload.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.upload.count({ where }),
    ]);
    return { data, total };
  }

  async softDelete(id: string): Promise<void> {
    await db.upload.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await db.upload.delete({ where: { id } });
  }
}

export const uploadRepository = new UploadRepository();
