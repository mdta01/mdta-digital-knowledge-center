# Worklog — Perpustakaan Digital MDTA MIFTAHUL ULUM 01

Project: Modern Premium Islamic Digital Library PWA
Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma (SQLite via Repository Pattern — swappable to Supabase), TanStack Query, React Hook Form, Zod, Framer Motion, Lucide.

## Plan
- Phase 1: Foundation (DB schema, repository pattern, services, PWA, theme, layout, auth)
- Phase 2: Public frontend (home, books, categories, authors, about, contact, search)
- Phase 3: Admin (auth, dashboard, CRUD masters, settings, admin management, activity log)
- Phase 4: Rich text editor with Arabic RTL support
- Phase 5: Verification

---
Task ID: 0
Agent: Main (orchestrator)
Task: Initialize project, plan architecture, set up worklog

Work Log:
- Loaded fullstack-dev skill
- Confirmed Next.js 16 + shadcn/ui + Prisma + TanStack Query + RHF + Zod + Framer Motion + Lucide already installed
- Created TODO list and worklog
- Architecture decisions:
  * Use Prisma with SQLite locally (sandbox has no external Supabase), but ALL data access via Repository Pattern so swap to Supabase is a one-file change
  * Use UUIDs (cuid) for all primary keys
  * Soft delete via `deletedAt` column on all content tables
  * PWA via custom manifest.ts + service worker (next-pwa has App Router issues; use @ducanh2912/next-pwa)
  * Theme: Emerald primary, Gold accent, Cream/Off-white background, Dark green dark mode
  * Fonts: Plus Jakarta Sans (UI), Amiri (Arabic), Lora (serif headings)

Stage Summary:
- Environment ready
- Architecture locked in
- Proceeding to Phase 1 foundation work

---
Task ID: 3
Agent: admin-crud-pages
Task: Build all admin CRUD pages with full UI (consumes existing API endpoints)

Work Log:
- Read worklog and existing infrastructure (validators, services, repositories, API routes, admin-shell, dashboard) to understand conventions
- Created 3 reusable admin components in `src/components/admin/`:
  * `upload-button.tsx` — wraps file input + POST /api/admin/uploads with category, accept, preview support
  * `data-table-shell.tsx` — premium table layout with debounced search, filter slot, action button, glass card, empty/loading state, pagination footer
  * `confirm-dialog.tsx` — AlertDialog wrapper with controlled/uncontrolled + Promise-based onConfirm
  * `utils.ts` — apiFetch helper, useDebounced hook, formatDateTime/formatDate/formatFileSize helpers
- Built admin pages (server component fetches initial data → client component handles interaction with TanStack Query):
  * `/admin/authors` — list + dialog form (AuthorForm with photo upload, slug auto-gen, nationality, birth/death year, bio)
  * `/admin/categories` — list + dialog form (CategoryForm with Lucide icon select, color picker + presets, sort order)
  * `/admin/pages` — list, `/admin/pages/new` + `/admin/pages/[id]` editor with title/slug/excerpt/content (HTML textarea)/status/SEO sidebar
  * `/admin/users` — list (SUPER_ADMIN/ADMIN only) with role-coded badges + dialog form (UserForm with password, role select, isActive switch)
  * `/admin/settings` — SUPER_ADMIN only, 6-tab form (Umum/Tema/Sosial/Kontak/SEO/Konten) with color pickers, logo/favicon upload, sticky save bar
  * `/admin/messages` — inbox with all/unread/read filter, expandable cards, mark-as-read (PATCH) on expand, delete (DELETE)
  * `/admin/activity-logs` — table with entity filter + user search, action badges (CREATE/UPDATE/DELETE/LOGIN/LOGOUT/PUBLISH)
  * `/admin/books` — list with search/status/category filters, cover thumbnail, status/featured badges, view/download counts
  * `/admin/books/new` + `/admin/books/[id]` — BookEditor with 5 tabs (Konten, File Buku, Kategori & Penulis, Status, SEO); cover upload, file upload (PDF/EPUB via UploadButton), tag comma-input that resolves/creates tagIds via /api/admin/tags, status select, featured switch
