import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "Manajemen Admin — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Require ADMIN role
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const sp = await searchParams;
  const page = Number(sp.page || "1");
  const search = sp.search || undefined;

  const initialData = await userService.list({ page, pageSize: 20, search });

  return <UsersClient initialData={initialData} currentUserRole={session.role} />;
}
