import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Eye,
  Calendar,
  User,
  Tag,
  FileText,
  Download,
  ArrowLeft,
  BookMarked,
  Hash,
  Globe,
  Layers,
} from "lucide-react";
import { bookService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCard } from "@/components/public/book-card";
import { SettingProvider } from "./setting-provider";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await bookService.getBySlug(slug);
  if (!book) return { title: "Buku tidak ditemukan" };
  return {
    title: book.seoTitle || book.title,
    description: book.seoDescription || book.description || `Buku ${book.title} oleh ${book.author?.name}`,
    keywords: book.seoKeywords?.split(",").map((k) => k.trim()),
    openGraph: {
      title: book.title,
      description: book.description || "",
      images: book.coverImage ? [{ url: book.coverImage }] : undefined,
      type: "book",
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await bookService.getBySlug(slug);
  if (!book || book.status !== "PUBLISHED") notFound();

  const related = await bookService.related(slug, 4);

  let toc: Array<{ level: number; text: string; id: string }> = [];
  if (book.toc) {
    try {
      toc = JSON.parse(book.toc);
    } catch {
      toc = [];
    }
  }

  return (
    <SettingProvider bookId={book.id}>
      <article className="relative">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep pb-16 sm:pb-24">
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Koleksi
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8 lg:gap-12">
              {/* Cover */}
              <div className="mx-auto md:mx-0 max-w-[280px] w-full">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={`Cover ${book.title}`}
                      fill
                      sizes="(max-width: 768px) 80vw, 320px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/30 to-gold/20">
                      <BookOpen className="h-20 w-20 text-white/50" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-white">
                {book.category && (
                  <Link href={`/categories/${book.category.slug}`}>
                    <Badge className="mb-3 bg-gold/20 text-gold border-gold/40 hover:bg-gold/30">
                      {book.category.name}
                    </Badge>
                  </Link>
                )}
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {book.title}
                </h1>
                <Link
                  href={`/authors/${book.author?.slug}`}
                  className="mt-3 inline-flex items-center gap-2 text-base text-white/80 hover:text-gold transition-colors"
                >
                  <User className="h-4 w-4" />
                  {book.author?.name}
                </Link>

                {book.description && (
                  <p className="mt-5 text-white/85 text-sm sm:text-base leading-relaxed line-clamp-4">
                    {book.description}
                  </p>
                )}

                {/* Meta grid */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {book.publishedYear && (
                    <div className="glass-strong rounded-xl p-3 border-white/10">
                      <div className="flex items-center gap-1.5 text-gold text-xs">
                        <Calendar className="h-3.5 w-3.5" /> Tahun Terbit
                      </div>
                      <div className="text-white font-medium mt-1">{book.publishedYear}</div>
                    </div>
                  )}
                  {book.pages && (
                    <div className="glass-strong rounded-xl p-3 border-white/10">
                      <div className="flex items-center gap-1.5 text-gold text-xs">
                        <Layers className="h-3.5 w-3.5" /> Halaman
                      </div>
                      <div className="text-white font-medium mt-1">{book.pages}</div>
                    </div>
                  )}
                  {book.language && (
                    <div className="glass-strong rounded-xl p-3 border-white/10">
                      <div className="flex items-center gap-1.5 text-gold text-xs">
                        <Globe className="h-3.5 w-3.5" /> Bahasa
                      </div>
                      <div className="text-white font-medium mt-1 uppercase">{book.language}</div>
                    </div>
                  )}
                  {book.publisher && (
                    <div className="glass-strong rounded-xl p-3 border-white/10">
                      <div className="flex items-center gap-1.5 text-gold text-xs">
                        <BookMarked className="h-3.5 w-3.5" /> Penerbit
                      </div>
                      <div className="text-white font-medium mt-1 line-clamp-1">{book.publisher}</div>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="glass-strong rounded-xl p-3 border-white/10">
                      <div className="flex items-center gap-1.5 text-gold text-xs">
                        <Hash className="h-3.5 w-3.5" /> ISBN
                      </div>
                      <div className="text-white font-medium mt-1 text-xs">{book.isbn}</div>
                    </div>
                  )}
                  <div className="glass-strong rounded-xl p-3 border-white/10">
                    <div className="flex items-center gap-1.5 text-gold text-xs">
                      <Eye className="h-3.5 w-3.5" /> Dibaca
                    </div>
                    <div className="text-white font-medium mt-1">{book.views}×</div>
                  </div>
                </div>

                {/* Files / actions */}
                {book.files?.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {book.files.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between glass-strong rounded-xl p-3 border-white/10"
                      >
                        <div className="flex items-center gap-2 text-white text-sm">
                          <FileText className="h-4 w-4 text-gold" />
                          <span className="font-medium uppercase">{f.format}</span>
                          {f.size && (
                            <span className="text-white/60 text-xs">
                              {(f.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" className="rounded-full bg-gold hover:bg-gold/90 text-emerald-deep h-8 px-4">
                            <a href={f.url} target="_blank" rel="noopener noreferrer">
                              <BookOpen className="h-3.5 w-3.5 mr-1" /> Baca
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 h-8 px-4">
                            <a href={f.url} download>
                              <Download className="h-3.5 w-3.5 mr-1" /> Unduh
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {book.tags?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {book.tags.map((t) => (
                      <Badge key={t.id} variant="outline" className="border-white/30 text-white/80 bg-white/5">
                        <Tag className="h-3 w-3 mr-1" />
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
            {/* TOC */}
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <h3 className="font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-primary" />
                    Daftar Isi
                  </h3>
                  <nav className="space-y-1.5 text-sm">
                    {toc.map((item, i) => (
                      <a
                        key={i}
                        href={`#${item.id}`}
                        className="block text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Content */}
            <div className="max-w-3xl">
              <div
                className="prose-kitap"
                dangerouslySetInnerHTML={{ __html: book.content || book.description || "<p>Deskripsi belum tersedia untuk buku ini.</p>" }}
              />
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t border-border/60">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
              Buku Serupa
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((b, i) => (
                <BookCard key={b.id} book={b} index={i} />
              ))}
            </div>
          </section>
        )}
      </article>
    </SettingProvider>
  );
}
