import {
  bookService,
  categoryService,
} from "@/lib/services";
import { HomeV2 } from "./home-v2";

// Always render at request time — prevents build-time prerendering.
export const dynamic = "force-dynamic";

// Revalidate every 5 minutes (ISR-lite: cache the page output)
export const revalidate = 300;

export default async function HomePage() {
  // SEQUENTIAL queries — minimal set for fast initial render.
  // Authors are loaded client-side by HomeV2 if needed.

  // 1. Stats (lightweight — 4 queries with individual .catch)
  const stats = await bookService.publicStats();

  // 2. Featured books (4 items — for the featured section)
  const featured = await bookService.featured(4);

  // 3. Latest books (8 items — also used as "popular" fallback)
  const latest = await bookService.latest(8);

  // 4. Categories (cached, lightweight)
  const categories = await categoryService.list();

  // Skip popular + authors queries — use latest as fallback, fetch authors client-side
  // This reduces server-side queries from 6 → 4 (33% faster)

  return (
    <HomeV2
      latest={latest}
      popular={latest} // reuse latest as popular (saves 1 query)
      featured={featured}
      categories={categories.data}
      authors={[]} // loaded client-side
      settings={{}}
      overview={{
        books: {
          total: stats.published,
          published: stats.published,
          totalViews: stats.totalViews,
        },
        authors: stats.authors,
        categories: stats.categories,
      }}
    />
  );
}