- Conventions followed:
  * Indonesian UI labels throughout
  * Emerald/gold/cream theme with `glass`, `glass-strong`, `rounded-3xl`, `card-hover`, `font-serif`
  * Mobile-first responsive (sticky save bars on mobile, sheet for sidebar already in admin-shell)
  * `react-hook-form` + `zod` (existing validators) for every form
  * `sonner` toast for success/error feedback
  * Auto slug from name/title (with manual override) using existing `slugify`
  * TanStack Query `useQuery` with `initialData` (server-fetched) + `placeholderData` for smooth refetches
  * QueryClient `invalidateQueries` after every mutation
- Verified:
  * `bun run lint` — only 6 pre-existing errors remain (admin-shell SidebarContent, theme-toggle setState-in-effect, lib/repositories/* empty interfaces). 0 new errors introduced.
  * Manual smoke test with auth cookie: all 9 admin routes return HTTP 200 and render correct Indonesian titles; book editor opens existing book (Fiqih Ibadah Praktis) and page editor opens existing page (Syarat Penggunaan); uploads endpoint works.
  * Dev server log shows successful compile + render for every page with no runtime errors.

Files created (all under `src/app/admin/` and `src/components/admin/`):
- src/components/admin/upload-button.tsx
- src/components/admin/data-table-shell.tsx
- src/components/admin/confirm-dialog.tsx
- src/components/admin/utils.ts
- src/app/admin/authors/page.tsx, authors-client.tsx, author-form.tsx
- src/app/admin/categories/page.tsx, categories-client.tsx, category-form.tsx
- src/app/admin/pages/page.tsx, pages-client.tsx, page-editor.tsx, [id]/page.tsx, new/page.tsx
- src/app/admin/users/page.tsx, users-client.tsx, user-form.tsx
- src/app/admin/settings/page.tsx, settings-form.tsx
- src/app/admin/messages/page.tsx, messages-client.tsx
- src/app/admin/activity-logs/page.tsx, activity-logs-client.tsx
- src/app/admin/books/page.tsx, books-client.tsx, book-editor.tsx, new/page.tsx, [id]/page.tsx

Stage Summary:
- All Phase 3 admin CRUD pages complete and verified
- Premium UI consistent with existing dashboard and public pages
- No new lint errors introduced; only unavoidable React Hook Form `watch()` warnings (cosmetic, from react-hooks/incompatible-library rule)
- Ready for Phase 4 (rich text editor with Arabic RTL — will replace simple HTML textareas in PageEditor & BookEditor)

---
Task ID: 4
Agent: Main (orchestrator)
Task: Build Rich Text Editor with Arabic RTL support, integrate into Book/Page editors, verify end-to-end

Work Log:
- Built TipTap-based RichTextEditor at /src/components/editor/rich-text-editor.tsx
  * 25+ extensions: StarterKit, Underline, Subscript, Superscript, TextStyle, Color,
    Highlight (multicolor), TextAlign, Link, Image, TableKit, TaskList, TaskItem,
    Typography, YouTube, CodeBlockLowlight (with lowlight), CharacterCount, Placeholder
  * Premium toolbar with: undo/redo, heading dropdown, bold/italic/underline/strike,
    subscript/superscript, color picker (30 colors), highlight picker (18 colors),
    bullet/ordered/checklist, quote, code block, alignment (left/center/right/justify),
    link, image upload, table insert, YouTube embed, horizontal rule
  * Arabic RTL support: toggle switches for RTL direction and Arabic font mode
    (applies font-arabic, dir="rtl", larger line-height)
  * Live character/word counter in status bar
  * Image upload via /api/admin/uploads with loading overlay
- Integrated RichTextEditor into /admin/books/book-editor.tsx (replacing Textarea)
- Integrated RichTextEditor into /admin/pages/page-editor.tsx (replacing Textarea)
- Fixed TipTap v3 import issues:
  * TextStyle: named export (no default)
  * Color: named export (no default)
  * Table: use TableKit instead of separate Table/TableRow/TableCell/TableHeader
- Fixed SettingProvider bug: was returning null instead of children (broke book detail page)
- Verified end-to-end with Agent Browser:
  * Home page renders all sections (hero, featured, latest, categories, popular, authors, quote, CTA)
  * Book detail page renders article content correctly
  * Admin login flow works (admin@mdta-miftahululum.sch.id / admin12345)
  * Admin dashboard shows stats, popular books, recent activity
  * All admin routes return 200 OK (books, authors, categories, pages, users, settings, messages, activity-logs)
  * Book editor loads with full TipTap toolbar visible (Bold, Italic, Underline, etc.)
- Lint: 0 errors (10 warnings, all pre-existing React 19 cosmetic)
- PWA features verified: manifest.webmanifest 200, service worker registered

Stage Summary:
- Full production-ready PWA delivered
- All user requirements met: PWA installable, public frontend with all pages,
  admin dashboard with all CRUD, rich text editor with Arabic RTL, repository pattern
  for easy Supabase migration, premium Islamic design (emerald/gold/cream + dark mode)
- Demo data seeded: 10 categories, 5 authors, 6 books, 3 pages, 12 settings
- Demo admin: admin@mdta-miftahululum.sch.id / admin12345

---
Task ID: 1-V2-API
Agent: api-builder
Task: Build all V2 API routes (public + admin) consuming existing V2 services/repositories

Work Log:
- Read worklog.md and existing infrastructure (services, repositories, validators,
  withAdmin helper, session helper, existing admin/public routes) to confirm patterns.
- Created 17 new API route files — 5 public, 12 admin — all following the existing
  `dynamic = "force-dynamic"` + `withAdmin`/plain-handler conventions used elsewhere
  in `/src/app/api`.

Public routes (no auth, session via `x-session-id` header / `?sessionId=` / anon fallback):
- /api/public/search/quick            — minimal-field quick search for Command Palette
                                        (books, authors, categories, pages — PUBLISHED only)
- /api/public/bookmarks               — GET: list bookmarks for session (book included)
- /api/public/bookmarks/[bookId]      — GET: check, POST: toggle, DELETE: remove
- /api/public/progress                — GET: history, POST: upsert (validated with readingProgressSchema)
- /api/public/analytics/track         — POST: track event (analyticsEventSchema), device+browser
                                        auto-detected from UA, always returns 200

Admin routes (all `withAdmin`-wrapped; SUPER_ADMIN-only where noted):
- /api/admin/notifications            — GET list (?page, ?pageSize, ?isRead)
- /api/admin/notifications/[id]       — PATCH markAsRead, DELETE
- /api/admin/notifications/mark-all-read — POST markAllAsRead
- /api/admin/analytics                — GET analytics stats + bookService.stats() content breakdown
- /api/admin/backup/export            — GET (SUPER_ADMIN) JSON download, Content-Disposition header
- /api/admin/backup/import            — POST (SUPER_ADMIN) upsert all entities via db.<model>.upsert
                                        with original IDs; returns { success, counts }
- /api/admin/cache/image              — POST clearImageCache
- /api/admin/cache/search-index       — POST rebuildSearchIndex
- /api/admin/cache/optimize           — POST optimizeDatabase (PRAGMA optimize)
- /api/admin/maintenance              — GET status, PUT (SUPER_ADMIN) update (maintenanceSchema)
- /api/admin/revisions                — GET list (?bookId, ?limit)
- /api/admin/revisions/[id]           — GET single, DELETE (SUPER_ADMIN)
- /api/admin/books/[id]/revisions     — POST save snapshot { content, title, message? }
                                        (uses getSession() for userId)
- /api/admin/media                    — GET paginated list (?search originalName, ?category),
                                        POST multipart upload with optional `folder` field
                                        (combined into category like "image/covers")
- /api/admin/media/[id]               — PATCH rename (originalName), DELETE soft-delete

Conventions followed:
- All admin routes use `export const dynamic = "force-dynamic";`
- All admin routes use `withAdmin` wrapper; SUPER_ADMIN-only routes pass `requireRole: "SUPER_ADMIN"`
- All admin routes with mutations include `action` + `entity` (and `entityIdParam` where applicable)
  for activity-log consistency with existing routes
- Public routes are dynamic, plain async functions (no withAdmin)
- All `[id]` / `[bookId]` params use Next.js 16 async `params: Promise<{...}>`
- Indonesian error messages and comments where appropriate
- Backup import isolates per-record failures (try/catch around BookFile and ActivityLog
  upserts) so one bad row doesn't abort the entire import
- Backup import maps `startTime`/`endTime` from `maintenanceSchema` → `start`/`end`
  expected by `maintenanceService.setStatus`
- Session ID helper reused verbatim from task spec on bookmarks/progress/analytics routes
- Device detection helper reused verbatim; added a small `detectBrowser` helper alongside

Verification:
- `bun run lint` — 0 errors, 10 warnings (all pre-existing: react-hooks/incompatible-library
  on React Hook Form `watch()` calls + 3 unused eslint-disable directives). No new
  issues introduced by any of the 17 new route files.
- Prisma client schema in node_modules/.prisma/client/schema.prisma confirmed to contain
  all V2 models (BookRevision, Bookmark, ReadingProgress, Notification, AnalyticsEvent)
  and `collectionType` on Book — so all db.<model>.upsert calls in backup/import are
  type-safe.
- Pre-existing runtime error in `src/lib/services/index.ts:118` (`db.book.groupBy` on
  `collectionType`) is unrelated to this task — service layer was explicitly out of
  scope ("Do NOT touch existing services, repositories"). My analytics route calls
  `bookService.stats()` per spec.

Files created:
- src/app/api/public/search/quick/route.ts
- src/app/api/public/bookmarks/route.ts
- src/app/api/public/bookmarks/[bookId]/route.ts
- src/app/api/public/progress/route.ts
- src/app/api/public/analytics/track/route.ts
- src/app/api/admin/notifications/route.ts
- src/app/api/admin/notifications/[id]/route.ts
- src/app/api/admin/notifications/mark-all-read/route.ts
- src/app/api/admin/analytics/route.ts
- src/app/api/admin/backup/export/route.ts
- src/app/api/admin/backup/import/route.ts
- src/app/api/admin/cache/image/route.ts
- src/app/api/admin/cache/search-index/route.ts
- src/app/api/admin/cache/optimize/route.ts
- src/app/api/admin/maintenance/route.ts
- src/app/api/admin/revisions/route.ts
- src/app/api/admin/revisions/[id]/route.ts
- src/app/api/admin/books/[id]/revisions/route.ts
- src/app/api/admin/media/route.ts
- src/app/api/admin/media/[id]/route.ts

Stage Summary:
- All 20 endpoints from the task spec delivered (one combined into media/route.ts for GET+POST)
- 0 new lint errors introduced
- API surface ready for the V2 frontend (Command Palette, bookmarks, reading history,
  analytics dashboard, revision history, backup/restore, maintenance mode, cache tools,
  enhanced media manager) to consume

---
Task ID: 2-V2-COLLECTIONS-READERS
Agent: collections-readers-builder
Task: Build V2 frontend — collection listing pages, bookmarks, PDF/EPUB/article readers, upgrade book detail, add sitemap/robots/RSS

Work Log:
- Read worklog + 1-V2-API agent record + existing infrastructure (book-card,
  search-bar, section-utils, books-client, books/[slug]/page, services,
  repositories, schema, layout, manifest) to lock in conventions.
- Created reusable `CollectionListing` client component (TanStack Query +
  search + category filter + grid + pagination + empty/loading states) and
  `CollectionHero` server component.
- Built 5 collection-type pages: /kitab (KITAB, ScrollText), /artikel
  (ARTICLE, FileText), /audio (AUDIO, Headphones), /video (VIDEO, Video),
  /materi (DINIYAH, Moon) — all server components with `metadata` export,
  `force-dynamic`, hero header, categories fetched server-side.
- Built /bookmarks page (client): reads `mdta_session_id` from localStorage,
  fetches `/api/public/bookmarks` with `x-session-id` header, renders
  BookCard grid with premium hero + empty state.
- Built /read/[slug] route (server component) that determines reader type
  (PDF → EPUB → video → audio → article). PDF/EPUB render in a full-screen
  overlay; video/audio/article render inside the normal public layout.
  Exports `generateMetadata` with OG image.
- Built premium PdfReader client component using `pdfjs-dist`:
  zoom in/out/reset, page navigation (input + prev/next + Home/End),
  toggleable thumbnail sidebar (lazy-rendered canvases), text search across
  pages (find next match), bookmark toggle, dark mode (CSS invert + hue-rotate),
  fullscreen toggle, download + print buttons, loading progress bar,
  keyboard navigation (←/→/PageUp/PageDown/+/-/Home/End), "remember last
  page" via /api/public/progress, Hi-DPI rendering.
- Copied `pdf.worker.min.mjs` from node_modules to public/ as required.
- Built premium EpubReader client component using `epubjs`: dark mode toggle
  (theme register/select), font size +/-, line-height adjustment, toggleable
  TOC sidebar (spine items), bookmark toggle, basic search via spine text
  scan, progress bar at bottom via `book.locations.percentageFromCfi`,
  prev/next chapter overlay buttons + keyboard arrows, "restore last
  location" via CFI stored in progress `metadata` JSON field.
- Built ArticleReader client component (fallback for books without PDF/EPUB):
  breadcrumb + hero + share buttons + bookmark button + scroll progress bar,
  custom audio player (play/pause/mute/progress) and native video player.
  Audio progress auto-saved via /api/public/progress.
- Used `next/dynamic` `ssr:false` for PdfReader and EpubReader to avoid
  server-side access to `window`/`navigator`.
- Upgraded existing /books/[slug]/page.tsx (edited in place — no recreate):
  added new `book-action-bar.tsx` client component island exporting
  `BookActionBar` (breadcrumb Home > Books > Category > Title, reading-time
  badge, bookmark button via POST /api/public/bookmarks/[bookId], share
  dropdown [WhatsApp/Facebook/Twitter/Copy link], "Baca Online" button →
  /read/[slug] when book has PDF/EPUB/video/audio) and `ScrollProgressBar`
  (sticky gradient bar tracking scroll progress through article). Added
  JSON-LD `<script type="application/ld+json">` with Book schema (name,
  author, genre, inLanguage, numberOfPages, publisher, isbn, image, url,
  aggregateRating derived from views).
- Added SEO infrastructure:
  * /src/app/sitemap.ts — MetadataRoute.Sitemap with all static + dynamic
    routes (books, reader pages, authors, categories, pages).
  * /src/app/robots.ts — MetadataRoute.Robots allowing `/`, disallowing
    /admin + /api/admin + /api/public/progress + /api/public/analytics.
  * /src/app/feed.xml/route.ts — RSS 2.0 feed of latest 20 published books
    with `Content-Type: application/xml; charset=utf-8`.
- Supporting change: extended existing /api/public/books route to pass
  `collectionType` query param to `bookService.listPublished` (the service
  already supported it but the route didn't forward it). Necessary for the
  5 new collection pages to filter.
- Removed static public/robots.txt so the dynamic /app/robots.ts route is
  served (Next.js prefers static files in public/ otherwise).
- Added `public/**/*.mjs` and `public/**/*.min.js` to eslint `ignores` so
  the minified pdf.worker vendor bundle doesn't trigger `no-this-alias`.

Conventions followed:
- Server components fetch data, pass plain serialisable props to client
  components for interactivity.
- TanStack Query `useQuery` with `placeholderData: (prev) => prev`.
- Premium Islamic theme: emerald-deep + gold + cream gradient heroes with
  islamic-pattern overlay, glass/glass-strong cards, rounded-3xl,
  font-serif headings, Lucide icons.
- Mobile-first responsive throughout.
- All data-driven pages use `export const dynamic = "force-dynamic"`.
- Next.js 16 async params: `params: Promise<{ slug: string }>`.
- Same session-key convention as Task 1-V2-API spec: `localStorage["mdta_session_id"]`
  + `x-session-id` request header.
- 0 new lint errors; 0 new lint warnings introduced.

Verification:
- `bun run lint` → 0 errors, 10 warnings (all pre-existing).
- Smoke test (curl on running dev server):
  * /kitab /artikel /audio /video /materi /bookmarks → 200 OK
  * /read/fiqih-ibadah-praktis → 200 (article reader fallback — book has no PDF/EPUB)
  * /read/sirah-nabawiyah-pelajar → 200
  * /read/nonexistent-slug → 404 (notFound() works)
  * /books/fiqih-ibadah-praktis → 200 (V2 features rendered: Beranda breadcrumb,
    Simpan bookmark, Bagikan share, application/ld+json, ScrollProgressBar)
  * /sitemap.xml → 200 (valid XML; includes /kitab, /artikel, /audio, /video,
    /materi, /bookmarks + all books + /read/[slug] for reader-ready books)
  * /robots.txt → 200 (User-agent: * / Allow: / / Disallow: /admin / sitemap link)
  * /feed.xml → 200 (valid RSS 2.0 with 6 items, dc:creator + category tags)
  * /pdf.worker.min.mjs → 200 (worker bundle served from public/)
  * /api/public/books?collectionType=KITAB&pageSize=3 → 200 (filter works;
    returns 0 since no KITAB-typed books in seed data — listing shows empty
    state correctly)
- Dev log: no runtime errors during any of the smoke tests.

Files created:
- src/components/public/collection-listing.tsx
- src/components/public/collection-hero.tsx
- src/app/(public)/kitab/page.tsx
- src/app/(public)/artikel/page.tsx
- src/app/(public)/audio/page.tsx
- src/app/(public)/video/page.tsx
- src/app/(public)/materi/page.tsx
- src/app/(public)/bookmarks/page.tsx
- src/app/(public)/read/[slug]/page.tsx
- src/app/(public)/read/[slug]/reader-dispatcher.tsx
- src/app/(public)/read/[slug]/pdf-reader.tsx
- src/app/(public)/read/[slug]/epub-reader.tsx
- src/app/(public)/read/[slug]/article-reader.tsx
- src/app/(public)/books/[slug]/book-action-bar.tsx
- src/app/sitemap.ts
- src/app/robots.ts
- src/app/feed.xml/route.ts
- public/pdf.worker.min.mjs (copied from node_modules)
- agent-ctx/2-V2-COLLECTIONS-READERS-collections-readers-builder.md

Files edited:
- src/app/(public)/books/[slug]/page.tsx — added BookActionBar + ScrollProgressBar + JSON-LD + Baca Online button
- src/app/api/public/books/route.ts — added `collectionType` query param pass-through
- eslint.config.mjs — added `public/**/*.mjs` + `public/**/*.min.js` to ignores

Files removed:
- public/robots.txt — replaced by dynamic /app/robots.ts

Stage Summary:
- All V2 frontend deliverables complete: 5 collection pages, bookmarks page,
  3 reader types (PDF, EPUB, article/video/audio), book detail page upgraded
  with breadcrumb + share + bookmark + scroll progress + JSON-LD + Baca Online,
  and SEO infrastructure (sitemap, robots, RSS feed).
- 0 new lint errors, all routes return 200 (or 404 for missing slugs).
- Premium Islamic theme maintained; mobile-first responsive throughout.
- PDF/EPUB readers gracefully degrade to article reader when no media files
  are attached (current seed data state).

---
Task ID: 3-V2-ADMIN
Agent: admin-v2-builder
Task: Build all V2 admin UI features (sidebar extensions, dashboard upgrade, analytics, media manager, notifications, backup, cache, maintenance, settings theme customizer, editor V2 toolbar, book editor auto-save + revisions, activity log enhancement)

Work Log:
- Read worklog + 1-V2-API agent record + existing infrastructure (admin-shell,
  dashboard, settings-form, services, validators, repositories) to lock in
  conventions.
- Discovered that a prior session had already built every V2 admin deliverable
  in scope (sidebar items, dashboard with charts, analytics page, media
  manager, notifications inbox, backup/restore, cache tools, maintenance,
  settings theme customizer tab, editor footnote/chapter/verse/hadith toolbar
  buttons, book-editor auto-save + Revisions tab, activity-logs CSV export +
  extended action filter). Verified each file against the task spec line by
  line.
- The only deviation from spec was `analytics-client.tsx`'s "Kategori Koleksi"
  card, which used a `BarChart` instead of the spec-required `PieChart` for
  the collection breakdown. Replaced it with a premium donut PieChart:
  * Added `PieChart, Pie, Cell, Legend` to recharts imports, removed unused
    `BarChart, Bar`.
  * Donut style (`innerRadius=45`, `outerRadius=90`, `paddingAngle=3`) with
    per-slice `Cell` colored from a 7-tone emerald/gold palette
    (`#059669`, `#d4af37`, `#0d9488`, `#ca8a04`, `#16a34a`, `#92660f`,
    `#34d399`).
  * Inline labels + Legend + Tooltip preserved.
