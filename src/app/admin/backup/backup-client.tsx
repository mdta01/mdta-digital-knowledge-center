"use client";
import * as React from "react";
import {
  DatabaseBackup,
  Download,
  Upload,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  FileJson,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function BackupClient() {
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<Record<string, number> | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/backup/export");
      if (!res.ok) throw new Error("Gagal mengekspor database");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mdta-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup berhasil diunduh");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengekspor");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal mengimpor backup");
      }
      toast.success("Backup berhasil diimpor");
      setImportResult(data.counts as Record<string, number>);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "File backup tidak valid");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <DatabaseBackup className="h-6 w-6 text-primary" /> Backup &amp; Restore
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ekspor seluruh database ke file JSON, atau pulihkan dari backup sebelumnya.
        </p>
      </div>

      <Alert variant="destructive" className="mb-6 rounded-2xl">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Peringatan</AlertTitle>
        <AlertDescription>
          Import akan menimpa data existing. Pastikan untuk export terlebih dahulu sebelum melakukan import.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="glass rounded-3xl border-border/60 h-full">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" /> Export Database
              </CardTitle>
              <CardDescription>
                Unduh seluruh data (buku, penulis, kategori, halaman, pengaturan, dll) sebagai file JSON.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40">
                <FileJson className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  Format: <span className="font-mono text-foreground">mdta-backup-YYYY-MM-DD.json</span>
                </div>
              </div>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full rounded-full"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengekspor…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Export Sekarang
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Import */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="glass rounded-3xl border-border/60 h-full">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Import / Restore
              </CardTitle>
              <CardDescription>
                Pulihkan database dari file backup JSON. Semua data existing akan ditimpa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                variant="outline"
                className="w-full rounded-full"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengimpor…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Pilih File Backup
                  </>
                )}
              </Button>
              {importResult && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Import berhasil
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(importResult).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground capitalize">{k}</span>
                        <Badge variant="secondary" className="text-[10px]">{v}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Backup history note */}
      <Card className="glass rounded-3xl border-border/60 mt-6">
        <CardHeader>
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Riwayat Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Backup terakhir: <span className="font-medium text-foreground">Belum pernah</span>
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2">
            Catatan: Riwayat backup otomatis belum dilacak di database. Simpan file backup dengan baik di tempat aman.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
