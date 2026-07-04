"use client";
import Link from "next/link";
import { LayoutGrid, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { CategoryWithRelations } from "@/lib/repositories";

const gradients = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-yellow-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-lime-500 to-green-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-teal-500 to-emerald-600",
];

export function CategoriesGrid({ categories }: { categories: CategoryWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
        >
          <Link
            href={`/categories/${cat.slug}`}
            className="group relative block rounded-3xl overflow-hidden glass card-hover h-full"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} opacity-90`} />
            <div className="absolute inset-0 islamic-pattern opacity-30" />
            <div className="relative p-6 sm:p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md grid place-items-center group-hover:scale-110 transition-transform">
                  <LayoutGrid className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold font-serif">
                    {cat._count?.books || 0}
                  </div>
                  <div className="text-xs text-white/80">buku</div>
                </div>
              </div>
              <h2 className="mt-5 font-serif text-2xl font-bold">{cat.name}</h2>
              {cat.description && (
                <p className="mt-2 text-sm text-white/85 line-clamp-2">
                  {cat.description}
                </p>
              )}
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:gap-2.5 transition-all">
                <BookOpen className="h-4 w-4" />
                Lihat Koleksi
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
