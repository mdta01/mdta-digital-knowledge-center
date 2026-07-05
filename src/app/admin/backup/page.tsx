import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { BackupClient } from "./backup-client";

export const metadata: Metadata = {
  title: "Backup & Restore — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBackupPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return <BackupClient />;
}
