import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { analyticsService, bookService } from "@/lib/services";
import { db } from "@/lib/db";
import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Analytics — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    redirect("/admin");
  }

  const [analytics, bookStats] = await Promise.all([
    analyticsService.stats(),
    bookService.stats(),
  ]);

  // Resolve book titles for top entities (topEntities returns entityId)
  const topBookIds = analytics.topEntities
    .filter((e) => e.entity === "Book")
    .map((e) => e.entityId);
  const books = topBookIds.length
    ? await db.book.findMany({
        where: { id: { in: topBookIds } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const bookTitleMap = new Map(books.map((b) => [b.id, b.title]));

  return (
    <AnalyticsClient
      analytics={analytics}
      bookStats={bookStats}
      bookTitleMap={bookTitleMap}
    />
  );
}