- All other deliverables were already correctly implemented and required no
  changes.

Conventions followed:
- Server components fetch initial data, pass plain serialisable props to
  client components for interactivity (TanStack Query `useQuery` with
  `initialData` + `placeholderData: (prev) => prev`).
- Premium Islamic theme (emerald `#059669` + gold `#d4af37`, `glass` /
  `glass-strong` cards, `rounded-3xl`, `font-serif` headings).
- Mobile-first responsive throughout.
- `react-hook-form` + `zod` for every form (settings, maintenance).
- `sonner` toast + `ConfirmDialog` for feedback and destructive actions.
- Indonesian UI labels throughout.
- All admin pages: `metadata` with `robots: { index: false }` +
  `dynamic = "force-dynamic"`.
- SUPER_ADMIN-only routes redirect to `/admin` when role mismatches.

Verification:
- `bun run lint` → 0 errors, 17 warnings (all pre-existing React 19 cosmetic
  `react-hooks/incompatible-library` warnings on React Hook Form `watch()`
  calls + a few unused eslint-disable directives). No new issues introduced.
- Restarted dev server (`pkill -9 -f "next dev"; sleep 2; nohup setsid bun
  run dev > dev.log 2>&1 &`); waited for "Ready" + health check.
- Logged in as `admin@mdta-miftahululum.sch.id` / `admin12345`
  (SUPER_ADMIN) via `/api/admin/auth/login`, saved JWT cookie, smoke-tested
  every admin route with the cookie:
  * /admin, /admin/analytics, /admin/media, /admin/notifications,
    /admin/backup, /admin/cache, /admin/maintenance, /admin/settings,
    /admin/activity-logs, /admin/books, /admin/authors, /admin/categories,
    /admin/pages, /admin/users, /admin/messages — all return 200.
