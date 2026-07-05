import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { PageEditor } from "../page-editor";

export const metadata: Metadata = {
  title: "Halaman Baru — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPageNewPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return <PageEditor mode="create" />;
}
