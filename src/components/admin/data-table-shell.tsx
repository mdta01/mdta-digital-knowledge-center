"use client";

import * as React from "react";
import { Search, Plus, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataTableShellProps {
  title: string;
  description?: string;
  /** Search input value */
  search?: string;
  /** Called when the debounced search changes */
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Hide the search input */
  hideSearch?: boolean;
  /** Extra filter controls rendered between search and action */
  filters?: React.ReactNode;
  /** Action button (e.g. "Tambah"). Pass `onActionClick` or use `action` as ReactNode */
  actionLabel?: string;
  onActionClick?: () => void;
  action?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Pagination */
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Table content — render `<TableHeader/>` and `<TableBody/>` here */
  children: React.ReactNode;
  className?: string;
}

export function DataTableShell({
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
  hideSearch,
  filters,
  actionLabel,
  onActionClick,
  action,
  loading,
  emptyMessage = "Belum ada data.",
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  children,
  className,
}: DataTableShellProps) {
  // Debounced search
  const [localSearch, setLocalSearch] = React.useState(search ?? "");
  React.useEffect(() => {
    setLocalSearch(search ?? "");
  }, [search]);
  React.useEffect(() => {
    if (!onSearchChange) return;
    const t = setTimeout(() => {
      onSearchChange(localSearch);
    }, 350);
    return () => clearTimeout(t);
     
  }, [localSearch]);

  const showPagination =
    onPageChange && typeof page === "number" && typeof totalPages === "number";

  const startItem =
    typeof page === "number" && typeof pageSize === "number" && typeof total === "number"
      ? (page - 1) * pageSize + 1
      : null;
  const endItem =
    typeof page === "number" && typeof pageSize === "number" && typeof total === "number"
      ? Math.min(page * pageSize, total)
      : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {(actionLabel || action) && (
          <div className="flex items-center gap-2">
            {action}
            {actionLabel && onActionClick && (
              <Button onClick={onActionClick} className="rounded-full">
                <Plus className="h-4 w-4" /> {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Toolbar */}
      {(!hideSearch || filters) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {!hideSearch && (
            <div className="relative sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}

      {/* Table */}
      <Card className="glass rounded-3xl border-border/60 overflow-hidden p-0">
        <div className="overflow-x-auto">{children}</div>

        {/* Empty state */}
        {!loading && (typeof total !== "number" || total === 0) && (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary/60 grid place-items-center mb-4">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">{emptyMessage}</p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {/* Pagination */}
        {showPagination && !loading && typeof total === "number" && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              {startItem && endItem && typeof total === "number"
                ? `Menampilkan ${startItem}–${endItem} dari ${total} data`
                : `${total} data`}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={(page ?? 1) <= 1}
                onClick={() => onPageChange?.((page ?? 1) - 1)}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Hal. {page} / {Math.max(totalPages ?? 1, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(page ?? 1) >= (totalPages ?? 1)}
                onClick={() => onPageChange?.((page ?? 1) + 1)}
                className="rounded-lg"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
