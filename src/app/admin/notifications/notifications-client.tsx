"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiFetch, formatDateTime } from "@/components/admin/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  level: string;
  isRead: boolean;
  createdAt: string;
  metadata?: string | null;
}

interface ListResponse {
  data: NotificationItem[];
  total: number;
  unread: number;
}

const LEVEL_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  info: { icon: Info, color: "text-sky-600 dark:text-sky-300", bg: "bg-sky-500/15" },
  success: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-300", bg: "bg-emerald-500/15" },
  warning: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-300", bg: "bg-amber-500/15" },
  error: { icon: XCircle, color: "text-rose-600 dark:text-rose-300", bg: "bg-rose-500/15" },
};

export function NotificationsClient({ initial }: { initial: ListResponse }) {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "notifications", filter],
    queryFn: () => {
      const params = new URLSearchParams({ page: "1", pageSize: "100" });
      if (filter === "unread") params.set("isRead", "false");
      return apiFetch<ListResponse>(`/api/admin/notifications?${params}`);
    },
    initialData: initial,
    placeholderData: (prev) => prev,
  });

  const items = data?.data ?? [];
  const unread = data?.unread ?? 0;

  const markAllRead = async () => {
    try {
      await apiFetch("/api/admin/notifications/mark-all-read", { method: "POST" });
      toast.success("Semua notifikasi ditandai dibaca");
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menandai notifikasi");
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/api/admin/notifications/${id}`, { method: "PATCH" });
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/admin/notifications/${deleteId}`, { method: "DELETE" });
      toast.success("Notifikasi dihapus");
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifikasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unread > 0 ? `${unread} notifikasi belum dibaca` : "Tidak ada notifikasi baru"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-border/60 bg-background p-1">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              Semua
            </Button>
            <Button
              variant={filter === "unread" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="rounded-full"
            >
              Belum Dibaca
              {unread > 0 && (
                <Badge variant="secondary" className="ml-1.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] py-0 px-1.5">
                  {unread}
                </Badge>
              )}
            </Button>
          </div>
          <Button
            onClick={markAllRead}
            disabled={unread === 0}
            variant="outline"
            className="rounded-full"
          >
            <CheckCheck className="h-4 w-4" /> Tandai Semua Dibaca
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="glass rounded-3xl border-border/60">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-secondary/60 grid place-items-center mb-4">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {filter === "unread" ? "Tidak ada notifikasi belum dibaca." : "Belum ada notifikasi."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n, i) => {
            const meta = LEVEL_META[n.level] || LEVEL_META.info;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    "border-border/60 transition-all hover:shadow-sm cursor-pointer",
                    !n.isRead && "border-primary/40 bg-primary/5"
                  )}
                  onClick={() => !n.isRead && markRead(n.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-2xl grid place-items-center shrink-0", meta.bg)}>
                      <Icon className={cn("h-5 w-5", meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{n.title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {n.type}
                        </Badge>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" aria-label="Belum dibaca" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <div className="text-[11px] text-muted-foreground/80 mt-1.5">
                        {formatDateTime(n.createdAt)}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(n.id);
                      }}
                      aria-label="Hapus notifikasi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus Notifikasi"
        description="Yakin ingin menghapus notifikasi ini?"
        confirmLabel="Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
