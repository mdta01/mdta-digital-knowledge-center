/**
 * Service Layer — orchestrates repositories, validation, and side effects.
 * UI/API routes never touch repositories directly.
 */
import {
  bookRepository,
  authorRepository,
  categoryRepository,
  pageRepository,
  userRepository,
  settingRepository,
  activityLogRepository,
  uploadRepository,
  bookFileRepository,
  contactMessageRepository,
  tagRepository,
  SETTING_KEYS,
} from "@/lib/repositories";
import type {
  BookWithRelations,
  CreateBookInput,
  UpdateBookInput,
} from "@/lib/repositories/book.repository";
import { slugify } from "@/lib/slug";
import { hashPassword } from "@/lib/auth/session";
import { db } from "@/lib/db";

// ---------- BOOK SERVICE ----------
export const bookService = {
  async getById(id: string) {
    return bookRepository.findById(id);
  },
  async getBySlug(slug: string) {
    return bookRepository.findBySlug(slug);
  },
  async listPublished(params: { page?: number; pageSize?: number; search?: string; categoryId?: string; authorId?: string; tagId?: string } = {}) {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.authorId) where.authorId = params.authorId;
    if (params.tagId) where.tags = { some: { id: params.tagId } };
    return bookRepository.findAll({
      where,
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      searchFields: ["title", "description", "isbn"],
      orderBy: { createdAt: "desc" },
    });
  },
  async listAll(params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    return bookRepository.findAll({
      where,
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      searchFields: ["title", "description", "isbn", "slug"],
      orderBy: { updatedAt: "desc" },
    });
  },
  async featured(limit = 6) {
    return bookRepository.findFeatured(limit);
  },
  async popular(limit = 8) {
    return bookRepository.findPopular(limit);
  },
  async latest(limit = 8) {
    return bookRepository.findLatest(limit);
  },
  async related(slug: string, limit = 4) {
    const book = await bookRepository.findBySlug(slug);
    if (!book) return [];
    return bookRepository.findRelated(book, limit);
  },
  async incrementViews(id: string) {
    return bookRepository.incrementViews(id);
  },
  async create(data: CreateBookInput) {
    if (!data.slug) data.slug = slugify(data.title);
    return bookRepository.create(data);
  },
  async update(id: string, data: UpdateBookInput) {
    if (data.title && !data.slug) data.slug = slugify(data.title);
    return bookRepository.update(id, data);
  },
  async softDelete(id: string) {
    return bookRepository.softDelete(id);
  },
  async restore(id: string) {
    return bookRepository.restore(id);
  },
  async stats() {
    const [total, published, draft, featured, totalViews, totalDownloads] =
      await Promise.all([
        db.book.count({ where: { deletedAt: null } }),
        db.book.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
        db.book.count({ where: { deletedAt: null, status: "DRAFT" } }),
        db.book.count({ where: { deletedAt: null, featured: true } }),
        db.book.aggregate({ _sum: { views: true } }),
        db.book.aggregate({ _sum: { downloads: true } }),
      ]);
    return {
      total,
      published,
      draft,
      featured,
      totalViews: totalViews._sum.views ?? 0,
      totalDownloads: totalDownloads._sum.downloads ?? 0,
    };
  },
};

// ---------- AUTHOR SERVICE ----------
export const authorService = {
  async getBySlug(slug: string) {
    return authorRepository.findBySlug(slug);
  },
  async list(params: { page?: number; pageSize?: number; search?: string } = {}) {
    return authorRepository.findAll({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });
  },
  async create(data: Parameters<typeof authorRepository.create>[0]) {
    if (!data.slug) data.slug = slugify(data.name);
    return authorRepository.create(data);
  },
  async update(id: string, data: Parameters<typeof authorRepository.update>[1]) {
    if (data.name && !data.slug) data.slug = slugify(data.name);
    return authorRepository.update(id, data);
  },
  async softDelete(id: string) {
    return authorRepository.softDelete(id);
  },
  async stats() {
    return db.author.count({ where: { deletedAt: null } });
  },
};

