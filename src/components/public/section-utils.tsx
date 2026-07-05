import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl glass">
      {Icon && (
        <div className="h-16 w-16 rounded-full bg-secondary grid place-items-center mb-4">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-serif text-xl text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
        >
          {actionLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function SectionHeading({
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
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : ""}>
      {eyebrow && (
        <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          {eyebrow}
        </span>
      )}
      <div className={align === "center" ? "" : "flex items-end justify-between gap-4 flex-wrap"}>
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
            {hrefLabel} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
