import { z } from "zod";

/** Reusable Zod primitives */
export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung");

export const idSchema = z.string().min(1);

/** Book validators */
export const createBookSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  slug: slugSchema,
  description: z.string().max(2000).optional().nullable(),
  content: z.string().optional().nullable(),
  coverImage: z.string().url().optional().or(z.literal("")),
  pages: z.coerce.number().int().positive().optional().nullable(),
  language: z.enum(["id", "ar", "en"]).default("id"),
  isbn: z.string().max(30).optional().nullable(),
  publishedYear: z.coerce.number().int().positive().optional().nullable(),
  publisher: z.string().max(120).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  toc: z.string().optional().nullable(),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  seoKeywords: z.string().max(300).optional().nullable(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  authorId: z.string().min(1, "Penulis wajib dipilih"),
  tagIds: z.array(z.string()).optional().default([]),
});

export const updateBookSchema = createBookSchema.partial();

/** Author validators */
export const createAuthorSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(120),
  slug: slugSchema,
  bio: z.string().max(5000).optional().nullable(),
  photo: z.string().url().optional().or(z.literal("")),
  birthYear: z.coerce.number().int().positive().optional().nullable(),
  deathYear: z.coerce.number().int().positive().optional().nullable(),
  nationality: z.string().max(80).optional().nullable(),
});

export const updateAuthorSchema = createAuthorSchema.partial();

/** Category validators */
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(80),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(80).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

/** Page validators */
export const createPageSchema = z.object({
  title: z.string().min(1).max(160),
  slug: slugSchema,
  content: z.string().default(""),
  excerpt: z.string().max(300).optional().nullable(),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export const updatePageSchema = createPageSchema.partial();

/** User validators */
export const createUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(120),
  name: z.string().min(1, "Nama wajib diisi").max(120),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).default("EDITOR"),
  avatar: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial();
export const updateUserWithoutPasswordSchema = updateUserSchema.extend({
  password: z.string().min(6).max(120).optional().or(z.literal("")),
});

/** Auth validators */
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

/** Contact validators */
export const contactSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(120),
  email: z.string().email("Email tidak valid"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(1, "Subjek wajib diisi").max(160),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(5000),
});

/** Settings validators */
export const settingsSchema = z.object({
  siteName: z.string().min(1).max(120),
  siteDescription: z.string().max(300).optional(),
  siteKeywords: z.string().max(300).optional(),
  siteLogo: z.string().optional().or(z.literal("")),
  siteFavicon: z.string().optional().or(z.literal("")),
  footerText: z.string().max(500).optional(),
  primaryColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialYoutube: z.string().url().optional().or(z.literal("")),
  socialTelegram: z.string().url().optional().or(z.literal("")),
  contactAddress: z.string().max(300).optional(),
  contactWhatsapp: z.string().max(30).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactMapsUrl: z.string().url().optional().or(z.literal("")),
  googleAnalytics: z.string().max(30).optional().or(z.literal("")),
  islamicQuote: z.string().max(500).optional(),
  quoteAuthor: z.string().max(120).optional(),
});
