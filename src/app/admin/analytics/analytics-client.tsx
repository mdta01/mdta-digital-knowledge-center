"use client";
import { motion } from "framer-motion";
import {
  Eye,
  MousePointerClick,
  Download,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Users as UsersIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface AnalyticsData {
  totalEvents: number;
  pageViews: number;
  downloads: number;
  uniqueSessions: number;
  daily: Array<{ date: string; count: number }>;
  topEntities: Array<{ entity: string; entityId: string; count: number }>;
}

interface BookStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  totalViews: number;
  totalDownloads: number;
  byType: Record<string, number>;
}

const COLLECTION_LABELS: Record<string, string> = {
  BOOK: "Buku",
  KITAB: "Kitab",
  ARTICLE: "Artikel",
  VIDEO: "Video",
  AUDIO: "Audio",
  DOCUMENT: "Dokumen",
  DINIYAH: "Diniyah",
};

export function AnalyticsClient({
  analytics,
  bookStats,
  bookTitleMap,
}: {
  analytics: AnalyticsData;
  bookStats: BookStats;
  bookTitleMap: Map<string, string>;
}) {
  const kpis = [
    {
      label: "Total Pengunjung",
      value: analytics.uniqueSessions,
      sub: "Sesi unik 30 hari",
      icon: UsersIcon,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-600",
    },
    {
      label: "Page Views",
      value: analytics.pageViews,
      sub: "Total halaman dilihat",
      icon: Eye,
      gradient: "from-sky-500/20 to-blue-500/20",
      iconColor: "text-sky-600",
    },
    {
      label: "Downloads",
      value: analytics.downloads,
      sub: "Total unduhan",
      icon: Download,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-600",
    },
    {
      label: "Total Events",
      value: analytics.totalEvents,
      sub: "Semua event analitik",
      icon: Activity,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-600",
    },
  ];

  const dailyData = analytics.daily.map((d) => ({
    date: d.date.slice(5),
    visits: d.count,
  }));

  const byTypeData = Object.entries(bookStats.byType || {}).map(([k, v]) => ({
    name: COLLECTION_LABELS[k] ?? k,
    total: v as number,
  }));

  // Emerald + gold premium palette for the pie chart
  const PIE_COLORS = [
    "#059669", // emerald
    "#d4af37", // gold
    "#0d9488", // teal
    "#ca8a04", // amber
    "#16a34a", // green
    "#92660f", // dark gold
    "#34d399", // light emerald
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Statistik pengunjung, halaman dilihat, unduhan, dan konten populer (30 hari terakhir).
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="relative overflow-hidden border-border/60">
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-50`} />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md grid place-items-center">
                      <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold font-serif text-foreground">
                      {Number(kpi.value).toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm text-foreground/80 font-medium mt-0.5">
                      {kpi.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Pengunjung Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {dailyData.length === 0 ? (
                <div className="h-full grid place-items-center text-sm text-muted-foreground">
                  Belum ada data pengunjung.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="visits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#visits)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Kategori Koleksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {byTypeData.length === 0 ? (
                <div className="h-full grid place-items-center text-sm text-muted-foreground">
                  Belum ada buku.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byTypeData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={3}
                      label={(entry: { name?: string; total?: number }) =>
                        `${entry.name ?? ""}: ${entry.total ?? 0}`
                      }
                      labelLine={false}
                    >
                      {byTypeData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular content */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Konten Populer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="pl-4">Entitas</TableHead>
                <TableHead>Judul / ID</TableHead>
                <TableHead className="text-right pr-4">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topEntities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                    Belum ada konten populer yang tercatat.
                  </TableCell>
                </TableRow>
              )}
              {analytics.topEntities.map((e, i) => {
                const title = bookTitleMap.get(e.entityId) || e.entityId.slice(-8);
                return (
                  <TableRow key={`${e.entityId}-${i}`} className="hover:bg-secondary/30">
                    <TableCell className="pl-4 text-sm">
                      <span className="inline-flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {e.entity}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {title}
                    </TableCell>
                    <TableCell className="text-right pr-4 text-sm font-semibold text-foreground">
                      {e.count}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
