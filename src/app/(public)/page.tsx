import {
  bookService,
  authorService,
  categoryService,
} from "@/lib/services";
import { HomeV2 } from "./home-v2";

// Always render at request time — prevents build-time prerendering
// which would exhaust the Supabase connection pool with concurrent queries.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // SEQUENTIAL queries (not parallel) to avoid connection pool exhaustion.
  // Supabase Transaction Pooler allows only 1 connection per serverless function.
  // Running queries in sequence = 1 connection at a time = no timeout.

  // 1. Stats (lightweight — 4 queries with individual .catch)
  const stats = await bookService.publicStats();

  // 2. Featured books (small set)
  const featured = await bookService.featured(4);

  // 3. Latest books
  const latest = await bookService.latest(8);

  // 4. Popular books
  const popular = await bookService.popular(8);

  // 5. Categories
  const categories = await categoryService.list();

  // 6. Authors (top 8)
  const authors = await authorService.list({ pageSize: 8 });

  // Settings are now loaded client-side by HomeV2 (via /api/public/settings)
  // to avoid blocking server-side rendering on DB connection.
  return (
    <HomeV2
      latest={latest}
      popular={popular}
      featured={featured}
      categories={categories.data}
      authors={authors.data}
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
