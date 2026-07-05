import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { maintenanceService } from "@/lib/services";
import { MaintenanceClient } from "./maintenance-client";

export const metadata: Metadata = {
  title: "Maintenance — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const status = await maintenanceService.getStatus();

  return <MaintenanceClient initial={status} />;
}