- Smoke-tested V2 API endpoints (also 200):
  * GET /api/admin/notifications
  * GET /api/admin/analytics
  * GET /api/admin/media
  * GET /api/admin/backup/export (JSON download)
  * GET /api/admin/maintenance
  * POST /api/admin/cache/image
  * GET /api/admin/revisions?bookId=X
- `dev.log` after all smoke tests: no `error` / `⨯` / `unhandled` lines.

Files edited:
- src/app/admin/analytics/analytics-client.tsx — replaced BarChart collection
  breakdown with PieChart (donut, emerald/gold palette, labels, legend).

Files created:
- agent-ctx/3-V2-ADMIN-admin-v2-builder.md

Stage Summary:
- All 11 V2 admin deliverables complete and verified end-to-end with no new
  lint errors. The admin panel now ships a premium dashboard with charts,
  full analytics suite, drag & drop media manager, notifications inbox,
  backup/restore tools, cache optimization tools, maintenance mode editor,
  extended theme customizer, rich-text-editor V2 footnote/chapter/verse/hadith
  toolbar buttons, book editor with 30s auto-save + Revisions tab, and an
  activity-log table with extended action filter + CSV export.

---
Task ID: V2-MAIN
Agent: Main (orchestrator)
Task: V2 Upgrade — Islamic Knowledge Center (21 modules)

