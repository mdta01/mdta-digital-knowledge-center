import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/with-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type BackupPayload = {
  books?: any[];
  authors?: any[];
  categories?: any[];
  pages?: any[];
  settings?: any[];
  tags?: any[];
  uploads?: any[];
  users?: any[];
  activityLogs?: any[];
  contactMessages?: any[];
  [k: string]: any;
};

// POST — impor JSON backup ke database (SUPER_ADMIN only).
// Upsert seluruh entitas dengan id aslinya. Mengembalikan jumlah baris yang diproses.
export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { error: "Body backup tidak valid" },
          { status: 400 }
        );
      }
      const data = body as BackupPayload;

      const counts: Record<string, number> = {
        books: 0,
        authors: 0,
        categories: 0,
        pages: 0,
        settings: 0,
        tags: 0,
        uploads: 0,
        users: 0,
        activityLogs: 0,
        contactMessages: 0,
      };

      // ---------- TAGS ----------
      for (const t of data.tags || []) {
        await db.tag.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            name: t.name,
            slug: t.slug,
            createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
            updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
            deletedAt: t.deletedAt ? new Date(t.deletedAt) : null,
          },
          update: {
            name: t.name,
            slug: t.slug,
            deletedAt: t.deletedAt ? new Date(t.deletedAt) : null,
          },
        });
        counts.tags++;
      }

      // ---------- AUTHORS ----------
      for (const a of data.authors || []) {
        await db.author.upsert({
          where: { id: a.id },
          create: {
            id: a.id,
            name: a.name,
            slug: a.slug,
            bio: a.bio ?? null,
            photo: a.photo ?? null,
            birthYear: a.birthYear ?? null,
            deathYear: a.deathYear ?? null,
            nationality: a.nationality ?? null,
            createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
            updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
            deletedAt: a.deletedAt ? new Date(a.deletedAt) : null,
          },
          update: {
            name: a.name,
            slug: a.slug,
            bio: a.bio ?? null,
            photo: a.photo ?? null,
            deletedAt: a.deletedAt ? new Date(a.deletedAt) : null,
          },
        });
        counts.authors++;
      }

      // ---------- CATEGORIES ----------
      for (const c of data.categories || []) {
        await db.category.upsert({
          where: { id: c.id },
          create: {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description ?? null,
            icon: c.icon ?? null,
            color: c.color ?? null,
            sortOrder: c.sortOrder ?? 0,
            createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
            deletedAt: c.deletedAt ? new Date(c.deletedAt) : null,
          },
          update: {
            name: c.name,
            slug: c.slug,
            description: c.description ?? null,
            deletedAt: c.deletedAt ? new Date(c.deletedAt) : null,
          },
        });
        counts.categories++;
      }

      // ---------- BOOKS ----------
      // Pisahkan field relasi (tags/files) — di-upsert terpisah di bawah.
      for (const b of data.books || []) {
        const { tags: _tags, files: _files, ...scalar } = b;
        await db.book.upsert({
          where: { id: b.id },
          create: {
            id: b.id,
            title: b.title,
            slug: b.slug,
            description: b.description ?? null,
            content: b.content ?? null,
            coverImage: b.coverImage ?? null,
            pages: b.pages ?? null,
            language: b.language ?? "id",
            isbn: b.isbn ?? null,
            publishedYear: b.publishedYear ?? null,
            publisher: b.publisher ?? null,
            status: b.status ?? "DRAFT",
            featured: !!b.featured,
            views: b.views ?? 0,
            downloads: b.downloads ?? 0,
            toc: b.toc ?? null,
            seoTitle: b.seoTitle ?? null,
            seoDescription: b.seoDescription ?? null,
            seoKeywords: b.seoKeywords ?? null,
            collectionType: b.collectionType ?? "BOOK",
            videoUrl: b.videoUrl ?? null,
            audioUrl: b.audioUrl ?? null,
            duration: b.duration ?? null,
            readingTime: b.readingTime ?? null,
            excerpt: b.excerpt ?? null,
            categoryId: b.categoryId,
            authorId: b.authorId,
            createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
            updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
            deletedAt: b.deletedAt ? new Date(b.deletedAt) : null,
          },
          update: {
            title: scalar.title,
            slug: scalar.slug,
            description: scalar.description ?? null,
            content: scalar.content ?? null,
            status: scalar.status,
            featured: !!scalar.featured,
            categoryId: scalar.categoryId,
            authorId: scalar.authorId,
            deletedAt: scalar.deletedAt ? new Date(scalar.deletedAt) : null,
          },
        });

        // Set relasi tags (overwrite).
        const tagIds = Array.isArray(b.tags) ? b.tags.map((t: any) => t.id).filter(Boolean) : [];
        if (tagIds.length > 0) {
          await db.book.update({
            where: { id: b.id },
            data: { tags: { set: tagIds.map((id: string) => ({ id })) } },
          });
        }

        // Upsert book files.
        if (Array.isArray(b.files)) {
          for (const f of b.files) {
            try {
              await db.bookFile.upsert({
                where: { id: f.id },
                create: {
                  id: f.id,
                  bookId: b.id,
                  format: f.format,
                  url: f.url,
                  filename: f.filename,
                  size: f.size ?? null,
                  createdAt: f.createdAt ? new Date(f.createdAt) : undefined,
                  updatedAt: f.updatedAt ? new Date(f.updatedAt) : undefined,
                  deletedAt: f.deletedAt ? new Date(f.deletedAt) : null,
                },
                update: {
                  format: f.format,
                  url: f.url,
                  filename: f.filename,
                  size: f.size ?? null,
                },
              });
            } catch {
              // Lewati file gagal — jangan batalkan seluruh impor.
            }
          }
        }

        counts.books++;
      }

      // ---------- PAGES ----------
      for (const p of data.pages || []) {
        await db.page.upsert({
          where: { id: p.id },
          create: {
            id: p.id,
            title: p.title,
            slug: p.slug,
            content: p.content ?? "",
            excerpt: p.excerpt ?? null,
            seoTitle: p.seoTitle ?? null,
            seoDescription: p.seoDescription ?? null,
            status: p.status ?? "PUBLISHED",
            createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
            deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
          },
          update: {
            title: p.title,
            slug: p.slug,
            content: p.content ?? "",
            status: p.status,
            deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
          },
        });
        counts.pages++;
      }

      // ---------- SETTINGS ----------
      for (const s of data.settings || []) {
        await db.setting.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            key: s.key,
            value: s.value ?? "",
            type: s.type ?? "string",
            createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
          },
          update: {
            key: s.key,
            value: s.value ?? "",
            type: s.type ?? "string",
          },
        });
        counts.settings++;
      }

      // ---------- UPLOADS ----------
      for (const u of data.uploads || []) {
        await db.upload.upsert({
          where: { id: u.id },
          create: {
            id: u.id,
            filename: u.filename,
            originalName: u.originalName,
            mimeType: u.mimeType,
            size: u.size ?? 0,
            url: u.url,
            path: u.path,
            category: u.category ?? null,
            createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
            deletedAt: u.deletedAt ? new Date(u.deletedAt) : null,
          },
          update: {
            originalName: u.originalName,
            category: u.category ?? null,
            deletedAt: u.deletedAt ? new Date(u.deletedAt) : null,
          },
        });
        counts.uploads++;
      }

      // ---------- USERS ----------
      // Backup tidak menyimpan password — pada create, set placeholder acak;
      // pada update, jangan menyentuh password.
      for (const usr of data.users || []) {
        await db.user.upsert({
          where: { id: usr.id },
          create: {
            id: usr.id,
            email: usr.email,
            password:
              "import-pending-" + Math.random().toString(36).slice(2, 12),
            name: usr.name,
            role: usr.role ?? "EDITOR",
            avatar: usr.avatar ?? null,
            isActive: usr.isActive ?? true,
            lastLoginAt: usr.lastLoginAt ? new Date(usr.lastLoginAt) : null,
            createdAt: usr.createdAt ? new Date(usr.createdAt) : undefined,
            updatedAt: usr.updatedAt ? new Date(usr.updatedAt) : undefined,
            deletedAt: usr.deletedAt ? new Date(usr.deletedAt) : null,
          },
          update: {
            email: usr.email,
            name: usr.name,
            role: usr.role,
            isActive: usr.isActive,
          },
        });
        counts.users++;
      }

      // ---------- ACTIVITY LOGS ----------
      for (const log of data.activityLogs || []) {
        try {
          await db.activityLog.upsert({
            where: { id: log.id },
            create: {
              id: log.id,
              userId: log.userId,
              action: log.action,
              entity: log.entity,
              entityId: log.entityId ?? null,
              metadata: log.metadata ?? null,
              ipAddress: log.ipAddress ?? null,
              userAgent: log.userAgent ?? null,
              createdAt: log.createdAt ? new Date(log.createdAt) : undefined,
            },
            update: {
              action: log.action,
              entity: log.entity,
            },
          });
          counts.activityLogs++;
        } catch {
          // Lewati log yang userId-nya tidak ada di DB.
        }
      }

      // ---------- CONTACT MESSAGES ----------
      for (const m of data.contactMessages || []) {
        await db.contactMessage.upsert({
          where: { id: m.id },
          create: {
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone ?? null,
            subject: m.subject,
            message: m.message,
            isRead: !!m.isRead,
            createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
            updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
          },
          update: {
            name: m.name,
            email: m.email,
            subject: m.subject,
            message: m.message,
            isRead: !!m.isRead,
          },
        });
        counts.contactMessages++;
      }

      return NextResponse.json({ success: true, counts });
    } catch (e) {
      console.error("[admin backup import]", e);
      return NextResponse.json(
        {
          error: "Gagal mengimpor backup",
          message: e instanceof Error ? e.message : "unknown error",
        },
        { status: 400 }
      );
    }
  },
  { requireRole: "SUPER_ADMIN", action: "CREATE", entity: "Backup" }
);
