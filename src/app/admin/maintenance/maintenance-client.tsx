"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceSchema } from "@/lib/validators";
import { z } from "zod";
import {
  Wrench,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { apiFetch } from "@/components/admin/utils";
import { motion } from "framer-motion";

type FormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceClientProps {
  initial: {
    enabled: boolean;
    message: string;
    start: string;
    end: string;
    whitelistedIps: string;
  };
}

export function MaintenanceClient({ initial }: MaintenanceClientProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      enabled: initial.enabled,
      message: initial.message || "",
      startTime: initial.start || "",
      endTime: initial.end || "",
      whitelistedIps: initial.whitelistedIps || "",
    },
  });

  const enabled = watch("enabled");
  const message = watch("message");

  const onSubmit = async (data: FormValues) => {
    try {
      await apiFetch("/api/admin/maintenance", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Pengaturan maintenance disimpan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" /> Maintenance Mode
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aktifkan mode maintenance untuk menampilkan halaman statis kepada pengunjung.
        </p>
      </div>

      {/* Status indicator */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Alert
          variant={enabled ? "destructive" : "default"}
          className="mb-6 rounded-2xl"
        >
          <div className="flex items-center gap-2">
            {enabled ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            <AlertTitle>
              {enabled ? "Maintenance Mode AKTIF" : "Sistem Beroperasi Normal"}
            </AlertTitle>
          </div>
          <AlertDescription>
            {enabled
              ? "Pengunjung akan melihat halaman maintenance (kecuali IP yang di-whitelist)."
              : "Situs berjalan normal untuk semua pengunjung."}
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Konfigurasi</CardTitle>
              <CardDescription>Atur status dan pesan maintenance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-secondary/50 border border-border/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 grid place-items-center">
                    <Wrench className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <Label htmlFor="maintenance-enabled" className="text-sm font-medium cursor-pointer">
                      Aktifkan Maintenance Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Aktifkan untuk memblokir akses publik.
                    </p>
                  </div>
                </div>
                <Switch
                  id="maintenance-enabled"
                  checked={enabled}
                  onCheckedChange={(v) => setValue("enabled", v, { shouldValidate: true })}
                />
              </div>

              <div>
                <Label htmlFor="maintenance-message">Pesan Maintenance</Label>
                <Textarea
                  id="maintenance-message"
                  {...register("message")}
                  placeholder="Situs sedang dalam pemeliharaan. Silakan kembali nanti."
                  className="mt-1.5 min-h-[100px]"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pesan ini akan ditampilkan kepada pengunjung saat mode maintenance aktif.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenance-start">Waktu Mulai (opsional)</Label>
                  <Input
                    id="maintenance-start"
                    type="datetime-local"
                    {...register("startTime")}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance-end">Waktu Selesai (opsional)</Label>
                  <Input
                    id="maintenance-end"
                    type="datetime-local"
                    {...register("endTime")}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maintenance-ips">Whitelisted IPs</Label>
                <Input
                  id="maintenance-ips"
                  {...register("whitelistedIps")}
                  placeholder="192.168.1.1, 10.0.0.1"
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pisahkan dengan koma. IP ini akan tetap bisa mengakses situs saat maintenance aktif.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="rounded-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Simpan
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Pratinjau Halaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-2xl border border-border/60 bg-secondary/30 p-6 text-center min-h-[200px] flex flex-col items-center justify-center gap-3"
                style={{
                  background: enabled
                    ? "linear-gradient(135deg, rgba(217,119,6,0.1), rgba(190,18,60,0.08))"
                    : "linear-gradient(135deg, rgba(5,150,105,0.08), rgba(212,175,55,0.06))",
                }}
              >
                <div className="h-14 w-14 rounded-2xl bg-background/80 grid place-items-center">
                  {enabled ? (
                    <Wrench className="h-7 w-7 text-amber-600" />
                  ) : (
                    <Globe className="h-7 w-7 text-emerald-600" />
                  )}
                </div>
                <Badge variant="secondary" className={enabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}>
                  {enabled ? "Maintenance Aktif" : "Operasional"}
                </Badge>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  {message || "Situs sedang dalam pemeliharaan. Silakan kembali nanti."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base">Status Saat Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className={enabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}>
                  {enabled ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              {initial.start && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mulai</span>
                  <span className="font-medium text-foreground">{initial.start}</span>
                </div>
              )}
              {initial.end && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selesai</span>
                  <span className="font-medium text-foreground">{initial.end}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Whitelist</span>
                <span className="font-medium text-foreground">
                  {initial.whitelistedIps ? `${initial.whitelistedIps.split(",").filter(Boolean).length} IP` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
