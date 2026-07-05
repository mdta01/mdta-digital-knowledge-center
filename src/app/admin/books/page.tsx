import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { bookService, categoryService } from "@/lib/services";
import { BooksClient } from "./books-client";

export const metadata: Metadata = {
  title: "Master Buku — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const page = Number(sp.page || "1");
  const search = sp.search || undefined;
  const status = sp.status || undefined;

  const [initialData, categoriesRes] = await Promise.all([
    bookService.listAll({ page, pageSize: 20, search, status }),
    categoryService.list(),
  ]);

  return <BooksClient initialData={initialData} categories={categoriesRes.data} />;
}