// ---------- CATEGORY SERVICE ----------
export const categoryService = {
  async getBySlug(slug: string) {
    return categoryRepository.findBySlug(slug);
  },
  async list(params: { search?: string } = {}) {
    return categoryRepository.findAll({
      search: params.search,
      pageSize: 100,
    });
  },
  async create(data: Parameters<typeof categoryRepository.create>[0]) {
    if (!data.slug) data.slug = slugify(data.name);
    return categoryRepository.create(data);
  },
  async update(id: string, data: Parameters<typeof categoryRepository.update>[1]) {
    if (data.name && !data.slug) data.slug = slugify(data.name);
    return categoryRepository.update(id, data);
  },
  async softDelete(id: string) {
    return categoryRepository.softDelete(id);
  },
  async stats() {
    return db.category.count({ where: { deletedAt: null } });
  },
};

// ---------- PAGE SERVICE ----------
export const pageService = {
  async getBySlug(slug: string) {
    return pageRepository.findBySlug(slug);
  },
  async list(params: { page?: number; pageSize?: number; search?: string } = {}) {
    return pageRepository.findAll({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });
  },
  async create(data: Parameters<typeof pageRepository.create>[0]) {
    if (!data.slug) data.slug = slugify(data.title);
    return pageRepository.create(data);
  },
  async update(id: string, data: Parameters<typeof pageRepository.update>[1]) {
    if (data.title && !data.slug) data.slug = slugify(data.title);
    return pageRepository.update(id, data);
  },
  async softDelete(id: string) {
    return pageRepository.softDelete(id);
  },
};

// ---------- USER SERVICE ----------
export const userService = {
  async list(params: { page?: number; pageSize?: number; search?: string } = {}) {
    return userRepository.findAll({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });
  },
  async create(data: Parameters<typeof userRepository.create>[0]) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    return userRepository.create(data);
  },
  async update(id: string, data: Parameters<typeof userRepository.update>[1]) {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    return userRepository.update(id, data);
  },
  async softDelete(id: string) {
    return userRepository.softDelete(id);
  },
  async stats() {
    return db.user.count({ where: { deletedAt: null } });
  },
};

// ---------- SETTING SERVICE ----------
export const settingService = {
  async getAll() {
    const json = await settingRepository.getAllJSON();
    return {
      siteName: json[SETTING_KEYS.SITE_NAME] ?? "Perpustakaan Digital MDTA MIFTAHUL ULUM 01",
      siteDescription: json[SETTING_KEYS.SITE_DESCRIPTION] ?? "",
      siteKeywords: json[SETTING_KEYS.SITE_KEYWORDS] ?? "",
      siteLogo: json[SETTING_KEYS.SITE_LOGO] ?? "",
      siteFavicon: json[SETTING_KEYS.SITE_FAVICON] ?? "",
      footerText: json[SETTING_KEYS.FOOTER_TEXT] ?? "© MDTA MIFTAHUL ULUM 01",
      primaryColor: json[SETTING_KEYS.PRIMARY_COLOR] ?? "#059669",
      accentColor: json[SETTING_KEYS.ACCENT_COLOR] ?? "#d4af37",
      socialFacebook: json[SETTING_KEYS.SOCIAL_FACEBOOK] ?? "",
      socialInstagram: json[SETTING_KEYS.SOCIAL_INSTAGRAM] ?? "",
      socialYoutube: json[SETTING_KEYS.SOCIAL_YOUTUBE] ?? "",
      socialTelegram: json[SETTING_KEYS.SOCIAL_TELEGRAM] ?? "",
      contactAddress: json[SETTING_KEYS.CONTACT_ADDRESS] ?? "",
      contactWhatsapp: json[SETTING_KEYS.CONTACT_WHATSAPP] ?? "",
      contactEmail: json[SETTING_KEYS.CONTACT_EMAIL] ?? "",
      contactMapsUrl: json[SETTING_KEYS.CONTACT_MAPS_URL] ?? "",
      googleAnalytics: json[SETTING_KEYS.GOOGLE_ANALYTICS] ?? "",
      islamicQuote: json[SETTING_KEYS.ISLAMIC_QUOTE] ?? "Membaca adalah kunci pembuka pintu kebijaksanaan.",
      quoteAuthor: json[SETTING_KEYS.QUOTE_AUTHOR] ?? "Imam Al-Ghazali",
    };
  },
  async updateAll(values: Record<string, string>) {
    const map: Record<string, string> = {
      siteName: SETTING_KEYS.SITE_NAME,
      siteDescription: SETTING_KEYS.SITE_DESCRIPTION,
      siteKeywords: SETTING_KEYS.SITE_KEYWORDS,
      siteLogo: SETTING_KEYS.SITE_LOGO,
      siteFavicon: SETTING_KEYS.SITE_FAVICON,
      footerText: SETTING_KEYS.FOOTER_TEXT,
      primaryColor: SETTING_KEYS.PRIMARY_COLOR,
      accentColor: SETTING_KEYS.ACCENT_COLOR,
      socialFacebook: SETTING_KEYS.SOCIAL_FACEBOOK,
      socialInstagram: SETTING_KEYS.SOCIAL_INSTAGRAM,
      socialYoutube: SETTING_KEYS.SOCIAL_YOUTUBE,
      socialTelegram: SETTING_KEYS.SOCIAL_TELEGRAM,
      contactAddress: SETTING_KEYS.CONTACT_ADDRESS,
      contactWhatsapp: SETTING_KEYS.CONTACT_WHATSAPP,
      contactEmail: SETTING_KEYS.CONTACT_EMAIL,
      contactMapsUrl: SETTING_KEYS.CONTACT_MAPS_URL,
      googleAnalytics: SETTING_KEYS.GOOGLE_ANALYTICS,
      islamicQuote: SETTING_KEYS.ISLAMIC_QUOTE,
      quoteAuthor: SETTING_KEYS.QUOTE_AUTHOR,
    };
    await Promise.all(
      Object.entries(map).map(([k, settingKey]) =>
        settingRepository.set(settingKey, String(values[k] ?? ""))
      )
    );
  },
};

