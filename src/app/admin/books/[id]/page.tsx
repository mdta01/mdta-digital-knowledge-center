import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { bookService, categoryService, authorService } from "@/lib/services";
import { BookEditor } from "../book-editor";

export const metadata: Metadata = {
  title: "Edit Buku — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBookEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const [book, categoriesRes, authorsRes] = await Promise.all([
    bookService.getById(id),
    categoryService.list(),
    authorService.list({ pageSize: 200 }),
  ]);

  if (!book) redirect("/admin/books");

  return (
    <BookEditor
      mode="edit"
      book={book}
      categories={categoriesRes.data}
      authors={authorsRes.data}
    />
  );
}
