# MDTA Digital Knowledge Center

> **Pusat Pengetahuan Islam Digital Modern** — Membangun Peradaban Melalui Ilmu dan Teknologi

Platform pengetahuan Islam premium yang mengintegrasikan Kitab Digital, Buku, Artikel, Materi Diniyah, Audio Kajian, Video Pembelajaran, dan Dokumen dalam satu ekosistem. Installable sebagai PWA, dengan Command Palette, rich text editor (RTL Arab support), PDF/EPUB readers, analytics, dan admin dashboard.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Database**: Prisma ORM (SQLite for dev, PostgreSQL-ready for production via Repository Pattern)
- **State**: TanStack Query (server), Zustand (client)
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Editor**: TipTap (with Arabic RTL support)
- **Readers**: PDF.js + epub.js
- **Charts**: Recharts
- **PWA**: Custom service worker + manifest
- **Auth**: JWT + bcrypt (httpOnly cookies)

---

## 📦 Local Development

```bash
# 1. Install dependencies
bun install

# 2. Copy env file and adjust
cp .env.example .env

# 3. Setup database
bun run db:push
bun run seed          # seeds demo data + super admin

# 4. Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Email: `mdtadigital@center`
- Password: `mdta@01`

---

## 🌐 Deploy to Vercel

This project is configured for **Supabase PostgreSQL** + **Vercel** deployment.

### Step 1: Push to GitHub ✅ (Already Done)
Repo: https://github.com/mdta01/mdta-digital-knowledge-center

### Step 2: Set up Supabase Database ✅ (Already Created & Migrated)
- **Supabase Project**: `tahvikmhjbupxzryofuz`
- **Region**: `ap-southeast-1` (Shared Pooler: `aws-1-ap-southeast-1`)
- **Pooler Host**: `aws-1-ap-southeast-1.pooler.supabase.com`
- **User**: `postgres.tahvikmhjbupxzryofuz`
- **Database**: `postgres`
- **Tables**: 15 tables created (User, Book, Author, Category, Page, Setting, Upload, ActivityLog, ContactMessage, Tag, BookFile, BookRevision, Bookmark, ReadingProgress, Notification, AnalyticsEvent)
- **Demo Data**: 1 admin, 10 categories, 5 authors, 6 books, 6 pages, 12 settings

### Step 3: Prisma Schema ✅ (Already PostgreSQL)
The `prisma/schema.prisma` is already configured for PostgreSQL with both `url` (pooler) and `directUrl` (direct) for migrations.

### Step 4: Initialize Production Database ✅ (Already Done)
Database tables created and demo data seeded via `bun run setup-db`.

### Step 5: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repo `mdta01/mdta-digital-knowledge-center`
3. Framework preset: **Next.js** (auto-detected)
4. Build & Output Settings: leave default (auto-detected)
5. Add Environment Variables (all required):
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://postgres.tahvikmhjbupxzryofuz:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=30` |
   | `DIRECT_URL` | `postgresql://postgres.tahvikmhjbupxzryofuz:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres` |
   | `JWT_SECRET` | `mdta-kc-jwt-secret-2026-change-in-production-32chars` (or generate with `openssl rand -hex 32`) |
   | `ADMIN_EMAIL` | `mdtadigital@center` |
   | `ADMIN_PASSWORD` | `mdta@01` |
   | `ADMIN_NAME` | `Super Admin` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (update after first deploy) |
6. Click **Deploy**

