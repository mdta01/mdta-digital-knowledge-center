import {
  bookService,
  authorService,
  categoryService,
  settingService,
  dashboardService,
} from "@/lib/services";
import { HomeV2 } from "./home-v2";

export const revalidate = 60;

export default async function HomePage() {
  const [latest, popular, featured, categories, authors, settings, overview] =
    await Promise.all([
      bookService.latest(8),
      bookService.popular(8),
      bookService.featured(4),
      categoryService.list(),
      authorService.list({ pageSize: 8 }),
      settingService.getAll(),
      dashboardService.getOverview(),
    ]);

  return (
    <HomeV2
      latest={latest}
      popular={popular}
      featured={featured}
      categories={categories.data}
      authors={authors.data}
      settings={settings}
      overview={{
        books: {
          total: overview.books.total,
          published: overview.books.published,
          totalViews: overview.books.totalViews,
        },
        authors: overview.authors,
        categories: overview.categories,
      }}
    />
  );
}
