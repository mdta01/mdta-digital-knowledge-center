import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { dashboardService, analyticsService } from "@/lib/services";
import { db } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Knowledge Center Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [overview, analyticsStats, topAuthors] = await Promise.all([
    dashboardService.getOverview(),
    analyticsService.stats().catch(() => null),
    db.author.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { books: { where: { deletedAt: null } } } } },
      orderBy: { books: { _count: "desc" } },
      take: 5,
    }).catch(() => []),
  ]);

  return (
    <DashboardClient
      overview={overview as any}
      userName={session.name}
      topAuthors={topAuthors.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        photo: a.photo,
        bookCount: a._count?.books ?? 0,
      }))}
      analyticsDaily={analyticsStats?.daily ?? []}
    />
  );
}
