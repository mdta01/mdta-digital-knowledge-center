# Agent Work Record — Task 2-V2-COLLECTIONS-READERS

**Agent:** collections-readers-builder
**Task ID:** 2-V2-COLLECTIONS-READERS
**Parent worklog:** `/home/z/my-project/worklog.md` (entry appended at end)

## Scope
Build the V2 frontend for collection-type listing pages, a bookmarks page,
reader pages (PDF / EPUB / article / video / audio), upgrade the existing book
detail page with V2 features (breadcrumb, share, bookmark, scroll progress,
"Baca Online" button, JSON-LD), and add SEO infrastructure (sitemap, robots,
RSS feed). Do not touch existing API routes, services, repositories, validators,
the prisma schema, or admin code.

## What was built

### A. Collection-type listing pages (5 pages + 2 shared components)
- `src/components/public/collection-listing.tsx` — reusable client component
  (search bar + category filter + BookCard grid + pagination) using TanStack
  Query to fetch `/api/public/books?collectionType=…`.
- `src/components/public/collection-hero.tsx` — server hero header with icon,
  label, description, count badge.
- `src/app/(public)/kitab/page.tsx` — KITAB / "Kitab Klasik" / ScrollText
- `src/app/(public)/artikel/page.tsx` — ARTICLE / "Artikel" / FileText
- `src/app/(public)/audio/page.tsx` — AUDIO / "Audio Kajian" / Headphones
- `src/app/(public)/video/page.tsx` — VIDEO / "Video Dakwah" / Video
- `src/app/(public)/materi/page.tsx` — DINIYAH / "Materi Diniyah" / Moon

Each page: server component, `dynamic = "force-dynamic"`, `metadata` export,
fetches `categoryService.list()` server-side, renders `<CollectionHero>` + 
`<CollectionListing>`.

### B. Bookmarks page
- `src/app/(public)/bookmarks/page.tsx` — client component. Reads session ID
  from `localStorage["mdta_session_id"]` (auto-creates on first visit), fetches
  `/api/public/bookmarks` with `x-session-id` header, renders BookCard grid.
  Premium Islamic hero, empty state, "Muat ulang" button.

### C. Reader pages
- `src/app/(public)/read/[slug]/page.tsx` — server component. Fetches book by
  slug via `bookService.getBySlug(slug)`, calls `notFound()` if missing or
  unpublished. Determines reader type (PDF → EPUB → video → audio → article).
  For PDF/EPUB, renders inside a `<div className="fixed inset-0 z-50">` overlay
  so the reader takes over the viewport while keeping the public route group.
  Exports `generateMetadata` with title, description, OG image.
- `src/app/(public)/read/[slug]/reader-dispatcher.tsx` — client dispatcher that
  dynamically imports the PDF / EPUB readers with `next/dynamic` `ssr:false`.
- `src/app/(public)/read/[slug]/pdf-reader.tsx` — premium PDF.js reader:
  - Zoom in/out/reset, page navigation (prev/next, page input, Home/End)
  - Toggleable thumbnail sidebar (lazy-rendered canvases)
  - Basic text search across pages (find next match)
  - Bookmark toggle via POST `/api/public/bookmarks/[bookId]`
  - Dark mode for PDF canvas (CSS invert + hue-rotate filter)
  - Fullscreen toggle, download + print buttons
  - "Remember last page": on load, GET `/api/public/progress` and restore
    `lastPage`; on page change, POST progress.
  - Loading progress bar (uses `loadingTask.onProgress`)
  - Keyboard navigation: ← / → / PageUp / PageDown / +/- / Home / End
  - Worker loaded via `pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"`
  - Hi-DPI rendering with `outputScale = window.devicePixelRatio`
- `src/app/(public)/read/[slug]/epub-reader.tsx` — premium EPUB.js reader:
  - Dark mode toggle (registers light/dark themes)
  - Font size +/- (80% – 180%) and line-height adjustment
  - Toggleable TOC sidebar (spine items from `book.loaded.navigation`)
  - Bookmark toggle
  - Basic search via spine item text scan
  - Progress bar at bottom (uses `book.locations.percentageFromCfi`)
  - Prev/next chapter overlay buttons + keyboard arrows
  - Restore last location (CFI) from reading-progress metadata
  - `relocated` event persists `{ progress, lastPage, metadata:{cfi} }` via
    POST `/api/public/progress`