### Step 6: Post-Deploy
- After first successful deploy, update `NEXT_PUBLIC_SITE_URL` to your actual Vercel URL
- Login at `https://your-project.vercel.app/admin/login`
- Change the admin password immediately via Settings → Manajemen Admin

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/              # Public routes with header+footer
│   │   ├── page.tsx           # Home V2 (animated hero)
│   │   ├── knowledge/         # Knowledge Hub (multi-collection)
│   │   ├── books/             # Books + detail
│   │   ├── kitab/ artikel/ audio/ video/ materi/  # Collection pages
│   │   ├── read/[slug]/       # PDF/EPUB/Article readers
│   │   ├── bookmarks/         # Anonymous bookmarks
│   │   └── about/ contact/ privacy/ terms/ offline/
│   ├── admin/                 # Admin panel (separate layout)
│   │   ├── page.tsx           # Knowledge Dashboard
│   │   ├── books/ authors/ categories/ pages/
│   │   ├── media/ notifications/ analytics/
│   │   ├── backup/ cache/ maintenance/ settings/
│   │   └── users/ messages/ activity-logs/
│   ├── api/
│   │   ├── public/            # 10+ public endpoints
│   │   └── admin/             # 20+ admin endpoints (auth-protected)
│   ├── manifest.ts            # PWA manifest
│   ├── sitemap.ts             # Dynamic sitemap
│   ├── robots.ts              # Robots.txt
│   ├── feed.xml/              # RSS feed
│   └── layout.tsx             # Root layout (fonts, providers, PWA)
├── components/
│   ├── admin/                 # AdminShell, DataTable, UploadButton, etc.
│   ├── editor/                # TipTap rich text editor (Arabic RTL)
│   ├── layout/                # SiteHeader, SiteFooter, ThemeToggle
│   ├── public/                # BookCard, SearchBar, CommandPalette, etc.
│   ├── pwa/                   # ServiceWorkerRegister
│   └── ui/                    # shadcn/ui (50+ components)
├── lib/
│   ├── repositories/          # Repository Pattern (15 repos)
│   ├── services/              # Service Layer
│   ├── validators/            # Zod schemas
│   ├── auth/                  # JWT session + withAdmin HOC
│   ├── prisma.ts db.ts        # Prisma client
│   └── slug.ts utils.ts
├── prisma/schema.prisma       # 15 models (UUID, soft delete, timestamps)
└── public/
    ├── sw.js                  # Service worker
    ├── icons/                 # PWA icons
    └── uploads/               # User uploads
```

---

## ✨ Key Features

### Public
- **Homepage V2**: Fullscreen animated Islamic geometry, mouse parallax, glassmorphism, stats
- **Command Palette** (Ctrl+K): Real-time search across books/authors/categories/pages
- **7 Collection Types**: Buku, Kitab, Artikel, Audio, Video, Materi Diniyah, Dokumen
- **Knowledge Hub**: Multi-collection exploration with Grid/List/Compact views
- **Book Detail V2**: Breadcrumb, reading time, share, bookmark, scroll progress, JSON-LD
- **Readers**: PDF.js (zoom/thumbnails/search/dark mode), epub.js (TOC/fonts/CFI), Article reader
- **Bookmarks & Reading Progress**: Anonymous (session-based, no login)
- **PWA**: Installable, offline-first, auto-update

### Admin
- **Knowledge Dashboard**: Greeting, charts (BarChart/LineChart), quick actions, storage, timeline
- **Knowledge Management**: CRUD with collection types, cover/PDF/EPUB upload, featured, SEO
- **Rich Text Editor V2**: TipTap with Arabic RTL, footnotes, chapter/verse/hadith numbering, auto-save, revision history
- **Media Manager**: Drag & drop multi-upload, grid/list, rename, delete
- **Analytics**: KPIs, daily visitors chart, collection breakdown, popular content
- **Theme Customizer**: No-code color/font/radius customization with live preview
- **Backup & Restore**: JSON export/import
- **Cache Management**: Clear image cache, rebuild search index, optimize DB
- **Maintenance Mode**: Toggle, message, IP whitelist
- **Notifications**: Internal admin notification system
- **Activity Log**: All admin actions tracked with CSV export

### Architecture
- **Repository Pattern**: Swap Prisma→Supabase by changing 1 file per repo
- **Service Layer**: Business logic separated from UI
- **Clean Architecture**: API → Service → Repository → DB
- **Role-based Access**: SUPER_ADMIN / ADMIN / EDITOR

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | ✅ |
| `JWT_SECRET` | Secret for JWT signing (32+ chars) | ✅ |
| `ADMIN_EMAIL` | Initial super admin email | ✅ |
| `ADMIN_PASSWORD` | Initial super admin password | ✅ |
| `ADMIN_NAME` | Initial super admin name | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Public URL for SEO/sitemap | ✅ |

---

## 📝 License

© MDTA MIFTAHUL ULUM 01. All rights reserved.

---

## 🤝 Contributing

This is a private project for MDTA MIFTAHUL ULUM 01. For inquiries, contact: info@mdta-miftahululum.sch.id
