import { Metadata } from "next";
import { Headphones } from "lucide-react";
import { categoryService } from "@/lib/services";
import { CollectionListing } from "@/components/public/collection-listing";
import { CollectionHero } from "@/components/public/collection-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audio Kajian",
  description:
    "Rekaman kajian, murottal Al-Qur'an, dan ceramah agama Islam. Dengarkan kapan saja, di mana saja.",
};

export default async function AudioPage() {
  const categories = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <CollectionHero
        icon={Headphones}
        label="Audio Kajian"
        description="Rekaman kajian, murottal, dan ceramah"
      />
      <CollectionListing
        collectionType="AUDIO"
        collectionLabel="Audio Kajian"
        categories={categories.data}
      />
    </div>
  );
}
