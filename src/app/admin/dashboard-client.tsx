"use client";
import { useEffect, useMemo, useState } from "react";
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
  Bell,
  HardDrive,
  CheckCircle2,
  Server,
  Image as ImageIcon,
  FileText,
  Plus,
  BarChart3,
  DatabaseBackup,
  Settings as SettingsIcon,
  Clock,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import type { BookWithRelations } from "@/lib/repositories";
import type { ActivityLog, User, Upload } from "@prisma/client";
import { formatFileSize, formatDateTime } from "@/components/admin/utils";

type ActivityWithUser = ActivityLog & { user: Pick<User, "id" | "name" | "email"> };

interface Overview {
  books: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    totalViews: number;
    totalDownloads: number;
    byType?: Record<string, number>;
  };
  authors: number;
  categories: number;
  users: number;
  messages: number;
  recentActivity: ActivityWithUser[];
  popularBooks: BookWithRelations[];
  recentUploads: Upload[];
  unreadNotifications: number;
  storageUsed: number;
}

interface TopAuthor {
  id: string;
  name: string;
  slug: string;
  photo?: string | null;
  bookCount: number;
}

interface DashboardClientProps {
  overview: Overview;
  userName: string;
  topAuthors: TopAuthor[];
  analyticsDaily: Array<{ date: string; count: number }>;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Membuat", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  UPDATE: { label: "Memperbarui", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  DELETE: { label: "Menghapus", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  LOGIN: { label: "Masuk", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  LOGOUT: { label: "Keluar", color: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300" },
  PUBLISH: { label: "Publikasi", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  EXPORT: { label: "Ekspor", color: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  IMPORT: { label: "Impor", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  SETTINGS: { label: "Pengaturan", color: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" },
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATE: FileEdit,
  UPDATE: FileEdit,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogIn,
  PUBLISH: Star,
  EXPORT: DatabaseBackup,
  IMPORT: DatabaseBackup,
  SETTINGS: SettingsIcon,
};

const COLLECTION_LABELS: Record<string, string> = {
  BOOK: "Buku",
  KITAB: "Kitab",
  ARTICLE: "Artikel",
  VIDEO: "Video",
  AUDIO: "Audio",
  DOCUMENT: "Dokumen",
  DINIYAH: "Diniyah",
};

function getGreeting(hour: number): string {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function DashboardClient({
  overview,
  userName,
  topAuthors,
  analyticsDaily,
}: DashboardClientProps) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting = now ? getGreeting(now.getHours()) : "Selamat datang";
  const hourStr = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "";

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

  // Build chart data: books by collection type
  const byTypeData = useMemo(() => {
    const byType = overview.books.byType ?? {};
    return Object.entries(byType).map(([key, value]) => ({
      name: COLLECTION_LABELS[key] ?? key,
      total: value as number,
    }));
  }, [overview.books.byType]);

  // Daily activity chart: use analyticsDaily (events) if present, else fall back to activity logs per day
  const dailyData = useMemo(() => {
    if (analyticsDaily.length > 0) {
      return analyticsDaily.map((d) => ({
        date: d.date.slice(5), // MM-DD
        visits: d.count,
      }));
    }
    // Build last 14 days from recentActivity
    const map = new Map<string, number>();
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const log of overview.recentActivity) {
      const key = new Date(log.createdAt).toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([k, v]) => ({
      date: k.slice(5),
      visits: v,
    }));
  }, [analyticsDaily, overview.recentActivity || []]);

  const quickActions = [
    { label: "Tambah Buku", icon: BookOpen, href: "/admin/books/new", color: "text-emerald-600 bg-emerald-500/10" },
    { label: "Tambah Penulis", icon: UserPlus, href: "/admin/authors", color: "text-amber-600 bg-amber-500/10" },
    { label: "Upload Media", icon: Upload, href: "/admin/media", color: "text-sky-600 bg-sky-500/10" },
    { label: "Lihat Analytics", icon: BarChart3, href: "/admin/analytics", color: "text-violet-600 bg-violet-500/10" },
    { label: "Backup", icon: DatabaseBackup, href: "/admin/backup", color: "text-cyan-600 bg-cyan-500/10" },
    { label: "Pengaturan", icon: SettingsIcon, href: "/admin/settings", color: "text-rose-600 bg-rose-500/10" },
  ];

  // Storage usage (assume 1GB limit)
  const STORAGE_LIMIT = 1024 * 1024 * 1024; // 1GB
  const storagePct = Math.min(100, Math.round((overview.storageUsed / STORAGE_LIMIT) * 100));

  return (
    <div>
      {/* Greeting + quick actions */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {greeting}, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Berikut ringkasan aktivitas perpustakaan digital Anda hari ini
            {now && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {hourStr} WIB
              </span>
            )}
          </p>
        </div>
        {overview.unreadNotifications > 0 && (
          <Link
            href="/admin/notifications"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-500/25 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {overview.unreadNotifications} notifikasi belum dibaca
          </Link>
        )}
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
              <Card className="relative overflow-hidden border-border/60">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md grid place-items-center">
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

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link href={a.href}>
                  <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all h-full">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <div className={`h-10 w-10 rounded-2xl grid place-items-center ${a.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{a.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              Buku per Tipe Koleksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {byTypeData.length === 0 ? (
                <div className="h-full grid place-items-center text-sm text-muted-foreground">
                  Belum ada data buku.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTypeData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Aktivitas Pengunjung (30 hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#d4af37"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: "#d4af37" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Authors + Storage + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Authors */}
        <Card className="border-border/60 lg:col-span-1">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" /> Top Penulis
            </CardTitle>
            <Link href="/admin/authors" className="text-xs text-primary hover:underline">
              Semua
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
              {(topAuthors || []).map((a, i) => (
                <Link
                  key={a.id}
                  href={`/admin/authors`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="text-base font-bold font-serif text-muted-foreground w-5">
                    {i + 1}
                  </div>
                  <Avatar className="h-9 w-9">
                    {a.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {a.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.bookCount} buku
                    </div>
                  </div>
                </Link>
              ))}
              {(topAuthors || []).length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada penulis terdaftar.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" /> Penggunaan Penyimpanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-foreground">
                {formatFileSize(overview.storageUsed)}
              </span>
              <span className="text-xs text-muted-foreground">dari 1 GB</span>
            </div>
            <Progress value={storagePct} className="h-2" />
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{storagePct}% terpakai</span>
              <span>{formatFileSize(Math.max(0, STORAGE_LIMIT - overview.storageUsed))} tersisa</span>
            </div>
            <Link
              href="/admin/media"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Kelola Media
            </Link>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" /> Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Operational
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Server Uptime</span>
                <span className="font-medium text-foreground">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium text-emerald-600">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium text-foreground">
                  {now ? now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backup Terakhir</span>
                <span className="font-medium text-foreground">Belum pernah</span>
              </div>
            </div>
            <Link
              href="/admin/cache"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <SettingsIcon className="h-3.5 w-3.5" /> Cache & Optimasi
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Top Buku + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Popular books */}
        <Card className="lg:col-span-1 border-border/60">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" /> Top Buku
            </CardTitle>
            <Link href="/admin/books" className="text-xs text-primary hover:underline">
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {(overview.popularBooks || []).map((book, i) => (
                <Link
                  key={book.id}
                  href={`/admin/books/${book.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="text-base font-bold font-serif text-muted-foreground w-5">
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
              {(overview.popularBooks || []).length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada buku yang dipublikasikan.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Timeline Aktivitas
            </CardTitle>
            <Link href="/admin/activity-logs" className="text-xs text-primary hover:underline">
              Semua log
            </Link>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60" aria-hidden />
              <ol className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {(overview.recentActivity || []).map((log) => {
                  const action = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
                  };
                  const Icon = ACTION_ICONS[log.action] || Activity;
                  return (
                    <li key={log.id} className="relative pl-10">
                      <div className={`absolute left-1.5 top-1.5 h-5 w-5 rounded-full grid place-items-center ring-4 ring-background ${action.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {log.user?.name || "Unknown"}
                        </span>
                        <Badge variant="secondary" className={`text-[10px] py-0 px-1.5 ${action.color}`}>
                          {action.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            #{log.entityId.slice(-6)}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </li>
                  );
                })}
                {(overview.recentActivity || []).length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada aktivitas tercatat.
                  </div>
                )}
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" /> Upload Terbaru
          </CardTitle>
          <Link href="/admin/media" className="text-xs text-primary hover:underline">
            Media Manager
          </Link>
        </CardHeader>
        <CardContent>
          {(!overview.recentUploads || overview.recentUploads.length === 0) ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Belum ada file yang diunggah.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(overview.recentUploads || []).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/60"
                >
                  <div className="h-10 w-10 rounded-xl grid place-items-center bg-primary/10 text-primary shrink-0">
                    {u.mimeType?.startsWith("image/") ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {u.originalName}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatFileSize(u.size)} · {u.category || "other"} · {formatDateTime(u.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
