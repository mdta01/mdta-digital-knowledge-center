import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { categoryService, bookService } from "@/lib/services";
import { BookCard } from "@/components/public/book-card";
import { EmptyState } from "@/components/public/section-utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await categoryService.getBySlug(slug);
  if (!cat) return { title: "Kategori tidak ditemukan" };
  return {
    title: `Kategori: ${cat.name}`,
    description: cat.description || `Koleksi buku kategori ${cat.name}`,
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await categoryService.getBySlug(slug);
  if (!category) notFound();

  const books = await bookService.listPublished({
    pageSize: 100,
    categoryId: category.id,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Semua Kategori
      </Link>

      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep p-8 sm:p-12">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative">
          <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
            Kategori
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-white/85 text-sm sm:text-base max-w-2xl">
              {category.description}
            </p>
          )}
          <p className="mt-3 text-gold text-sm font-medium">
            {books.total} buku tersedia
          </p>
        </div>
      </div>

      {books.data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {books.data.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Belum ada buku di kategori ini"
          description="Kategori ini belum memiliki koleksi buku yang dipublikasikan."
          actionHref="/books"
          actionLabel="Lihat semua buku"
        />
      )}
    </div>
  );
}
