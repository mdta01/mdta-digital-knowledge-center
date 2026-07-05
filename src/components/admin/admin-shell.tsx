"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  LayoutGrid,
  FileText,
  Settings,
  UserCog,
  ScrollText,
  Mail,
  LogOut,
  Menu,
  X,
  Loader2,
  ExternalLink,
  Bell,
  BarChart3,
  Image as ImageIcon,
  DatabaseBackup,
  Database,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AdminUser {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // roles allowed to see this item
}

const NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/books", label: "Master Buku", icon: BookOpen },
  { href: "/admin/authors", label: "Master Penulis", icon: Users },
  { href: "/admin/categories", label: "Master Kategori", icon: LayoutGrid },
  { href: "/admin/pages", label: "Master Halaman", icon: FileText },
  { href: "/admin/messages", label: "Pesan Masuk", icon: Mail },
  { href: "/admin/notifications", label: "Notifikasi", icon: Bell },
  { href: "/admin/users", label: "Manajemen Admin", icon: UserCog, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/media", label: "Media Manager", icon: ImageIcon, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
  { href: "/admin/activity-logs", label: "Activity Log", icon: ScrollText, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/backup", label: "Backup & Restore", icon: DatabaseBackup, roles: ["SUPER_ADMIN"] },
  { href: "/admin/cache", label: "Cache & Optimasi", icon: Database, roles: ["SUPER_ADMIN"] },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench, roles: ["SUPER_ADMIN"] },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings, roles: ["SUPER_ADMIN"] },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) {
          router.replace("/admin/login");
          return;
        }
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Don't show admin layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const filteredNav = NAV.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-border/60">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-gold/40">
            <Image
              src="/icons/icon-192.png"
              alt="Logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="leading-tight">
            <div className="font-serif font-bold text-sm text-foreground">
              Admin Panel
            </div>
            <div className="text-[11px] text-muted-foreground">
              MDTA MIFTAHUL ULUM
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border/60 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Lihat Situs Publik
        </Link>
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-secondary/50">
          <div className="h-9 w-9 rounded-full bg-primary/15 grid place-items-center text-sm font-semibold text-primary shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {user.role.replace("_", " ")}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={async () => {
            await fetch("/api/admin/auth/logout", { method: "POST" });
            router.replace("/admin/login");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-background border-r border-border/60 flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 glass-strong border-b border-border/60 px-4 h-14 flex items-center justify-between">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu Admin</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/icons/icon-192.png"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="font-serif font-bold text-sm">Admin Panel</span>
        </Link>
        <div className="w-10" />
      </header>

      {/* Main */}
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
