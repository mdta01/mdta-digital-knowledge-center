import { Metadata } from "next";
import { FileText } from "lucide-react";
import { categoryService } from "@/lib/services";
import { CollectionListing } from "@/components/public/collection-listing";
import { CollectionHero } from "@/components/public/collection-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Artikel keislaman kontemporer — kajian fiqih, aqidah, akhlak, sirah, dan isu kekinian dari sudut pandang syariat.",
};

export default async function ArtikelPage() {
  const categories = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <CollectionHero
        icon={FileText}
        label="Artikel"
        description="Artikel keislaman kontemporer"
      />
      <CollectionListing
        collectionType="ARTICLE"
        collectionLabel="Artikel"
        categories={categories.data}
      />
    </div>
  );
}