Work Log:
- Extended Prisma schema: Book.collectionType (BOOK/KITAB/ARTICLE/VIDEO/AUDIO/DOCUMENT/DINIYAH), videoUrl, audioUrl, duration, readingTime, excerpt; new models BookRevision, Bookmark, ReadingProgress, Notification, AnalyticsEvent
- Added 5 new repositories (notification, bookmark, reading-progress, analytics-event, book-revision) + extended SETTING_KEYS for theme customizer + maintenance
- Extended service layer: notificationService, bookmarkService, readingProgressService, analyticsService, revisionService, maintenanceService, backupService, cacheService; upgraded dashboardService with recentUploads, unreadNotifications, storageUsed, byType
- Added Zod validators: themeCustomizerSchema, maintenanceSchema, createNotificationSchema, bookmarkSchema, readingProgressSchema, analyticsEventSchema
- Built HomeV2 premium: fullscreen hero with animated islamic geometry (rotating stars, arabesque, floating particles, gradient orbs), mouse parallax (3 layers), scroll-based hero transform, glassmorphism stats, collection types grid, all sections with Framer Motion
- Built Command Palette (Ctrl+K / Cmd+K): real-time search across books/authors/categories/pages, keyboard navigation (arrow keys + Enter), highlight match, quick links grid, 250ms debounce
- Renamed app to "Islamic Knowledge Center" — updated layout metadata, PWA manifest, header brand
- Added AnalyticsTracker component (fires PAGE_VIEW on route change, session-based)
- Delegated V2 API routes (20 endpoints) to subagent — all built
- Delegated V2 collection pages (Kitab/Artikel/Audio/Video/Materi) + readers (PDF.js, EPUB.js, Article) + bookmarks + SEO (sitemap, robots, RSS) to subagent — all built
- Delegated V2 admin pages (Dashboard upgrade, Analytics, Media Manager, Notifications, Backup, Cache, Maintenance, Theme Customizer, Editor V2 with footnotes/chapters/autsave/revisions, Activity Log V2) to subagent — all built
- Fixed critical bugs found during verification:
  * storageStats._sum.size → storageStats?._sum?.size (null safety on empty aggregate)
  * hsl(var(--border)) → fixed hex colors in recharts (oklch theme incompatible with hsl wrapper)
  * overview.recentUploads.map → (overview.recentUploads || []).map + null guards on all array fields (topAuthors, popularBooks, recentActivity)
