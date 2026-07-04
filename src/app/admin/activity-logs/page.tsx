import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { activityLogService } from "@/lib/services";
import { ActivityLogsClient } from "./activity-logs-client";

export const metadata: Metadata = {
  title: "Activity Log — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminActivityLogsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const initialData = await activityLogService.list({ page: 1, pageSize: 25 });

  return <ActivityLogsClient initialData={initialData} />;
}
