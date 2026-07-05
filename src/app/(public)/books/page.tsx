import { Metadata } from "next";
import { Suspense } from "react";
import { BooksClient } from "./books-client";
import { categoryService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Koleksi Buku",
  description:
    "Jelajahi koleksi lengkap buku-buku Islami di MDTA Digital Knowledge Center — Pusat Pengetahuan Islam Digital Modern.",
};

export const dynamic = "force-dynamic";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; author?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categories = await categoryService.list();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          Digital Knowledge Center
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Pusat Pengetahuan
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
          Temukan kitab klasik, modul pembelajaran diniyah, dan buku Islami
          berkualitas untuk menambah wawasan keagamaan Anda.
        </p>
      </div>
      <Suspense fallback={<div className="h-12" />}>
        <BooksClient initialSearch={params.search} initialCategory={params.category} categories={categories.data} />
      </Suspense>
    </div>
  );
}
