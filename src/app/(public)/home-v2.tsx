"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Users,
  Eye,
  Library,
  ScrollText,
  Headphones,
  Video,
  FileText,
  Moon,
  Quote,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/public/search-bar";
import type { BookWithRelations, AuthorWithRelations, CategoryWithRelations } from "@/lib/repositories";

interface HomeV2Props {
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

const COLLECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BOOK: BookOpen,
  KITAB: ScrollText,
  ARTICLE: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  DOCUMENT: FileText,
  DINIYAH: Moon,
};

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function AnimatedIslamicGeometry() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Rotating 8-point star */}
      <motion.svg
        className="absolute -top-32 -right-32 w-[600px] h-[600px] text-gold/12"
        viewBox="0 0 200 200"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <g stroke="currentColor" strokeWidth="0.5">
          <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" />
          <polygon points="100,40 160,70 160,130 100,160 40,130 40,70" />
          <polygon points="100,60 140,80 140,120 100,140 60,120 60,80" />
          <circle cx="100" cy="100" r="50" />
          <circle cx="100" cy="100" r="35" />
          <circle cx="100" cy="100" r="20" />
        </g>
      </motion.svg>

      {/* Counter-rotating arabesque */}
      <motion.svg
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] text-gold/10"
        viewBox="0 0 200 200"
        fill="none"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <g stroke="currentColor" strokeWidth="0.6">
          {Array.from({ length: 12 }).map((_, i) => (
            <polygon
              key={i}
              points="100,20 180,100 100,180 20,100"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="80" />
          <circle cx="100" cy="100" r="60" />
        </g>
      </motion.svg>

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gold/40"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-gold/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

export function HomeV2({
  latest,
  popular,
  featured,
  categories,
  authors,
  settings: serverSettings,
  overview,
}: HomeV2Props) {
  const mouse = useMousePosition();
  // Fetch settings client-side to avoid blocking server render on DB
  const [settings, setSettings] = useState<Record<string, string>>(serverSettings || {});
  useEffect(() => {
    if (serverSettings?.islamicQuote) return; // already have settings
    fetch("/api/public/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setSettings(data); })
      .catch(() => {});
  }, [serverSettings]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const smoothHeroY = useSpring(heroY, { damping: 30, stiffness: 80 });

  // Parallax layers
  const layer1X = useTransform(useMotionValue(0), (v) => v + mouse.x * 15);
  const layer1Y = useTransform(useMotionValue(0), (v) => v + mouse.y * 15);
  const layer2X = useTransform(useMotionValue(0), (v) => v + mouse.x * 30);
  const layer2Y = useTransform(useMotionValue(0), (v) => v + mouse.y * 30);

  const topCategories = useMemo(
    () =>
      [...categories]
        .sort((a, b) => (b._count?.books || 0) - (a._count?.books || 0))
        .slice(0, 6),
    [categories]
  );

  const stats = [
    { label: "Knowledge Assets", value: overview.books.published || overview.books.total, icon: Library, suffix: "+" },
    { label: "Penulis & Kontributor", value: overview.authors, icon: Users, suffix: "+" },
    { label: "Kategori Ilmu", value: overview.categories, icon: LayoutGrid, suffix: "" },
    { label: "Total Pembaca", value: overview.books.totalViews, icon: Eye, suffix: "+" },
  ];

  return (
    <>
      {/* ===== HERO FULLSCREEN ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Gradient background */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 -z-20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 via-transparent to-emerald-deep/40" />
        </motion.div>

        {/* Animated islamic geometry (parallax layer 1) */}
        <motion.div
          style={{ x: layer1X, y: layer1Y, opacity: heroOpacity }}
          className="absolute inset-0 -z-10"
        >
          <AnimatedIslamicGeometry />
        </motion.div>

        {/* Floating ornaments (parallax layer 2) */}
        <motion.div
          style={{ x: layer2X, y: layer2Y, opacity: heroOpacity }}
          className="absolute inset-0 -z-10 pointer-events-none"
        >
          {/* Crescent moon top-right */}
          <motion.div
            className="absolute top-20 right-[15%]"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-gold/80 blur-sm" />
              <div className="relative h-16 w-16 rounded-full bg-gold" />
              <div className="absolute top-0 right-0 h-14 w-14 rounded-full bg-emerald-deep -mr-3" />
            </div>
          </motion.div>

          {/* Book icon floating bottom-left */}
          <motion.div
            className="absolute bottom-32 left-[10%]"
            animate={{ y: [0, 25, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="h-20 w-20 rounded-2xl glass-strong grid place-items-center">
              <BookOpen className="h-10 w-10 text-gold" />
            </div>
          </motion.div>

          {/* Star top-left */}
          <motion.div
            className="absolute top-32 left-[20%]"
            animate={{ y: [0, -15, 0], rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-gold/70" />
          </motion.div>

          {/* Scroll icon bottom-right */}
          <motion.div
            className="absolute bottom-40 right-[18%]"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="h-16 w-16 rounded-2xl glass-strong grid place-items-center">
              <ScrollText className="h-8 w-8 text-gold" />
            </div>
          </motion.div>
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ y: smoothHeroY, opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
        >
          {/* Logo with floating effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8 inline-block"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 -m-4 rounded-full bg-gold/30 blur-2xl" />
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden ring-4 ring-gold/40 shadow-2xl">
                <Image
                  src="/icons/icon-192.png"
                  alt="Logo MDTA MIFTAHUL ULUM 01"
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="mb-5 bg-gold/15 text-gold border-gold/30 backdrop-blur-sm rounded-full px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              MDTA Digital Knowledge Center — Modern Islamic Learning Platform
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight max-w-5xl mx-auto"
          >
            MDTA Digital{" "}
            <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">
              Knowledge Center
            </span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl text-white/80 mt-2 block">
              Membangun Peradaban Melalui Ilmu dan Teknologi
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Akses ribuan kitab klasik, buku, artikel, materi diniyah, audio kajian, dan video pembelajaran Islam berkualitas — gratis, tanpa login, kapan saja, di mana saja.
          </motion.p>

          {/* Search bar dominant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 w-full max-w-2xl mx-auto"
          >
            <SearchBar
              size="lg"
              placeholder="Cari kitab, buku, penulis, atau kategori…"
            />
            <p className="mt-3 text-xs text-white/60">
              Tekan{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80 font-mono text-[10px]">
                Ctrl K
              </kbd>{" "}
              atau{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80 font-mono text-[10px]">
                ⌘ K
              </kbd>{" "}
              untuk pencarian cepat
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-gold hover:bg-gold/90 text-emerald-deep rounded-full px-8 h-13 font-semibold shadow-2xl shadow-gold/40 hover:shadow-gold/60 hover:scale-105 transition-all"
            >
              <Link href="/books">
                <BookOpen className="mr-2 h-5 w-5" />
                Jelajahi Koleksi
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white/15 hover:text-white rounded-full px-8 h-13"
            >
              <Link href="/about">
                <Info className="mr-2 h-5 w-5" />
                Tentang Kami
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="glass-strong rounded-2xl p-3 sm:p-5 text-center border-white/10"
              >
                <s.icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-gold" />
                <div className="text-xl sm:text-3xl font-bold text-white font-serif">
                  {Number(s.value).toLocaleString("id-ID")}
                  {s.suffix}
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-1 text-white/50"
            >
              <span className="text-[10px] uppercase tracking-widest">Scroll</span>
              <div className="h-8 w-5 rounded-full border border-white/30 flex justify-center pt-1">
                <div className="h-1.5 w-1 rounded-full bg-white/60" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom fade to background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>

      {/* ===== COLLECTION TYPES ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { type: "BOOK", label: "Buku", href: "/books?type=BOOK" },
            { type: "KITAB", label: "Kitab", href: "/kitab" },
            { type: "ARTICLE", label: "Artikel", href: "/artikel" },
            { type: "AUDIO", label: "Audio", href: "/audio" },
            { type: "VIDEO", label: "Video", href: "/video" },
            { type: "DINIYAH", label: "Materi Diniyah", href: "/materi" },
            { type: "DOCUMENT", label: "Dokumen", href: "/books?type=DOCUMENT" },
          ].map((item, i) => {
            const Icon = COLLECTION_ICONS[item.type] || BookOpen;
            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={item.href}
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl glass card-hover h-full"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-gold/15 grid place-items-center group-hover:from-primary/25 group-hover:to-gold/25 transition-colors">
                    <Icon className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground text-center">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <SectionHeadingV2
            eyebrow="Pilihan Editor"
            title="Koleksi Pilihan"
            description="Karya terbaik yang direkomendasikan untuk Anda pelajari."
            href="/books?featured=1"
          />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((book, i) => (
              <BookCardLazy key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ===== LATEST BOOKS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SectionHeadingV2
          eyebrow="Baru Ditambahkan"
          title="Koleksi Terbaru"
          description="Karya terbaru yang baru saja ditambahkan ke pusat pengetahuan."
          href="/books?sort=latest"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {latest.length > 0 ? (
            latest.map((book, i) => <BookCardLazy key={book.id} book={book} index={i} />)
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Belum ada koleksi terbaru.
            </div>
          )}
        </div>
      </section>

      {/* ===== POPULAR CATEGORIES ===== */}
      <section className="relative py-12 sm:py-16 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeadingV2
            eyebrow="Bidang Ilmu"
            title="Kategori Populer"
            description="Temukan karya berdasarkan bidang ilmu yang Anda minati."
            href="/categories"
            align="center"
          />
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {topCategories.map((cat, i) => (
              <CategoryCard key={cat.id} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR BOOKS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SectionHeadingV2
          eyebrow="Trending"
          title="Koleksi Populer"
          description="Karya yang paling banyak dibaca pengunjung."
          href="/books?sort=popular"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {popular.length > 0 ? (
            popular.map((book, i) => <BookCardLazy key={book.id} book={book} index={i} />)
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Belum ada data populer.
            </div>
          )}
        </div>
      </section>

      {/* ===== AUTHORS ===== */}
      {authors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <SectionHeadingV2
            eyebrow="Para Penulis"
            title="Penulis Unggulan"
            description="Ulama dan penulis yang karyanya tersedia di pusat pengetahuan."
            href="/authors"
          />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {authors.slice(0, 8).map((author, i) => (
              <AuthorCard key={author.id} author={author} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ===== ISLAMIC QUOTE ===== */}
      {settings.islamicQuote && (
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep -z-10" />
          <div className="absolute inset-0 islamic-pattern opacity-30 -z-10" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Quote className="h-14 w-14 mx-auto text-gold mb-6 opacity-80" />
            </motion.div>
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
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 inline-flex items-center gap-2 text-gold text-sm sm:text-base"
              >
                <span className="h-px w-8 bg-gold/60" />
                <span className="font-medium">{settings.quoteAuthor}</span>
                <span className="h-px w-8 bg-gold/60" />
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden glass-strong p-8 sm:p-14 text-center"
        >
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          <div className="relative">
            <Sparkles className="h-12 w-12 mx-auto text-gold mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Mulai Perjalanan Ilmiah Anda Hari Ini
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-6">
              Akses penuh ke seluruh pusat pengetahuan — gratis, tanpa registrasi.
              Baca online, unduh untuk offline, atau simpan bookmark untuk dibaca nanti.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90"
              >
                <Link href="/books">
                  Mulai Membaca
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12"
              >
                <Link href="/categories">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Jelajahi Kategori
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

// Lazy-load BookCard with motion
import { BookCard } from "@/components/public/book-card";
import { Info } from "lucide-react";
import { useMotionValue } from "framer-motion";

function BookCardLazy({ book, index }: { book: BookWithRelations; index: number }) {
  return <BookCard book={book} index={index} />;
}

function SectionHeadingV2({
  eyebrow,
  title,
  description,
  align = "left",
  href,
  hrefLabel = "Lihat semua",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === "center" ? "text-center max-w-2xl mx-auto" : ""}
    >
      {eyebrow && (
        <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          {eyebrow}
        </span>
      )}
      <div
        className={
          align === "center"
            ? ""
            : "flex items-end justify-between gap-4 flex-wrap"
        }
      >
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all whitespace-nowrap"
          >
            {hrefLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

const gradients = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-yellow-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-lime-500 to-green-600",
];

function CategoryCard({ cat, index }: { cat: CategoryWithRelations; index: number }) {
  const gradient = gradients[index % gradients.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={`/categories/${cat.slug}`}
        className="group relative block aspect-square rounded-3xl overflow-hidden glass card-hover"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 backdrop-blur-md grid place-items-center mb-3 group-hover:scale-110 transition-transform">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-serif font-semibold text-white text-sm sm:text-base leading-tight line-clamp-2">
            {cat.name}
          </h3>
          <p className="text-[11px] text-white/80 mt-1">
            {cat._count?.books || 0} karya
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function AuthorCard({
  author,
  index,
}: {
  author: AuthorWithRelations;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
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
  );
}
