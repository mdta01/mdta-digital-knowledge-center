import { Metadata } from "next";
import { categoryService } from "@/lib/services";
import { CategoriesGrid } from "./categories-client";

export const metadata: Metadata = {
  title: "Kategori",
  description: "Jelajahi buku berdasarkan kategori ilmu: Aqidah, Fiqih, Tafsir, Hadits, Tajwid, dan lainnya.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const result = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          Bidang Ilmu
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Kategori Buku
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Jelajahi koleksi buku berdasarkan disiplin ilmu yang ingin Anda pelajari.
        </p>
      </div>
      <CategoriesGrid categories={result.data} />
    </div>
  );
}
