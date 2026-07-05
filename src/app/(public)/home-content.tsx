"use client";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Search,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Users,
  Sparkles,
  Quote,
  Star,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/public/search-bar";
import { BookCard, BookCardSkeleton } from "@/components/public/book-card";
import { SectionHeading, EmptyState } from "@/components/public/section-utils";
import { motion } from "framer-motion";
import type { BookWithRelations, AuthorWithRelations, CategoryWithRelations } from "@/lib/repositories";

interface HomeContentProps {
  latest: BookWithRelations[];
  popular: BookWithRelations[];
  featured: BookWithRelations[];
  categories: CategoryWithRelations[];
  authors: AuthorWithRelations[];
  settings: Record<string, string>;
  overview: {
    books: { total: number; published: number; totalViews: number };
    authors: number;
    categories: number;
  };
}

function categoryGradient(name: string) {
  const gradients = [
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-yellow-600",
    "from-rose-500 to-pink-600",
    "from-sky-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-lime-500 to-green-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return gradients[Math.abs(h) % gradients.length];
}

export function HomeContent({
  latest,
  popular,
  featured,
  categories,
  authors,
  settings,
  overview,
}: HomeContentProps) {
  const topCategories = [...categories]
    .sort((a, b) => (b._count?.books || 0) - (a._count?.books || 0))
    .slice(0, 6);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-primary/95 to-emerald-deep" />
          <div className="absolute inset-0 islamic-pattern opacity-40" />
          <svg
            className="absolute -top-24 -right-24 w-[480px] h-[480px] text-gold/15"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <g stroke="currentColor" strokeWidth="0.8">
              <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" />
              <polygon points="100,40 160,70 160,130 100,160 40,130 40,70" />
              <polygon points="100,60 140,80 140,120 100,140 60,120 60,80" />
              <circle cx="100" cy="100" r="40" />
              <circle cx="100" cy="100" r="25" />
            </g>
          </svg>
          <svg
            className="absolute -bottom-32 -left-20 w-[360px] h-[360px] text-gold/10 rotate-45"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <g stroke="currentColor" strokeWidth="0.6">
              {Array.from({ length: 8 }).map((_, i) => (
                <polygon
                  key={i}
                  points="100,20 180,100 100,180 20,100"
                  transform={`rotate(${i * 22.5} 100 100)`}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 -m-3 rounded-full bg-gold/20 blur-2xl" />
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl overflow-hidden ring-4 ring-gold/40 shadow-2xl">
                <Image
                  src="/icons/icon-192.png"
                  alt="Logo MDTA MIFTAHUL ULUM 01"
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Badge className="mb-4 bg-gold/15 text-gold border-gold/30 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1.5" />
                MDTA Digital Knowledge Center — Modern Islamic Learning
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl"
            >
              MDTA Digital{" "}
              <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">
                MDTA MIFTAHUL ULUM 01
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed"
            >
              Jelajahi ribuan kitab klasik, modul pembelajaran diniyah, dan buku
              digital berkualitas — kapan saja, di mana saja, tanpa harus login.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-8 w-full max-w-2xl"
            >
              <SearchBar size="lg" placeholder="Cari judul buku, penulis, atau kategori…" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-6 flex flex-col sm:flex-row items-center gap-3"
            >
              <Button
                asChild
                size="lg"
                className="bg-gold hover:bg-gold/90 text-emerald-deep rounded-full px-7 h-12 font-semibold shadow-lg shadow-gold/30"
              >
                <Link href="/books">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Jelajahi Koleksi
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white/15 hover:text-white rounded-full px-7 h-12"
              >
                <Link href="/categories">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Lihat Kategori
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-3xl"
            >
              {[
                { label: "Koleksi Buku", value: overview.books.published || overview.books.total, icon: BookOpen },
                { label: "Penulis", value: overview.authors, icon: Users },
                { label: "Kategori", value: overview.categories, icon: LayoutGrid },
                { label: "Total Dibaca", value: overview.books.totalViews, icon: Eye },
              ].map((s) => (
                <div
                  key={s.label}
                  className="glass-strong rounded-2xl p-3 sm:p-4 text-center border-white/10"
                >
                  <s.icon className="h-5 w-5 mx-auto mb-1.5 text-gold" />
                  <div className="text-xl sm:text-2xl font-bold text-white font-serif">
                    {Number(s.value).toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 -z-5">
          <svg viewBox="0 0 1440 80" className="w-full h-12 sm:h-20" preserveAspectRatio="none" aria-hidden>
            <path d="M0,80 C480,0 960,0 1440,80 L1440,80 L0,80 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <SectionHeading
            eyebrow="Pilihan Editor"
            title="Buku Pilihan"
            description="Koleksi terbaik yang direkomendasikan untuk Anda pelajari."
            href="/books?featured=1"
          />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ===== LATEST BOOKS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SectionHeading
          eyebrow="Baru Ditambahkan"
          title="Buku Terbaru"
          description="Koleksi terbaru yang baru saja ditambahkan ke perpustakaan."
          href="/books?sort=latest"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {latest.length > 0 ? (
            latest.map((book, i) => <BookCard key={book.id} book={book} index={i} />)
          ) : (
            Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
          )}
        </div>
      </section>

      {/* ===== POPULAR CATEGORIES ===== */}
      <section className="relative py-12 sm:py-16 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Jelajahi"
            title="Kategori Populer"
            description="Temukan buku berdasarkan bidang ilmu yang Anda minati."
            href="/categories"
            align="center"
          />
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {topCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group relative block aspect-square rounded-3xl overflow-hidden glass card-hover"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(cat.name)} opacity-90`} />
                  <div className="absolute inset-0 islamic-pattern opacity-30" />
                  <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 backdrop-blur-md grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-serif font-semibold text-white text-sm sm:text-base leading-tight line-clamp-2">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-white/80 mt-1">
                      {cat._count?.books || 0} buku
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR BOOKS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SectionHeading
          eyebrow="Trending"
          title="Buku Populer"
          description="Buku-buku yang paling banyak dibaca pengunjung."
          href="/books?sort=popular"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {popular.length > 0 ? (
            popular.map((book, i) => <BookCard key={book.id} book={book} index={i} />)
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon={TrendingUp}
                title="Belum ada data populer"
                description="Mulai tambahkan buku dan publish untuk melihatnya muncul di sini."
                actionHref="/books"
                actionLabel="Jelajahi semua buku"
              />
            </div>
          )}
        </div>
      </section>

      {/* ===== AUTHORS ===== */}
      {authors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <SectionHeading
            eyebrow="Para Penulis"
            title="Penulis Unggulan"
            description="Ulama dan penulis yang karyanya tersedia di perpustakaan."
            href="/authors"
          />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {authors.slice(0, 8).map((author, i) => (
              <motion.div
                key={author.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  href={`/authors/${author.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-3xl glass card-hover"
                >
                  <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all">
                    {author.photo ? (
                      <Image
                        src={author.photo}
                        alt={author.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/30 to-gold/30">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 font-serif font-semibold text-sm text-foreground line-clamp-1">
                    {author.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {author.books?.length || 0} karya
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ===== ISLAMIC QUOTE ===== */}
      {settings.islamicQuote && (
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-primary/95 to-emerald-deep -z-10" />
          <div className="absolute inset-0 islamic-pattern opacity-30 -z-10" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <Quote className="h-12 w-12 mx-auto text-gold mb-6 opacity-80" />
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-serif text-xl sm:text-2xl lg:text-3xl text-white leading-relaxed font-medium italic"
            >
              {settings.islamicQuote}
            </motion.blockquote>
            {settings.quoteAuthor && (
              <div className="mt-6 inline-flex items-center gap-2 text-gold text-sm sm:text-base">
                <span className="h-px w-8 bg-gold/60" />
                <span className="font-medium">{settings.quoteAuthor}</span>
                <span className="h-px w-8 bg-gold/60" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden glass-strong p-8 sm:p-12 text-center">
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          <div className="relative">
            <Star className="h-10 w-10 mx-auto text-gold mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Mulai Perjalanan Ilmiah Anda Hari Ini
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-6">
              Akses penuh ke seluruh koleksi perpustakaan — gratis, tanpa
              registrasi. Baca online atau unduh untuk dipelajari offline.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full px-7 h-12 bg-primary hover:bg-primary/90"
            >
              <Link href="/books">
                Mulai Membaca
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