- Verified end-to-end with Agent Browser:
  * Home V2: fullscreen hero, animated geometry, parallax, all sections ✓
  * Command Palette: Ctrl+K opens, search works, highlight match ✓
  * Admin login → Dashboard V2: greeting, charts (BarChart byType, LineChart daily), quick actions, top authors, storage, system status, timeline ✓
  * All 15 admin routes 200 OK ✓
  * All 5 collection pages (Kitab/Artikel/Audio/Video/Materi) 200 OK ✓
  * Bookmarks page 200 ✓
  * Book detail V2: breadcrumb, bookmark, share, scroll progress ✓
  * Reader page 200 ✓ (ArticleReader fallback)
  * SEO: sitemap.xml, robots.txt, feed.xml all 200 ✓
- Lint: 0 errors, 17 warnings (all pre-existing)

Stage Summary:
- V2 upgrade complete: 21 modules delivered
- App renamed to "Islamic Knowledge Center"
- 7 collection types (Buku/Kitab/Artikel/Video/Audio/Dokumen/Diniyah)
- Premium homepage with animated islamic geometry + parallax
- Command Palette (Ctrl+K) with real-time search
- PDF.js + EPUB.js readers
- Media Manager (WordPress-style)
- Analytics dashboard with charts
- Theme Customizer (no-code)
- Backup/Restore, Cache management, Maintenance mode
- Notifications system
- Editor V2: footnotes, chapter/verse/hadith numbering, auto-save, revision history
- SEO: sitemap, robots, RSS, JSON-LD
- All existing features preserved (backward compatible)
