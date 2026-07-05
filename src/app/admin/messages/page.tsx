import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { contactMessageService } from "@/lib/services";
import { MessagesClient } from "./messages-client";

export const metadata: Metadata = {
  title: "Pesan Masuk — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const initialData = await contactMessageService.list({ page: 1, pageSize: 50 });

  return <MessagesClient initialData={initialData} />;
}
