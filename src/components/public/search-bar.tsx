"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  defaultValue?: string;
  redirectTo?: string;
}

export function SearchBar({
  className,
  size = "md",
  placeholder = "Cari judul, penulis, atau kategori…",
  defaultValue = "",
  redirectTo = "/books",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [debounced, setDebounced] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce 350ms
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebounced(value);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [value]);

  // Trigger search on debounce
  useEffect(() => {
    if (debounced === defaultValue && !value) return;
    const url = debounced
      ? `${redirectTo}?search=${encodeURIComponent(debounced)}`
      : redirectTo;
    router.push(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const heights = {
    sm: "h-9 text-sm",
    md: "h-11 text-sm",
    lg: "h-14 text-base",
  };
  const iconSizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
          iconSizes[size]
        )}
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "w-full pl-11 pr-10 rounded-full bg-background/80 backdrop-blur-md border-border/60",
          "shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          heights[size]
        )}
      />
      {isSearching && (
        <Loader2 className={cn("absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground", iconSizes[size])} />
      )}
      {!isSearching && value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Hapus pencarian"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}
