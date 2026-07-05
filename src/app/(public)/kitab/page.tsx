import { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { categoryService } from "@/lib/services";
import { CollectionListing } from "@/components/public/collection-listing";
import { CollectionHero } from "@/components/public/collection-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kitab Klasik",
  description:
    "Koleksi kitab klasik ulama dengan teks Arab dan terjemahan. Pelajari kitab kuning, fiqih, aqidah, tasawuf, dan hadits dari ulama terdahulu.",
};

export default async function KitabPage() {
  const categories = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <CollectionHero
        icon={ScrollText}
        label="Kitab Klasik"
        description="Koleksi kitab klasik ulama dengan teks Arab dan terjemahan"
      />
      <CollectionListing
        collectionType="KITAB"
        collectionLabel="Kitab Klasik"
        categories={categories.data}
      />
    </div>
  );
}
