"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ShieldCheck, ShieldAlert, ShieldUser } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/components/admin/utils";

const createUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(120),
  name: z.string().min(1, "Nama wajib diisi").max(120),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).default("EDITOR"),
  avatar: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

const editSchema = createUserSchema.extend({
  password: z.string().min(6).max(120).optional().or(z.literal("")),
});

type CreateValues = z.infer<typeof createUserSchema>;
type EditValues = z.infer<typeof editSchema>;

export interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
}

interface UserFormProps {
  user?: UserItem | null;
  onSaved?: (u: UserItem) => void;
  onCancel?: () => void;
  /** Disable role field — for non-super admins */
  disableRole?: boolean;
}

export function UserForm({ user, onSaved, onCancel, disableRole }: UserFormProps) {
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(isEdit ? (editSchema as never) : createUserSchema) as never,
    defaultValues: {
      email: user?.email ?? "",
      password: "",
      name: user?.name ?? "",
      role: (user?.role as "SUPER_ADMIN" | "ADMIN" | "EDITOR") ?? "EDITOR",
      avatar: user?.avatar ?? "",
      isActive: user?.isActive ?? true,
    },
  });

  const roleValue = watch("role");
  const isActiveValue = watch("isActive");

  const onSubmit = async (data: CreateValues | EditValues) => {
    try {
      const payload: Record<string, unknown> = {
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar || "",
        isActive: data.isActive,
      };
      if (data.password) {
        payload.password = data.password;
      }
      if (isEdit && user) {
        const updated = await apiFetch<UserItem>(`/api/admin/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Pengguna berhasil diperbarui");
        onSaved?.(updated);
      } else {
        if (!data.password) {
          toast.error("Password wajib diisi untuk pengguna baru");
          return;
        }
        const created = await apiFetch<UserItem>("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Pengguna berhasil ditambahkan");
        onSaved?.(created);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengguna");
    }
  };

  const RoleIcon =
    roleValue === "SUPER_ADMIN"
      ? ShieldCheck
      : roleValue === "ADMIN"
        ? ShieldAlert
        : ShieldUser;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="user-name">Nama *</Label>
          <Input
            id="user-name"
            {...register("name")}
            placeholder="Nama lengkap"
            className="mt-1.5"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="user-email">Email *</Label>
          <Input
            id="user-email"
            type="email"
            {...register("email")}
            placeholder="admin@mdta-miftahululum.sch.id"
            className="mt-1.5"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="user-password">
            Password {isEdit ? "(kosongkan jika tidak diubah)" : "*"}
          </Label>
          <Input
            id="user-password"
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="mt-1.5"
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="user-role">Role</Label>
          <Select
            value={roleValue}
            onValueChange={(v: "SUPER_ADMIN" | "ADMIN" | "EDITOR") =>
              setValue("role", v, { shouldValidate: true })
            }
            disabled={disableRole}
          >
            <SelectTrigger id="user-role" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUPER_ADMIN">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold" />
                  Super Admin
                </span>
              </SelectItem>
              <SelectItem value="ADMIN">
                <span className="inline-flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Admin
                </span>
              </SelectItem>
              <SelectItem value="EDITOR">
                <span className="inline-flex items-center gap-2">
                  <ShieldUser className="h-4 w-4 text-muted-foreground" />
                  Editor
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {disableRole && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Hanya Super Admin yang dapat mengubah role.
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="user-avatar">Avatar (URL)</Label>
          <Input
            id="user-avatar"
            {...register("avatar")}
            placeholder="/uploads/avatar.jpg"
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between rounded-2xl bg-secondary/50 border border-border/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <RoleIcon className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="user-active" className="text-sm font-medium cursor-pointer">
                  Akun Aktif
                </Label>
                <p className="text-xs text-muted-foreground">
                  Pengguna non-aktif tidak dapat masuk ke sistem.
                </p>
              </div>
            </div>
            <Switch
              id="user-active"
              checked={isActiveValue}
              onCheckedChange={(v) => setValue("isActive", v, { shouldValidate: true })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-full"
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="rounded-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {isEdit ? "Perbarui" : "Simpan"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
