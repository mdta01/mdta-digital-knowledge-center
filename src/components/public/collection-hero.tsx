import type { LucideIcon } from "lucide-react";

interface CollectionHeroProps {
  icon: LucideIcon;
  label: string;
  description: string;
  count?: number;
}

/**
 * Hero header for collection-type listing pages (KITAB, ARTICLE, AUDIO, VIDEO, DINIYAH).
 * Server component — no client interactivity.
 */
export function CollectionHero({
  icon: Icon,
  label,
  description,
  count,
}: CollectionHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 sm:mb-10 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep p-6 sm:p-10 lg:p-14">
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gold/20 ring-2 ring-gold/40 grid place-items-center shrink-0">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-gold" strokeWidth={1.4} aria-hidden="true" />
        </div>
        <div className="flex-1 text-white">
          <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
            Koleksi
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {label}
          </h1>
          <p className="mt-2 text-white/85 text-sm sm:text-base max-w-2xl">
            {description}
          </p>
          {typeof count === "number" && (
            <p className="mt-3 text-gold text-sm font-medium">
              {count} judul tersedia
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
