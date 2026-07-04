"use client";
import Link from "next/link";
import Image from "next/image";
import { Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { AuthorWithRelations } from "@/lib/repositories";

export function AuthorsGrid({ authors }: { authors: AuthorWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {authors.map((author, i) => (
        <motion.div
          key={author.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
        >
          <Link
            href={`/authors/${author.slug}`}
            className="group flex items-start gap-4 p-5 rounded-3xl glass card-hover h-full"
          >
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all shrink-0">
              {author.photo ? (
                <Image
                  src={author.photo}
                  alt={author.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/30 to-gold/30">
                  <Users className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {author.name}
              </h2>
              {author.nationality && (
                <p className="text-xs text-muted-foreground mt-0.5">{author.nationality}</p>
              )}
              {author.bio && (
                <p className="text-sm text-muted-foreground/90 mt-2 line-clamp-2">
                  {author.bio}
                </p>
              )}
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                <BookOpen className="h-3.5 w-3.5" />
                {author.books?.length || 0} karya
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
