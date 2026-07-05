import { Metadata } from "next";
import { pageService } from "@/lib/services";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const page = await pageService.getBySlug("privacy");
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
        {page?.title || "Kebijakan Privasi"}
      </h1>
      <div
        className="prose-kitap max-w-none"
        dangerouslySetInnerHTML={{
          __html: page?.content || "<p>Konten kebijakan privasi belum tersedia.</p>",
        }}
      />
    </div>
  );
}