// ---------- ACTIVITY LOG SERVICE ----------
export const activityLogService = {
  async log(params: Parameters<typeof activityLogRepository.create>[0]) {
    try {
      return await activityLogRepository.create(params);
    } catch (e) {
      // Logging should never break the main flow
      console.error("[activityLog] failed to write log:", e);
    }
  },
  async list(params: Parameters<typeof activityLogRepository.findAll>[0]) {
    return activityLogRepository.findAll(params);
  },
};

// ---------- UPLOAD SERVICE ----------
export const uploadService = {
  async list(params: Parameters<typeof uploadRepository.findAll>[0]) {
    return uploadRepository.findAll(params);
  },
  async create(data: Parameters<typeof uploadRepository.create>[0]) {
    return uploadRepository.create(data);
  },
  async softDelete(id: string) {
    return uploadRepository.softDelete(id);
  },
};

// ---------- BOOK FILE SERVICE ----------
export const bookFileService = {
  async create(data: Parameters<typeof bookFileRepository.create>[0]) {
    return bookFileRepository.create(data);
  },
  async findByBookId(bookId: string) {
    return bookFileRepository.findByBookId(bookId);
  },
  async delete(id: string) {
    return bookFileRepository.delete(id);
  },
};

// ---------- CONTACT MESSAGE SERVICE ----------
export const contactMessageService = {
  async create(data: Parameters<typeof contactMessageRepository.create>[0]) {
    return contactMessageRepository.create(data);
  },
  async list(params: Parameters<typeof contactMessageRepository.findAll>[0]) {
    return contactMessageRepository.findAll(params);
  },
  async markAsRead(id: string) {
    return contactMessageRepository.markAsRead(id);
  },
  async delete(id: string) {
    return contactMessageRepository.delete(id);
  },
};

// ---------- TAG SERVICE ----------
export const tagService = {
  async list(search?: string) {
    return tagRepository.findAll({ search });
  },
  async create(data: Parameters<typeof tagRepository.create>[0]) {
    if (!data.slug) data.slug = slugify(data.name);
    return tagRepository.create(data);
  },
};

// ---------- DASHBOARD STATS ----------
export const dashboardService = {
  async getOverview() {
    const [bookStats, authorCount, categoryCount, userCount, messageCount, recentActivity, popularBooks] =
      await Promise.all([
        bookService.stats(),
        authorService.stats(),
        categoryService.stats(),
        userService.stats(),
        db.contactMessage.count(),
        activityLogRepository.findAll({ pageSize: 8 }),
        bookRepository.findPopular(5),
      ]);
    return {
      books: bookStats,
      authors: authorCount,
      categories: categoryCount,
      users: userCount,
      messages: messageCount,
      recentActivity: recentActivity.data,
      popularBooks,
    };
  },
};

export type BookListItem = BookWithRelations;
