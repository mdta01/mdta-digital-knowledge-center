import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { settingService } from "@/lib/services";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Pengaturan — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const settings = await settingService.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Pengaturan Situs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Konfigurasi global situs web perpustakaan digital.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
