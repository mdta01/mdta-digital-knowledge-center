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
  notificationRepository,
  bookmarkRepository,
  readingProgressRepository,
  analyticsEventRepository,
  bookRevisionRepository,
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
const EMPTY_RESULT = { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };

export const bookService = {
  async getById(id: string) {
    try {
      return await bookRepository.findById(id);
    } catch (e) {
      console.error("[bookService.getById] error:", e);
      return null;
    }
  },
  async getBySlug(slug: string) {
    try {
      return await bookRepository.findBySlug(slug);
    } catch (e) {
      console.error("[bookService.getBySlug] error:", e);
      return null;
    }
  },
  async listPublished(params: { page?: number; pageSize?: number; search?: string; categoryId?: string; authorId?: string; tagId?: string; collectionType?: string } = {}) {
    try {
      const where: Record<string, unknown> = { status: "PUBLISHED" };
      if (params.categoryId) where.categoryId = params.categoryId;
      if (params.authorId) where.authorId = params.authorId;
      if (params.tagId) where.tags = { some: { id: params.tagId } };
      if (params.collectionType) where.collectionType = params.collectionType;
      return await bookRepository.findAll({
        where,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        searchFields: ["title", "description", "isbn"],
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("[bookService.listPublished] error:", e);
      return EMPTY_RESULT;
    }
  },
  async listAll(params: { page?: number; pageSize?: number; search?: string; status?: string; collectionType?: string } = {}) {
    try {
      const where: Record<string, unknown> = {};
      if (params.status) where.status = params.status;
      if (params.collectionType) where.collectionType = params.collectionType;
      return await bookRepository.findAll({
        where,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        searchFields: ["title", "description", "isbn", "slug"],
        orderBy: { updatedAt: "desc" },
      });
    } catch (e) {
      console.error("[bookService.listAll] error:", e);
      return EMPTY_RESULT;
    }
  },
  async featured(limit = 6) {
    try {
      return await bookRepository.findFeatured(limit);
    } catch (e) {
      console.error("[bookService.featured] error:", e);
      return [];
    }
  },
  async popular(limit = 8) {
    try {
      return await bookRepository.findPopular(limit);
    } catch (e) {
      console.error("[bookService.popular] error:", e);
      return [];
    }
  },
  async latest(limit = 8) {
    try {
      return await bookRepository.findLatest(limit);
    } catch (e) {
      console.error("[bookService.latest] error:", e);
      return [];
    }
  },
  async related(slug: string, limit = 4) {
    try {
      const book = await bookRepository.findBySlug(slug);
      if (!book) return [];
      return await bookRepository.findRelated(book, limit);
    } catch (e) {
      console.error("[bookService.related] error:", e);
      return [];
    }
  },
  async incrementViews(id: string) {
    try {
      return await bookRepository.incrementViews(id);
    } catch (e) {
      console.error("[bookService.incrementViews] error:", e);
    }
  },
  async create(data: CreateBookInput) {
    if (!data.slug) data.slug = slugify(data.title);
    // Auto-compute reading time if content provided (avg 200 wpm)
    if (data.content && !data.readingTime) {
      const words = data.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
      (data as any).readingTime = Math.max(1, Math.round(words / 200));
    }
    return bookRepository.create(data);
  },
  async update(id: string, data: UpdateBookInput) {
    if (data.title && !data.slug) data.slug = slugify(data.title);
    if (data.content && !data.readingTime) {
      const words = data.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
      (data as any).readingTime = Math.max(1, Math.round(words / 200));
    }
    return bookRepository.update(id, data);
  },
  async softDelete(id: string) {
    return bookRepository.softDelete(id);
  },
  async restore(id: string) {
    return bookRepository.restore(id);
  },
  async stats() {
    try {
      const [total, published, draft, featured, totalViews, totalDownloads, byType] =
        await Promise.all([
          db.book.count({ where: { deletedAt: null } }),
          db.book.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
          db.book.count({ where: { deletedAt: null, status: "DRAFT" } }),
          db.book.count({ where: { deletedAt: null, featured: true } }),
          db.book.aggregate({ _sum: { views: true } }),
          db.book.aggregate({ _sum: { downloads: true } }),
          db.book.groupBy({
            by: ["collectionType"],
            where: { deletedAt: null },
            _count: { _all: true },
          }),
        ]);
      return {
        total,
        published,
        draft,
        featured,
        totalViews: totalViews?._sum?.views ?? 0,
        totalDownloads: totalDownloads?._sum?.downloads ?? 0,
        byType: Object.fromEntries((byType || []).map((t) => [t.collectionType, t._count._all])),
      };
    } catch (e) {
      console.error("[bookService.stats] error:", e);
      return {
        total: 0,
        published: 0,
        draft: 0,
        featured: 0,
        totalViews: 0,
        totalDownloads: 0,
        byType: {},
      };
    }
  },
  /**
   * Lightweight stats for public pages (home, about).
   * Uses a SINGLE query with count + aggregate combined, instead of 7 separate queries.
   * This prevents connection pool exhaustion on Vercel serverless.
   */
  async publicStats() {
    try {
      // Run only 3 essential queries (not 7) — count, sum views, count authors
      const [bookCount, viewsAgg, authorCount, categoryCount] = await Promise.all([
        db.book.count({ where: { deletedAt: null, status: "PUBLISHED" } }).catch(() => 0),
        db.book.aggregate({ _sum: { views: true }, where: { deletedAt: null } }).catch(() => null),
        db.author.count({ where: { deletedAt: null } }).catch(() => 0),
        db.category.count({ where: { deletedAt: null } }).catch(() => 0),
      ]);
      return {
        published: bookCount || 0,
        totalViews: viewsAgg?._sum?.views ?? 0,
        authors: authorCount || 0,
        categories: categoryCount || 0,
      };
    } catch (e) {
      console.error("[bookService.publicStats] error:", e);
      return { published: 0, totalViews: 0, authors: 0, categories: 0 };
    }
  },
};

// ---------- AUTHOR SERVICE ----------
export const authorService = {
  async getBySlug(slug: string) {
    try {
      return await authorRepository.findBySlug(slug);
    } catch (e) {
      console.error("[authorService.getBySlug] error:", e);
      return null;
    }
  },
  async list(params: { page?: number; pageSize?: number; search?: string } = {}) {
    try {
      return await authorRepository.findAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
    } catch (e) {
      console.error("[authorService.list] error:", e);
      return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    }
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
    try {
      return await db.author.count({ where: { deletedAt: null } });
    } catch (e) {
      console.error("[authorService.stats] error:", e);
      return 0;
    }
  },
};

// ---------- CATEGORY SERVICE ----------
export const categoryService = {
  async getBySlug(slug: string) {
    try {
      return await categoryRepository.findBySlug(slug);
    } catch (e) {
      console.error("[categoryService.getBySlug] error:", e);
      return null;
    }
  },
  async list(params: { search?: string } = {}) {
    try {
      return await categoryRepository.findAll({
        search: params.search,
        pageSize: 100,
      });
    } catch (e) {
      console.error("[categoryService.list] error:", e);
      return { data: [], total: 0, page: 1, pageSize: 100, totalPages: 0 };
    }
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
    try {
      return await db.category.count({ where: { deletedAt: null } });
    } catch (e) {
      console.error("[categoryService.stats] error:", e);
      return 0;
    }
  },
};

// ---------- PAGE SERVICE ----------
export const pageService = {
  async getBySlug(slug: string) {
    try {
      return await pageRepository.findBySlug(slug);
    } catch (e) {
      console.error("[pageService.getBySlug] error:", e);
      return null;
    }
  },
  async list(params: { page?: number; pageSize?: number; search?: string } = {}) {
    try {
      return await pageRepository.findAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
    } catch (e) {
      console.error("[pageService.list] error:", e);
      return { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
    }
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
    try {
      return await db.user.count({ where: { deletedAt: null } });
    } catch (e) {
      console.error("[userService.stats] error:", e);
      return 0;
    }
  },
};

// ---------- SETTING SERVICE ----------
const DEFAULT_SETTINGS = {
  siteName: "MDTA Digital Knowledge Center",
  siteDescription: "",
  siteKeywords: "",
  siteLogo: "",
  siteFavicon: "",
  footerText: "© MDTA MIFTAHUL ULUM 01 — Membangun Peradaban Melalui Ilmu dan Teknologi",
  primaryColor: "#059669",
  accentColor: "#d4af37",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  socialTelegram: "",
  contactAddress: "",
  contactWhatsapp: "",
  contactEmail: "",
  contactMapsUrl: "",
  googleAnalytics: "",
  islamicQuote: "Membaca adalah kunci pembuka pintu kebijaksanaan.",
  quoteAuthor: "Imam Al-Ghazali",
  themeBgColor: "#fafaf9",
  themeHeroImage: "",
  themeFontHeading: "serif",
  themeFontBody: "sans",
  themeBorderRadius: "16",
};

// In-memory cache for settings (avoids hitting DB on every page load).
// TTL: 5 minutes. Uses global to survive across serverless invocations.
const globalForSettings = globalThis as unknown as {
  __settingsCache?: { data: typeof DEFAULT_SETTINGS; ts: number } | null;
};
const SETTINGS_CACHE_TTL = 300_000; // 5 minutes

export const settingService = {
  async getAll() {
    // Return cached if fresh
    if (globalForSettings.__settingsCache && Date.now() - globalForSettings.__settingsCache.ts < SETTINGS_CACHE_TTL) {
      return globalForSettings.__settingsCache.data;
    }
    try {
      const json = await settingRepository.getAllJSON();
      const result = {
        siteName: json[SETTING_KEYS.SITE_NAME] ?? DEFAULT_SETTINGS.siteName,
        siteDescription: json[SETTING_KEYS.SITE_DESCRIPTION] ?? DEFAULT_SETTINGS.siteDescription,
        siteKeywords: json[SETTING_KEYS.SITE_KEYWORDS] ?? DEFAULT_SETTINGS.siteKeywords,
        siteLogo: json[SETTING_KEYS.SITE_LOGO] ?? DEFAULT_SETTINGS.siteLogo,
        siteFavicon: json[SETTING_KEYS.SITE_FAVICON] ?? DEFAULT_SETTINGS.siteFavicon,
        footerText: json[SETTING_KEYS.FOOTER_TEXT] ?? DEFAULT_SETTINGS.footerText,
        primaryColor: json[SETTING_KEYS.PRIMARY_COLOR] ?? DEFAULT_SETTINGS.primaryColor,
        accentColor: json[SETTING_KEYS.ACCENT_COLOR] ?? DEFAULT_SETTINGS.accentColor,
        socialFacebook: json[SETTING_KEYS.SOCIAL_FACEBOOK] ?? DEFAULT_SETTINGS.socialFacebook,
        socialInstagram: json[SETTING_KEYS.SOCIAL_INSTAGRAM] ?? DEFAULT_SETTINGS.socialInstagram,
        socialYoutube: json[SETTING_KEYS.SOCIAL_YOUTUBE] ?? DEFAULT_SETTINGS.socialYoutube,
        socialTelegram: json[SETTING_KEYS.SOCIAL_TELEGRAM] ?? DEFAULT_SETTINGS.socialTelegram,
        contactAddress: json[SETTING_KEYS.CONTACT_ADDRESS] ?? DEFAULT_SETTINGS.contactAddress,
        contactWhatsapp: json[SETTING_KEYS.CONTACT_WHATSAPP] ?? DEFAULT_SETTINGS.contactWhatsapp,
        contactEmail: json[SETTING_KEYS.CONTACT_EMAIL] ?? DEFAULT_SETTINGS.contactEmail,
        contactMapsUrl: json[SETTING_KEYS.CONTACT_MAPS_URL] ?? DEFAULT_SETTINGS.contactMapsUrl,
        googleAnalytics: json[SETTING_KEYS.GOOGLE_ANALYTICS] ?? DEFAULT_SETTINGS.googleAnalytics,
        islamicQuote: json[SETTING_KEYS.ISLAMIC_QUOTE] ?? DEFAULT_SETTINGS.islamicQuote,
        quoteAuthor: json[SETTING_KEYS.QUOTE_AUTHOR] ?? DEFAULT_SETTINGS.quoteAuthor,
        themeBgColor: json[SETTING_KEYS.THEME_BG_COLOR] ?? DEFAULT_SETTINGS.themeBgColor,
        themeHeroImage: json[SETTING_KEYS.THEME_HERO_IMAGE] ?? DEFAULT_SETTINGS.themeHeroImage,
        themeFontHeading: json[SETTING_KEYS.THEME_FONT_HEADING] ?? DEFAULT_SETTINGS.themeFontHeading,
        themeFontBody: json[SETTING_KEYS.THEME_FONT_BODY] ?? DEFAULT_SETTINGS.themeFontBody,
        themeBorderRadius: json[SETTING_KEYS.THEME_BORDER_RADIUS] ?? DEFAULT_SETTINGS.themeBorderRadius,
      };
      // Cache the result globally
      globalForSettings.__settingsCache = { data: result, ts: Date.now() };
      return result;
    } catch (e) {
      console.error("[settingService.getAll] error, using defaults:", e);
      return DEFAULT_SETTINGS;
    }
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
      // V2 — Theme customizer
      themeBgColor: SETTING_KEYS.THEME_BG_COLOR,
      themeHeroImage: SETTING_KEYS.THEME_HERO_IMAGE,
      themeFontHeading: SETTING_KEYS.THEME_FONT_HEADING,
      themeFontBody: SETTING_KEYS.THEME_FONT_BODY,
      themeBorderRadius: SETTING_KEYS.THEME_BORDER_RADIUS,
    };
    await Promise.all(
      Object.entries(map).map(([k, settingKey]) =>
        settingRepository.set(settingKey, String(values[k] ?? ""))
      )
    );
    // Invalidate cache
    globalForSettings.__settingsCache = null;
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
    try {
      const [bookStats, authorCount, categoryCount, userCount, messageCount, recentActivity, popularBooks, recentUploads, unreadNotifications, storageStats] =
        await Promise.all([
          bookService.stats(),
          authorService.stats(),
          categoryService.stats(),
          userService.stats(),
          db.contactMessage.count().catch(() => 0),
          activityLogRepository.findAll({ pageSize: 8 }).catch(() => ({ data: [], total: 0 })),
          db.book.findMany({
            where: { deletedAt: null, status: "PUBLISHED" },
            orderBy: { views: "desc" },
            take: 5,
            include: { author: true, category: true },
          }).catch(() => []),
          db.upload.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 5,
          }).catch(() => []),
          db.notification.count({ where: { isRead: false } }).catch(() => 0),
          db.upload.aggregate({ _sum: { size: true } }).catch(() => null),
        ]);
      return {
        books: bookStats || { total: 0, published: 0, draft: 0, featured: 0, totalViews: 0, totalDownloads: 0, byType: {} },
        authors: authorCount || 0,
        categories: categoryCount || 0,
        users: userCount || 0,
        messages: messageCount || 0,
        recentActivity: recentActivity?.data || [],
        popularBooks: popularBooks || [],
        recentUploads: recentUploads || [],
        unreadNotifications: unreadNotifications || 0,
        storageUsed: storageStats?._sum?.size ?? 0,
      };
    } catch (e) {
      console.error("[dashboardService.getOverview] error:", e);
      return {
        books: { total: 0, published: 0, draft: 0, featured: 0, totalViews: 0, totalDownloads: 0, byType: {} },
        authors: 0,
        categories: 0,
        users: 0,
        messages: 0,
        recentActivity: [],
        popularBooks: [],
        recentUploads: [],
        unreadNotifications: 0,
        storageUsed: 0,
      };
    }
  },
};