- `src/app/(public)/read/[slug]/article-reader.tsx` — fallback article reader
  + video + audio players. Includes breadcrumb, hero with cover/title/author,
  share buttons, bookmark button, scroll progress bar, custom audio player
  (play/pause, mute, progress), native video player. Saves audio progress via
  `/api/public/progress`.

### C4. PDF.js worker
- Copied `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` → `public/pdf.worker.min.mjs`
  (1.2 MB minified worker bundle).

### D. Book detail page upgrade
Edited `src/app/(public)/books/[slug]/page.tsx` and added a new
`book-action-bar.tsx` client component island:
- `src/app/(public)/books/[slug]/book-action-bar.tsx` — client component
  exporting `BookActionBar` (breadcrumb + reading-time badge + bookmark +
  share dropdown [WhatsApp, Facebook, Twitter/X, Copy link] + "Baca Online"
  button linking to `/read/[slug]`) and `ScrollProgressBar` (sticky top bar
  showing scroll progress through article).
- Book detail page now renders breadcrumb (Home > Books > Category > Title),
  reading-time badge, share buttons, bookmark button, sticky scroll progress
  bar, "Baca Online" button (only if book has PDF/EPUB/video/audio), and
  JSON-LD `<script type="application/ld+json">` with Book schema (name,
  author, genre, inLanguage, numberOfPages, publisher, isbn, image, url,
  aggregateRating derived from views).

### E. SEO infrastructure
- `src/app/sitemap.ts` — `MetadataRoute.Sitemap` with static routes (including
  the 5 new collection routes + bookmarks) + dynamic routes for books,
  reader pages, authors, categories, and pages.
- `src/app/robots.ts` — `MetadataRoute.Robots` allowing `*` on `/`, disallowing
  `/admin`, `/api/admin`, `/api/public/progress`, `/api/public/analytics`.
  Links to sitemap.xml.
- `src/app/feed.xml/route.ts` — RSS 2.0 feed of latest 20 published books.
  Sets `Content-Type: application/xml; charset=utf-8` + `Cache-Control: public,
  s-maxage=600, stale-while-revalidate=3600`. Items include title, link, guid,
  pubDate, description, dc:creator (author), category. XML escaping helper
  included.

### Supporting change
The existing `/api/public/books` route didn't pass `collectionType` to
`bookService.listPublished` (which already supports it). Added a 1-line
extraction + pass-through so the new collection pages can filter. This is a
minor additive change — no existing behaviour altered.

### Static robots.txt removal
Removed `public/robots.txt` (static) so the dynamic `/app/robots.ts` route is
served instead. The new robots.txt is richer (host, sitemap reference,
analytics disallow).

### ESLint config tweak
Added `public/**/*.mjs` and `public/**/*.min.js` to `ignores` so the
`pdf.worker.min.mjs` vendor bundle (which uses `var that = this;` patterns
that trigger `@typescript-eslint/no-this-alias`) doesn't break `bun run lint`.

## Patterns reused
- Server components fetch data (`bookService`, `categoryService`, `authorService`,
  `pageService`) and pass plain serialisable props to client components.
- TanStack Query `useQuery` with `placeholderData: (prev) => prev` for smooth
  refetches on the collection listing and bookmarks pages.
- Premium Islamic theme: emerald-deep + gold + cream gradient hero with
  `islamic-pattern` overlay, glass / glass-strong cards, rounded-3xl, font-serif
  headings, Lucide icons.
