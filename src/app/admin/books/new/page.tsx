import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { categoryService, authorService } from "@/lib/services";
import { BookEditor } from "../book-editor";

export const metadata: Metadata = {
  title: "Buku Baru — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBookNewPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [categoriesRes, authorsRes] = await Promise.all([
    categoryService.list(),
    authorService.list({ pageSize: 200 }),
  ]);

  return (
    <BookEditor
      mode="create"
      categories={categoriesRes.data}
      authors={authorsRes.data}
    />
  );
}
