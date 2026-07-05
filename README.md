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
- Email: `admin@mdta-miftahululum.sch.id`
- Password: `admin12345`

---

## 🌐 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: MDTA Digital Knowledge Center"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

### Step 2: Set up Database (Supabase recommended)
1. Create a free project at [supabase.com](https://supabase.com)
2. Get your connection string from Project Settings → Database
3. Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Step 3: Update Prisma for PostgreSQL
In `prisma/schema.prisma`, change the datasource provider:
```prisma
datasource db {
  provider = "postgresql"  // was "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 4: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Add Environment Variables:
   - `DATABASE_URL` = your Supabase Postgres connection string
   - `JWT_SECRET` = generate with `openssl rand -hex 32`
   - `ADMIN_EMAIL` = your admin email
   - `ADMIN_PASSWORD` = a strong password
   - `ADMIN_NAME` = "Super Admin"
   - `NEXT_PUBLIC_SITE_URL` = `https://your-project.vercel.app`
5. Deploy

### Step 5: Initialize Production Database
After first deploy, run Prisma migration on your Supabase DB:
```bash
# Set DATABASE_URL to your Supabase connection string in .env
bun run db:push
bun run seed
```

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
