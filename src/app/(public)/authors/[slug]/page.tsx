import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen, Calendar } from "lucide-react";
import { authorService, bookService } from "@/lib/services";
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
  const author = await authorService.getBySlug(slug);
  if (!author) return { title: "Penulis tidak ditemukan" };
  return {
    title: author.name,
    description: author.bio?.slice(0, 160) || `Profil penulis ${author.name}`,
  };
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await authorService.getBySlug(slug);
  if (!author) notFound();

  const books = await bookService.listPublished({
    pageSize: 100,
    authorId: author.id,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Link
        href="/authors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Semua Penulis
      </Link>

      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep p-8 sm:p-12">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-3xl overflow-hidden ring-4 ring-gold/40 shadow-2xl shrink-0">
            {author.photo ? (
              <Image
                src={author.photo}
                alt={author.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-white/10">
                <Users className="h-16 w-16 text-white/70" />
              </div>
            )}
          </div>
          <div className="text-white text-center sm:text-left flex-1">
            <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
              Profil Penulis
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              {author.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-white/80">
              {author.nationality && <span>{author.nationality}</span>}
              {author.birthYear && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {author.birthYear}
                  {author.deathYear ? ` - ${author.deathYear}` : " - sekarang"}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> {books.total} karya
              </span>
            </div>
            {author.bio && (
              <p className="mt-4 text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
        Karya Penulis
      </h2>
      {books.data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {books.data.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Belum ada karya yang dipublikasikan"
          description="Penulis ini belum memiliki buku yang dipublikasikan di perpustakaan."
        />
      )}
    </div>
  );
}