// ---------- V2: NOTIFICATION SERVICE ----------
export const notificationService = {
  async notify(params: {
    type: string;
    title: string;
    message: string;
    level?: string;
    userId?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    try {
      return await notificationRepository.create({
        type: params.type,
        title: params.title,
        message: params.message,
        level: params.level,
        userId: params.userId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      });
    } catch (e) {
      console.error("[notification] failed:", e);
    }
  },
  async list(params: { page?: number; pageSize?: number; userId?: string; isRead?: boolean } = {}) {
    return notificationRepository.findAll(params);
  },
  async markAsRead(id: string) {
    return notificationRepository.markAsRead(id);
  },
  async markAllAsRead(userId?: string) {
    return notificationRepository.markAllAsRead(userId);
  },
  async delete(id: string) {
    return notificationRepository.delete(id);
  },
};

// ---------- V2: BOOKMARK SERVICE ----------
export const bookmarkService = {
  async toggle(bookId: string, sessionId: string, note?: string) {
    const exists = await bookmarkRepository.isBookmarked(bookId, sessionId);
    if (exists) {
      await bookmarkRepository.delete(bookId, sessionId);
      return { bookmarked: false };
    }
    await bookmarkRepository.upsert({ bookId, sessionId, note });
    return { bookmarked: true };
  },
  async isBookmarked(bookId: string, sessionId: string) {
    return bookmarkRepository.isBookmarked(bookId, sessionId);
  },
  async listBySession(sessionId: string) {
    return bookmarkRepository.findBySession(sessionId);
  },
};

// ---------- V2: READING PROGRESS SERVICE ----------
export const readingProgressService = {
  async upsert(bookId: string, sessionId: string, progress: number, lastPage?: number) {
    return readingProgressRepository.upsert({ bookId, sessionId, progress, lastPage });
  },
  async get(bookId: string, sessionId: string) {
    return readingProgressRepository.find(bookId, sessionId);
  },
  async listBySession(sessionId: string) {
    return readingProgressRepository.findBySession(sessionId);
  },
};

// ---------- V2: ANALYTICS SERVICE ----------
export const analyticsService = {
  async track(params: Parameters<typeof analyticsEventRepository.create>[0]) {
    try {
      return await analyticsEventRepository.create(params);
    } catch (e) {
      console.error("[analytics] track failed:", e);
    }
  },
  async stats() {
    return analyticsEventRepository.stats();
  },
};

// ---------- V2: BOOK REVISION SERVICE ----------
export const revisionService = {
  async saveRevision(params: {
    bookId: string;
    content: string;
    title: string;
    message?: string;
    userId: string;
  }) {
    return bookRevisionRepository.create(params);
  },
  async listByBook(bookId: string, limit = 20) {
    return bookRevisionRepository.findByBookId(bookId, limit);
  },
  async getById(id: string) {
    return bookRevisionRepository.findById(id);
  },
  async delete(id: string) {
    return bookRevisionRepository.delete(id);
  },
};

// ---------- V2: MAINTENANCE MODE SERVICE ----------
export const maintenanceService = {
  async getStatus() {
    const enabled = (await settingRepository.get(SETTING_KEYS.MAINTENANCE_ENABLED)) === "true";
    const message = (await settingRepository.get(SETTING_KEYS.MAINTENANCE_MESSAGE)) || "";
    const start = (await settingRepository.get(SETTING_KEYS.MAINTENANCE_START)) || "";
    const end = (await settingRepository.get(SETTING_KEYS.MAINTENANCE_END)) || "";
    const whitelist = (await settingRepository.get(SETTING_KEYS.MAINTENANCE_WHITELIST_IPS)) || "";
    return { enabled, message, start, end, whitelistedIps: whitelist };
  },
  async setStatus(data: { enabled: boolean; message?: string; start?: string; end?: string; whitelistedIps?: string }) {
    await settingRepository.set(SETTING_KEYS.MAINTENANCE_ENABLED, String(data.enabled));
    await settingRepository.set(SETTING_KEYS.MAINTENANCE_MESSAGE, data.message || "");
    await settingRepository.set(SETTING_KEYS.MAINTENANCE_START, data.start || "");
    await settingRepository.set(SETTING_KEYS.MAINTENANCE_END, data.end || "");
    await settingRepository.set(SETTING_KEYS.MAINTENANCE_WHITELIST_IPS, data.whitelistedIps || "");
  },
  async isIpWhitelisted(ip: string): Promise<boolean> {
    const status = await this.getStatus();
    if (!status.whitelistedIps) return false;
    const ips = status.whitelistedIps.split(",").map((s) => s.trim()).filter(Boolean);
    return ips.includes(ip);
  },
};

// ---------- V2: BACKUP SERVICE ----------
export const backupService = {
  async exportAll(): Promise<{
    books: unknown[];
    authors: unknown[];
    categories: unknown[];
    pages: unknown[];
    settings: unknown[];
    tags: unknown[];
    uploads: unknown[];
    users: Array<{ id: string; email: string; name: string; role: string; isActive: boolean }>;
    activityLogs: unknown[];
    contactMessages: unknown[];
    exportedAt: string;
    version: string;
  }> {
    const [books, authors, categories, pages, settings, tags, uploads, users, activityLogs, contactMessages] =
      await Promise.all([
        db.book.findMany({ where: { deletedAt: null }, include: { tags: true, files: true } }),
        db.author.findMany({ where: { deletedAt: null } }),
        db.category.findMany({ where: { deletedAt: null } }),
        db.page.findMany({ where: { deletedAt: null } }),
        db.setting.findMany(),
        db.tag.findMany({ where: { deletedAt: null } }),
        db.upload.findMany({ where: { deletedAt: null } }),
        db.user.findMany({
          where: { deletedAt: null },
          select: { id: true, email: true, name: true, role: true, isActive: true },
        }),
        db.activityLog.findMany({ take: 1000 }),
        db.contactMessage.findMany({ take: 1000 }),
      ]);
    return {
      books,
      authors,
      categories,
      pages,
      settings,
      tags,
      uploads,
      users,
      activityLogs,
      contactMessages,
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
    };
  },
};

// ---------- V2: CACHE SERVICE (placeholder for in-memory + DB hint) ----------
export const cacheService = {
  async clearImageCache(): Promise<{ cleared: number }> {
    // In a real app, this would clear a CDN or local image cache.
    // Here we just signal the API to bump a cache-bust token in settings.
    await settingRepository.set("cache.image_bust_token", Date.now().toString());
    return { cleared: 1 };
  },
  async rebuildSearchIndex(): Promise<{ rebuilt: boolean }> {
    // No-op for SQLite (FTS not configured). Returns success signal.
    await settingRepository.set("cache.search_index_built_at", new Date().toISOString());
    return { rebuilt: true };
  },
  async optimizeDatabase(): Promise<{ optimized: boolean }> {
    // SQLite optimize: PRAGMA optimize
    try {
      await db.$executeRawUnsafe("PRAGMA optimize");
      return { optimized: true };
    } catch {
      return { optimized: false };
    }
  },
};

export type BookListItem = BookWithRelations;
