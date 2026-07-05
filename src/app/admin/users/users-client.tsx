"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ShieldUser,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { UserForm, type UserItem } from "./user-form";
import { apiFetch, formatDateTime, useDebounced } from "@/components/admin/utils";
import { toast } from "sonner";

interface ListResponse {
  data: UserItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const ROLE_BADGES: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    className: "bg-gold/20 text-amber-700 dark:text-amber-300 border-gold/30",
    icon: ShieldCheck,
  },
  ADMIN: {
    label: "Admin",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    icon: ShieldAlert,
  },
  EDITOR: {
    label: "Editor",
    className: "bg-secondary text-secondary-foreground",
    icon: ShieldUser,
  },
};

export function UsersClient({
  initialData,
  currentUserRole,
}: {
  initialData: ListResponse;
  currentUserRole: string;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search, 350);

  React.useEffect(() => setPage(1), [debouncedSearch]);

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin", "users", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiFetch<ListResponse>(`/api/admin/users?${params}`);
    },
    initialData,
    placeholderData: (prev) => prev,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserItem | null>(null);
  const [deleting, setDeleting] = React.useState<UserItem | null>(null);

  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";
  const canCreate = isSuperAdmin;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (u: UserItem) => {
    setEditing(u);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch(`/api/admin/users/${deleting.id}`, { method: "DELETE" });
      toast.success("Pengguna berhasil dihapus");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus pengguna");
    }
  };

  return (
    <>
      <DataTableShell
        title="Manajemen Admin"
        description="Kelola akun admin, editor, dan super admin."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama atau email…"
        actionLabel={canCreate ? "Tambah Admin" : undefined}
        onActionClick={canCreate ? openCreate : undefined}
        loading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 20}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="Belum ada pengguna terdaftar."
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="pl-4">Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Login Terakhir</TableHead>
              <TableHead className="text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((u) => {
              const role = ROLE_BADGES[u.role] ?? ROLE_BADGES.EDITOR;
              const RoleIcon = role.icon;
              return (
                <TableRow key={u.id} className="hover:bg-secondary/30">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={role.className}>
                      <RoleIcon className="h-3 w-3" />
                      {role.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4" /> Non-aktif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Belum pernah"}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => openEdit(u)}
                        aria-label="Edit pengguna"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleting(u)}
                          aria-label="Hapus pengguna"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataTableShell>

      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <ShieldUser className="h-5 w-5 text-primary" />
              {editing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui informasi pengguna."
                : "Lengkapi data pengguna baru."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editing}
            onSaved={handleSaved}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            disableRole={!isSuperAdmin}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Hapus Pengguna"
        description={
          <>
            Anda akan menghapus pengguna{" "}
            <span className="font-semibold text-foreground">{deleting?.name}</span> ({deleting?.email}).
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </>
  );
}
