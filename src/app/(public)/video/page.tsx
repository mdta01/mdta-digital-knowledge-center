import { Metadata } from "next";
import { Video } from "lucide-react";
import { categoryService } from "@/lib/services";
import { CollectionListing } from "@/components/public/collection-listing";
import { CollectionHero } from "@/components/public/collection-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Dakwah",
  description:
    "Video kajian dan dakwah — pembahasan fiqih, aqidah, sirah, dan pendidikan Islam dalam format audio-visual.",
};

export default async function VideoPage() {
  const categories = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <CollectionHero
        icon={Video}
        label="Video Dakwah"
        description="Video kajian dan dakwah"
      />
      <CollectionListing
        collectionType="VIDEO"
        collectionLabel="Video Dakwah"
        categories={categories.data}
      />
    </div>
  );
}
