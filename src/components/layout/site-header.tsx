"use client";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  LayoutGrid,
  Users,
  Info,
  Phone,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Beranda", icon: BookOpen },
  { href: "/books", label: "Buku", icon: BookOpen },
  { href: "/kitab", label: "Kitab", icon: BookOpen },
  { href: "/artikel", label: "Artikel", icon: BookOpen },
  { href: "/audio", label: "Audio", icon: BookOpen },
  { href: "/video", label: "Video", icon: BookOpen },
  { href: "/materi", label: "Materi", icon: BookOpen },
  { href: "/authors", label: "Penulis", icon: Users },
  { href: "/categories", label: "Kategori", icon: LayoutGrid },
  { href: "/about", label: "Tentang", icon: Info },
  { href: "/contact", label: "Kontak", icon: Phone },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/books?search=${encodeURIComponent(search.trim())}`);
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl overflow-hidden ring-2 ring-gold/40 group-hover:ring-gold/70 transition-all">
                <Image
                  src="/icons/icon-192.png"
                  alt="Logo MDTA MIFTAHUL ULUM 01"
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-serif font-bold text-sm sm:text-base text-foreground">
                  MDTA MIFTAHUL ULUM 01
                </span>
                <span className="text-[11px] text-muted-foreground tracking-wide">
                  Islamic Knowledge Center
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-full text-sm font-medium transition-all",
                    isActive(item.href)
                      ? "text-primary-foreground bg-primary"
                      : "text-foreground/80 hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search + theme + mobile */}
            <div className="flex items-center gap-1.5">
              {/* Command palette trigger */}
              <button
                onClick={() => {
                  // Dispatch a synthetic Ctrl+K to open CommandPalette
                  const ev = new KeyboardEvent("keydown", {
                    key: "k",
                    ctrlKey: true,
                    metaKey: true,
                    bubbles: true,
                  });
                  window.dispatchEvent(ev);
                }}
                className="hidden md:flex items-center gap-2 h-10 px-3 rounded-full bg-background/60 border border-border/60 text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors w-44 lg:w-60"
                aria-label="Buka pencarian cepat (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Cari…</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                  Ctrl K
                </kbd>
              </button>

              {/* Mobile search icon (opens command palette) */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full h-10 w-10"
                onClick={() => {
                  const ev = new KeyboardEvent("keydown", {
                    key: "k",
                    ctrlKey: true,
                    metaKey: true,
                    bubbles: true,
                  });
                  window.dispatchEvent(ev);
                }}
                aria-label="Cari"
              >
                <Search className="h-5 w-5" />
              </Button>

              <ThemeToggle />

              {/* Mobile menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full h-10 w-10"
                    aria-label="Buka menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[320px] sm:w-[380px] p-0 flex flex-col"
                >
                  <SheetHeader className="p-5 border-b border-border/60">
                    <SheetTitle className="flex items-center justify-between">
                      <span className="font-serif text-lg">Menu Navigasi</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4 border-b border-border/60">
                    <form onSubmit={submitSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari buku, penulis…"
                        className="pl-9 h-11 rounded-xl"
                      />
                    </form>
                  </div>
                  <nav className="flex flex-col p-2 gap-1">
                    {NAV.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-secondary"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
