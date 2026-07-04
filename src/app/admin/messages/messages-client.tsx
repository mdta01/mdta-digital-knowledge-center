"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Clock,
  Inbox,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { apiFetch, formatDateTime } from "@/components/admin/utils";
import { toast } from "sonner";

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ListResponse {
  data: Message[];
  total: number;
}

export function MessagesClient({ initialData }: { initialData: ListResponse }) {
  const qc = useQueryClient();
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "messages", filter],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "50" });
      if (filter === "unread") params.set("isRead", "false");
      if (filter === "read") params.set("isRead", "true");
      return apiFetch<ListResponse>(`/api/admin/messages?${params}`);
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<Message | null>(null);

  const markAsRead = async (m: Message) => {
    try {
      await apiFetch(`/api/admin/messages/${m.id}`, { method: "PATCH" });
      toast.success("Pesan ditandai sebagai dibaca");
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui pesan");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch(`/api/admin/messages/${deleting.id}`, { method: "DELETE" });
      toast.success("Pesan berhasil dihapus");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus pesan");
    }
  };

  const unreadCount = data?.data.filter((m) => !m.isRead).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" /> Pesan Masuk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? (
              <>
                Anda memiliki{" "}
                <span className="font-semibold text-primary">{unreadCount} pesan belum dibaca</span>.
              </>
            ) : (
              "Tidak ada pesan baru."
            )}
          </p>
        </div>
        <Select value={filter} onValueChange={(v: "all" | "unread" | "read") => setFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Pesan</SelectItem>
            <SelectItem value="unread">Belum Dibaca</SelectItem>
            <SelectItem value="read">Sudah Dibaca</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card className="glass rounded-3xl border-border/60 p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : data && data.data.length > 0 ? (
          <div className="divide-y divide-border/60">
            {data.data.map((m) => {
              const isOpen = expanded === m.id;
              return (
                <div
                  key={m.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    !m.isRead ? "bg-primary/5" : "hover:bg-secondary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 mt-0.5 shrink-0">
                      <AvatarFallback
                        className={
                          m.isRead
                            ? "bg-secondary text-muted-foreground"
                            : "bg-primary/15 text-primary"
                        }
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left"
                      onClick={() => {
                        setExpanded(isOpen ? null : m.id);
                        if (!m.isRead) void markAsRead(m);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {!m.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Belum dibaca" />
                        )}
                        <span className="font-medium text-foreground truncate">
                          {m.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          &lt;{m.email}&gt;
                        </span>
                        <span className="ml-auto text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(m.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {m.subject}
                        </span>
                        {!m.isRead && (
                          <Badge variant="secondary" className="bg-primary/15 text-primary">
                            Baru
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {m.message}
                      </p>
                    </button>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!m.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          onClick={() => void markAsRead(m)}
                          aria-label="Tandai sebagai dibaca"
                          title="Tandai sudah dibaca"
                        >
                          <MailOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(m)}
                        aria-label="Hapus pesan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setExpanded(isOpen ? null : m.id)}
                        aria-label={isOpen ? "Tutup" : "Buka"}
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-border/60 pl-0 sm:pl-[52px]">
                      <div className="rounded-2xl bg-secondary/40 p-4">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                          {m.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {m.phone}
                            </span>
                          )}
                          <a
                            href={`mailto:${m.email}`}
                            className="inline-flex items-center gap-1 hover:text-primary"
                          >
                            <Mail className="h-3 w-3" /> {m.email}
                          </a>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                          {m.message}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" className="rounded-full">
                          <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>
                            <Mail className="h-4 w-4" /> Balas via Email
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-destructive hover:text-destructive"
                          onClick={() => setDeleting(m)}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary/60 grid place-items-center mb-4">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Tidak ada pesan {filter === "unread" ? "yang belum dibaca" : filter === "read" ? "yang sudah dibaca" : ""}.
            </p>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Hapus Pesan"
        description={
          <>
            Hapus pesan dari{" "}
            <span className="font-semibold text-foreground">{deleting?.name}</span>?
          </>
        }
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </div>
  );
}
