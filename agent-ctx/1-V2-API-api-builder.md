# Agent Work Record — Task 1-V2-API

**Agent:** api-builder
**Task ID:** 1-V2-API
**Parent worklog:** `/home/z/my-project/worklog.md` (entry appended at end)

## Scope
Build all V2 API routes (5 public + 15 admin endpoints across 17 files) that consume the
existing V2 services / repositories / validators. Do not touch existing routes, services,
repositories, validators, or the prisma schema.

## What was built

### Public (no auth; session via `x-session-id` / `?sessionId=` / anon fallback)
- `src/app/api/public/search/quick/route.ts` — GET quick search for Command Palette
- `src/app/api/public/bookmarks/route.ts` — GET list by session
- `src/app/api/public/bookmarks/[bookId]/route.ts` — GET check / POST toggle / DELETE
- `src/app/api/public/progress/route.ts` — GET history / POST upsert (readingProgressSchema)
- `src/app/api/public/analytics/track/route.ts` — POST track event (analyticsEventSchema),
  auto-detect device + browser from UA, always 200

### Admin (all `withAdmin`-wrapped, `dynamic = "force-dynamic"`)
- `src/app/api/admin/notifications/route.ts` — GET list (?isRead filter)
- `src/app/api/admin/notifications/[id]/route.ts` — PATCH markAsRead / DELETE
- `src/app/api/admin/notifications/mark-all-read/route.ts` — POST
- `src/app/api/admin/analytics/route.ts` — GET analytics stats + book content breakdown
- `src/app/api/admin/backup/export/route.ts` — GET (SUPER_ADMIN) JSON download
- `src/app/api/admin/backup/import/route.ts` — POST (SUPER_ADMIN) upsert all entities,
  returns `{ success, counts }`, 400 on error
- `src/app/api/admin/cache/image/route.ts` — POST (SUPER_ADMIN) clearImageCache
- `src/app/api/admin/cache/search-index/route.ts` — POST (SUPER_ADMIN) rebuildSearchIndex
- `src/app/api/admin/cache/optimize/route.ts` — POST (SUPER_ADMIN) optimizeDatabase
- `src/app/api/admin/maintenance/route.ts` — GET status / PUT (SUPER_ADMIN) update
- `src/app/api/admin/revisions/route.ts` — GET list (?bookId, ?limit)
- `src/app/api/admin/revisions/[id]/route.ts` — GET single / DELETE (SUPER_ADMIN)
- `src/app/api/admin/books/[id]/revisions/route.ts` — POST save snapshot
- `src/app/api/admin/media/route.ts` — GET paginated list (?search, ?category) /
  POST multipart upload with optional `folder` field (combined into `category`)
- `src/app/api/admin/media/[id]/route.ts` — PATCH rename / DELETE soft-delete

## Patterns reused
- `withAdmin(handler, { requireRole?, action?, entity?, entityIdParam? })` for admin routes
- `getSession()` from `@/lib/auth/session` for the revision-save user id
- Existing service singletons: `notificationService`, `bookmarkService`,
  `readingProgressService`, `analyticsService`, `revisionService`,
  `maintenanceService`, `backupService`, `cacheService`, `bookService`,
  `authorService`, `categoryService`, `pageService`, `uploadService`
- Existing validators: `readingProgressSchema`, `analyticsEventSchema`, `maintenanceSchema`
- Next.js 16 async params: `params: Promise<{ id | bookId: string }>`

## Notes for next agents
- Backup import isolates per-row failures (try/catch around BookFile and ActivityLog
  upserts) so a single bad row doesn't abort the whole import.
- `maintenanceSchema` uses `startTime`/`endTime`/`whitelistedIps`, but
  `maintenanceService.setStatus` expects `start`/`end`/`whitelistedIps` — the route
  maps between these names.
- Backup users array lacks passwords (export strips them for security); on import,
  a random placeholder password is set on create, and password is never overwritten
  on update.
- `media/route.ts` POST mirrors the legacy `/api/admin/uploads` POST (same 25MB limit,
  same `/uploads/` save path) and adds the optional `folder` field.
- Pre-existing runtime error at `src/lib/services/index.ts:118`
  (`db.book.groupBy({ by: ["collectionType"] })`) is **out of scope** for this task —
  the spec said "Do NOT touch existing services, repositories". The
  `/api/admin/analytics` route calls `bookService.stats()` per spec; if that runtime
  error is still active when the frontend hits the analytics endpoint, the next agent
  should run `bunx prisma generate` + `bunx prisma db push` and restart the dev server
  to pick up the regenerated Prisma client.

## Verification
- `bun run lint` → **0 errors**, 10 warnings (all pre-existing).
- Confirmed Prisma client in `node_modules/.prisma/client/schema.prisma` contains all
  V2 models + `collectionType` field — all `db.<model>.upsert` calls in backup/import
  are type-safe.
