"use client";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Eye, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { BookWithRelations } from "@/lib/repositories";

interface BookCardProps {
  book: BookWithRelations;
  index?: number;
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={`/books/${book.slug}`}
        className="group relative flex flex-col h-full rounded-3xl overflow-hidden glass card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Buka detail buku ${book.title}`}
      >
        {/* Cover */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={`Cover ${book.title}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/20 via-primary/10 to-gold/15">
              <BookOpen className="h-14 w-14 text-primary/40" strokeWidth={1.4} />
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {book.featured && (
              <Badge className="bg-gold/95 text-emerald-deep border-0 backdrop-blur-sm shadow-sm">
                <Star className="h-3 w-3 mr-1 fill-current" /> Featured
              </Badge>
            )}
            {book.category && (
              <Badge variant="secondary" className="bg-background/85 backdrop-blur-sm border-0 text-foreground">
                {book.category.name}
              </Badge>
            )}
          </div>

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/85 via-emerald-deep/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Hover quick view */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Eye className="h-3 w-3" /> Lihat Detail
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 sm:p-5">
          <h3 className="font-serif font-semibold text-base sm:text-lg text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {book.author?.name || "Penulis tidak diketahui"}
          </p>
          {book.description && (
            <p className="mt-2.5 text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
              {book.description}
            </p>
          )}

          <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            {book.publishedYear && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {book.publishedYear}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> {book.views} dibaca
            </span>
            {book.pages && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {book.pages} hlm
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden glass">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-5 space-y-2.5">
        <div className="h-4 rounded shimmer w-3/4" />
        <div className="h-3 rounded shimmer w-1/2" />
        <div className="h-3 rounded shimmer w-full" />
        <div className="h-3 rounded shimmer w-2/3" />
      </div>
    </div>
  );
}
