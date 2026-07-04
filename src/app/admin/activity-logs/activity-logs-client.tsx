"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  FileEdit,
  Trash2,
  LogIn,
  LogOut,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { apiFetch, formatDateTime, useDebounced } from "@/components/admin/utils";

interface LogItem {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface ListResponse {
  data: LogItem[];
  total: number;
}

const ACTION_BADGES: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  CREATE: { label: "Buat", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", icon: FileEdit },
  UPDATE: { label: "Ubah", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300", icon: FileEdit },
  DELETE: { label: "Hapus", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300", icon: Trash2 },
  LOGIN: { label: "Masuk", className: "bg-violet-500/15 text-violet-700 dark:text-violet-300", icon: LogIn },
  LOGOUT: { label: "Keluar", className: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300", icon: LogOut },
  PUBLISH: { label: "Publikasi", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", icon: Star },
};

const ENTITY_OPTIONS = [
  "Book",
  "Author",
  "Category",
  "Page",
  "User",
  "Setting",
  "Upload",
  "Tag",
  "ContactMessage",
];

export function ActivityLogsClient({ initialData }: { initialData: ListResponse }) {
  const [entity, setEntity] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search, 350);
  const pageSize = 25;

  React.useEffect(() => setPage(1), [entity, debouncedSearch]);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "activity-logs", page, entity, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (entity !== "all") params.set("entity", entity);
      const res = await apiFetch<ListResponse>(`/api/admin/activity-logs?${params}`);
      // Client-side filter by user search (the API doesn't support search param)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return {
          ...res,
          data: res.data.filter(
            (l) =>
              l.user?.name?.toLowerCase().includes(q) ||
              l.user?.email?.toLowerCase().includes(q)
          ),
        };
      }
      return res;
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const filtered = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <DataTableShell
      title="Activity Log"
      description="Riwayat aktivitas admin di sistem."
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Cari nama atau email pengguna…"
      hideSearch={false}
      loading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={Math.max(Math.ceil(total / pageSize), 1)}
      onPageChange={setPage}
      emptyMessage="Tidak ada log aktivitas yang sesuai dengan filter."
      filters={
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-full">
            <SelectValue placeholder="Semua entitas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Entitas</SelectItem>
            {ENTITY_OPTIONS.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            <TableHead className="pl-4">Pengguna</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Entitas</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="pr-4">Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((log) => {
            const action = ACTION_BADGES[log.action] ?? {
              label: log.action,
              className: "bg-secondary text-secondary-foreground",
              icon: Activity,
            };
            const ActionIcon = action.icon;
            return (
              <TableRow key={log.id} className="hover:bg-secondary/30">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {log.user?.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {log.user?.name ?? "Unknown"}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {log.user?.email ?? "—"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={action.className}>
                    <ActionIcon className="h-3 w-3" />
                    {action.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-foreground/80">
                  {log.entity}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {log.entityId ? `#${log.entityId.slice(-6)}` : "—"}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {log.ipAddress ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground pr-4">
                  {formatDateTime(log.createdAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
