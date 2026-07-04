"use client";
import {
  BookOpen,
  Users,
  LayoutGrid,
  Eye,
  TrendingUp,
  Star,
  ScrollText,
  Mail,
  Activity,
  FileEdit,
  Trash2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import Link from "next/link";
import type { BookWithRelations } from "@/lib/repositories";
import type { ActivityLog, User } from "@prisma/client";

type ActivityWithUser = ActivityLog & { user: Pick<User, "id" | "name" | "email"> };

interface Overview {
  books: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    totalViews: number;
    totalDownloads: number;
  };
  authors: number;
  categories: number;
  users: number;
  messages: number;
  recentActivity: ActivityWithUser[];
  popularBooks: BookWithRelations[];
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Membuat", color: "bg-green-500/15 text-green-700" },
  UPDATE: { label: "Memperbarui", color: "bg-blue-500/15 text-blue-700" },
  DELETE: { label: "Menghapus", color: "bg-red-500/15 text-red-700" },
  LOGIN: { label: "Masuk", color: "bg-purple-500/15 text-purple-700" },
  LOGOUT: { label: "Keluar", color: "bg-gray-500/15 text-gray-700" },
  PUBLISH: { label: "Publikasi", color: "bg-amber-500/15 text-amber-700" },
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATE: FileEdit,
  UPDATE: FileEdit,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogIn,
  PUBLISH: Star,
};

export function DashboardClient({
  overview,
  userName,
}: {
  overview: Overview;
  userName: string;
}) {
  const stats = [
    {
      label: "Total Buku",
      value: overview.books.total,
      sub: `${overview.books.published} publikasi · ${overview.books.draft} draft`,
      icon: BookOpen,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Penulis",
      value: overview.authors,
      sub: "Penulis terdaftar",
      icon: Users,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-600",
    },
    {
      label: "Total Kategori",
      value: overview.categories,
      sub: "Kategori aktif",
      icon: LayoutGrid,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-600",
    },
    {
      label: "Total Pengunjung",
      value: overview.books.totalViews,
      sub: "Kali dibaca",
      icon: Eye,
      gradient: "from-sky-500/20 to-blue-500/20",
      iconColor: "text-sky-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Halo, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Berikut ringkasan aktivitas perpustakaan digital Anda hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className={`relative overflow-hidden border-border/60`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md grid place-items-center`}>
                      <Icon className={`h-6 w-6 ${s.iconColor}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold font-serif text-foreground">
                      {Number(s.value).toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm text-foreground/80 font-medium mt-0.5">
                      {s.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular books */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" />
              Buku Populer
            </CardTitle>
            <Link
              href="/admin/books"
              className="text-xs text-primary hover:underline"
            >
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {overview.popularBooks.map((book, i) => (
                <Link
                  key={book.id}
                  href={`/admin/books/${book.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="text-lg font-bold font-serif text-muted-foreground w-6">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {book.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {book.author?.name} · {book.category?.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-foreground">
                      {book.views}
                    </div>
                    <div className="text-[11px] text-muted-foreground">dibaca</div>
                  </div>
                </Link>
              ))}
              {overview.popularBooks.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada buku yang dipublikasikan.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
            <Link
              href="/admin/activity-logs"
              className="text-xs text-primary hover:underline"
            >
              Semua log
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60 max-h-96 overflow-y-auto">
              {overview.recentActivity.map((log) => {
                const action = ACTION_LABELS[log.action] || {
                  label: log.action,
                  color: "bg-gray-500/15 text-gray-700",
                };
                const Icon = ACTION_ICONS[log.action] || Activity;
                return (
                  <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {log.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">
                          {log.user?.name || "Unknown"}
                        </span>
                        <Badge variant="secondary" className={`text-[10px] py-0 px-1.5 ${action.color}`}>
                          {action.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {log.entity}
                        {log.entityId && (
                          <span className="text-[10px] ml-1 font-mono">
                            #{log.entityId.slice(-6)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {new Date(log.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {overview.recentActivity.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada aktivitas tercatat.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 grid place-items-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-serif">{overview.books.featured}</div>
              <div className="text-xs text-muted-foreground">Featured</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 grid place-items-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-serif">{overview.users}</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/15 grid place-items-center">
              <Mail className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-serif">{overview.messages}</div>
              <div className="text-xs text-muted-foreground">Pesan Masuk</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500/15 grid place-items-center">
              <ScrollText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-serif">{overview.recentActivity.length}</div>
              <div className="text-xs text-muted-foreground">Aktivitas Hari Ini</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
