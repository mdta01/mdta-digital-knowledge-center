import { Metadata } from "next";
import { pageService } from "@/lib/services";

export const metadata: Metadata = { title: "Syarat Penggunaan" };

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await pageService.getBySlug("terms");
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
        {page?.title || "Syarat Penggunaan"}
      </h1>
      <div
        className="prose-kitap max-w-none"
        dangerouslySetInnerHTML={{
          __html: page?.content || "<p>Konten syarat penggunaan belum tersedia.</p>",
        }}
      />
    </div>
  );
}
