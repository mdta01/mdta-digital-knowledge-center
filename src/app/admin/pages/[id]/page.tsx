import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { pageRepository } from "@/lib/repositories";
import { PageEditor } from "../page-editor";

export const metadata: Metadata = {
  title: "Edit Halaman — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const page = await pageRepository.findById(id);
  if (!page) redirect("/admin/pages");

  return <PageEditor page={page} mode="edit" />;
}
