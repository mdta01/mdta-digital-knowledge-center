import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CacheClient } from "./cache-client";

export const metadata: Metadata = {
  title: "Cache & Optimasi — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCachePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return <CacheClient />;
}
