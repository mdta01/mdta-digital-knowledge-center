import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MediaManager } from "./media-manager";

export const metadata: Metadata = {
  title: "Media Manager — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN" && session.role !== "EDITOR") {
    redirect("/admin");
  }

  const [data, total, totalSize] = await Promise.all([
    db.upload.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.upload.count({ where: { deletedAt: null } }),
    db.upload.aggregate({ _sum: { size: true } }),
  ]);

  return (
    <MediaManager
      initialUploads={data}
      initialTotal={total}
      initialStorageUsed={totalSize?._sum?.size ?? 0}
    />
  );
}
