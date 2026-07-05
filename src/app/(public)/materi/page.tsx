import { Metadata } from "next";
import { Moon } from "lucide-react";
import { categoryService } from "@/lib/services";
import { CollectionListing } from "@/components/public/collection-listing";
import { CollectionHero } from "@/components/public/collection-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Materi Diniyah",
  description:
    "Materi pembelajaran diniyah — modul pembelajaran untuk santri dan guru di madrasah diniyah.",
};

export default async function MateriPage() {
  const categories = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <CollectionHero
        icon={Moon}
        label="Materi Diniyah"
        description="Materi pembelajaran diniyah"
      />
      <CollectionListing
        collectionType="DINIYAH"
        collectionLabel="Materi Diniyah"
        categories={categories.data}
      />
    </div>
  );
}