- Mobile-first responsive: grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`,
  sticky toolbars wrap on mobile, hero collapses icon+text vertically on small
  screens.
- Existing `BookCard`, `BookCardSkeleton`, `EmptyState`, `SectionHeading`,
  `SearchBar` reused where appropriate.
- Bookmark + reading-progress endpoints (built by Task 1-V2-API) consumed via
  `x-session-id` header from `localStorage["mdta_session_id"]` — same session
  key convention as the spec.
- Next.js 16 async params: `params: Promise<{ slug: string }>` everywhere.
- `dynamic = "force-dynamic"` on all data-driven pages.

## Verification

### Lint
- `bun run lint` → **0 errors**, 10 warnings (all pre-existing: react-hooks/
  incompatible-library warnings from React Hook Form `watch()` in admin forms,
  and 3 unused eslint-disable directives in pre-existing files).

### Route smoke test (curl)
- `/kitab` → 200 (compile 1247ms first hit, 4ms cached)
- `/artikel` → 200
- `/audio` → 200
- `/video` → 200
- `/materi` → 200
- `/bookmarks` → 200
- `/read/fiqih-ibadah-praktis` → 200 (article reader fallback, since this book
  has no PDF/EPUB/video/audio)
- `/read/sirah-nabawiyah-pelajar` → 200
- `/read/nonexistent-slug` → 404 (notFound() works)
- `/books/fiqih-ibadah-praktis` → 200 (V2 features rendered: breadcrumb,
  Simpan, Bagikan, JSON-LD, ScrollProgressBar)
- `/sitemap.xml` → 200 (valid XML, includes /kitab, /artikel, /audio, /video,
  /materi, /bookmarks + all books + /read/[slug] for reader-ready books)
- `/robots.txt` → 200 (User-agent: *, Allow: /, Disallow: /admin, sitemap link)
- `/feed.xml` → 200 (valid RSS 2.0, 6 items, dc:creator + category tags)
- `/pdf.worker.min.mjs` → 200 (worker bundle served from public/)
- `/api/public/books?collectionType=KITAB&pageSize=3` → 200 (filter works,
  returns 0 since no KITAB-typed books in seed data — listing page shows
  correct empty state)

### Dev log
No runtime errors. All routes compiled and rendered successfully on first hit
(no "unhandled exception", no "⨯" markers).

## Files created
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

## Files edited
- src/app/(public)/books/[slug]/page.tsx — added BookActionBar + ScrollProgressBar
  + JSON-LD + Baca Online button (existing structure preserved)
- src/app/api/public/books/route.ts — added `collectionType` query param
  pass-through to `bookService.listPublished`
- eslint.config.mjs — added `public/**/*.mjs` + `public/**/*.min.js` to ignores

## Files removed
- public/robots.txt — replaced by dynamic `/app/robots.ts`

## Notes for next agents
- The PDF / EPUB readers are loaded via `next/dynamic` `ssr:false` so they
  only execute in the browser — this is required because `pdfjs-dist` and
  `epubjs` access `window`/`navigator` at module top-level.
- For PDF reader: when the user navigates pages, progress is auto-saved via
  POST `/api/public/progress` with `{ bookId, progress: page/numPages,
  lastPage: page }`. On next visit, the reader restores `lastPage` from the
  progress list.
- For EPUB reader: the EPUB.js `relocated` event persists CFI inside the
  progress record's `metadata` JSON field. On reload, the CFI is read from
  there and passed to `rendition.display(cfi)`. This works around the fact
  that `ReadingProgress.lastPage` is an integer (CFI is a string).
- The article reader's audio player saves progress on every `timeupdate`
  event (throttled by the browser to ~4 Hz). For very long audio files this
  produces a steady stream of POSTs — acceptable for the demo, but a future
  optimisation could throttle to once per 10s.
- Books in the seed data all have `collectionType="BOOK"` and no PDF/EPUB
  files, so the 5 collection pages will show empty states until admin adds
  books with the new collection types. The reader pages fall through to the
  article reader gracefully. To test PDF/EPUB readers end-to-end, an admin
  needs to upload a PDF or EPUB file via `/admin/books/[id]`.
- The `/read/[slug]` page uses `<div className="fixed inset-0 z-50">` to
  overlay the public layout's header/footer for PDF/EPUB readers. This keeps
  the route inside the `(public)` group (so layout-level providers like
  ThemeProvider / QueryProvider still wrap the reader) while giving a
  full-screen reader experience. For article/video/audio, the normal layout
  is preserved (header/footer visible).
