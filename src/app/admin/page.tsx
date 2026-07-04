import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { dashboardService } from "@/lib/services";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const overview = await dashboardService.getOverview();

  return <DashboardClient overview={overview} userName={session.name} />;
}
