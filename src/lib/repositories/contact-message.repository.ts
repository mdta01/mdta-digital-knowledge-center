import { db } from "@/lib/db";
import type { ContactMessage, Prisma } from "@prisma/client";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export class ContactMessageRepository {
  async create(data: CreateContactMessageInput): Promise<ContactMessage> {
    return db.contactMessage.create({ data });
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
  } = {}): Promise<{ data: ContactMessage[]; total: number }> {
    const { page = 1, pageSize = 20, isRead } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.ContactMessageWhereInput = {};
    if (isRead !== undefined) where.isRead = isRead;
    const [data, total] = await Promise.all([
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.contactMessage.count({ where }),
    ]);
    return { data, total };
  }

  async markAsRead(id: string): Promise<void> {
    await db.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async delete(id: string): Promise<void> {
    await db.contactMessage.delete({ where: { id } });
  }
}

export const contactMessageRepository = new ContactMessageRepository();
