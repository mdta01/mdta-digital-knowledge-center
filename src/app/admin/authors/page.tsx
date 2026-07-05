import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorService } from "@/lib/services";
import { AuthorsClient } from "./authors-client";

export const metadata: Metadata = {
  title: "Master Penulis — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const page = Number(sp.page || "1");
  const search = sp.search || undefined;

  const initialData = await authorService.list({ page, pageSize: 20, search });

  return <AuthorsClient initialData={initialData} />;
}
