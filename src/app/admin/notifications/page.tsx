import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { notificationService } from "@/lib/services";
import { NotificationsClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Notifikasi — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const initial = await notificationService.list({ page: 1, pageSize: 50 });

  return <NotificationsClient initial={initial} />;
}
