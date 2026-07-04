import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { categoryService } from "@/lib/services";
import { CategoriesClient } from "./categories-client";

export const metadata: Metadata = {
  title: "Master Kategori — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const search = sp.search || undefined;

  const initialData = await categoryService.list({ search });

  return <CategoriesClient initialData={initialData} />;
}
