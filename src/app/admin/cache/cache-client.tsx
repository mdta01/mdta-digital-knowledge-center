"use client";
import * as React from "react";
import {
  Database,
  Image as ImageIcon,
  Search,
  Loader2,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/components/admin/utils";
import { motion } from "framer-motion";

interface ActionState {
  loading: boolean;
  result?: string;
}

export function CacheClient() {
  const [image, setImage] = React.useState<ActionState>({ loading: false });
  const [search, setSearch] = React.useState<ActionState>({ loading: false });
  const [optimize, setOptimize] = React.useState<ActionState>({ loading: false });

  const run = async (
    endpoint: string,
    setter: React.Dispatch<React.SetStateAction<ActionState>>,
    successMsg: string,
    resultKey?: string
  ) => {
    setter({ loading: true });
    try {
      const res = await apiFetch<Record<string, unknown>>(endpoint, { method: "POST" });
      const detail = resultKey ? String(res[resultKey] ?? "") : "";
      setter({ loading: false, result: detail });
      toast.success(successMsg);
    } catch (e) {
      setter({ loading: false });
      toast.error(e instanceof Error ? e.message : "Operasi gagal");
    }
  };

  const actions = [
    {
      key: "image",
      icon: ImageIcon,
      title: "Clear Image Cache",
      description: "Bersihkan cache gambar yang tersimpan. Berguna setelah mengganti logo, favicon, atau gambar lain.",
      buttonLabel: "Bersihkan Cache",
      state: image,
      onClick: () => run("/api/admin/cache/image", setImage, "Cache gambar dibersihkan", "cleared"),
    },
    {
      key: "search",
      icon: Search,
      title: "Rebuild Search Index",
      description: "Bangun ulang indeks pencarian untuk memastikan hasil pencarian selalu terbaru.",
      buttonLabel: "Bangun Ulang",
      state: search,
      onClick: () => run("/api/admin/cache/search-index", setSearch, "Indeks pencarian dibangun ulang", "rebuilt"),
    },
    {
      key: "optimize",
      icon: Database,
      title: "Optimize Database",
      description: "Jalankan PRAGMA optimize pada database SQLite untuk meningkatkan performa query.",
      buttonLabel: "Optimasi",
      state: optimize,
      onClick: () => run("/api/admin/cache/optimize", setOptimize, "Database dioptimasi", "optimized"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" /> Cache &amp; Optimasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Alat pemeliharaan sistem untuk cache, indeks pencarian, dan database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((a, i) => {
          const Icon = a.icon;
          const state = a.state;
          return (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="glass rounded-3xl border-border/60 h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-base">{a.title}</CardTitle>
                  <CardDescription className="text-xs">{a.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-2">
                  <Button
                    onClick={a.onClick}
                    disabled={state.loading}
                    className="w-full rounded-full"
                  >
                    {state.loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Memproses…
                      </>
                    ) : (
                      <>
                        <Wrench className="h-4 w-4" /> {a.buttonLabel}
                      </>
                    )}
                  </Button>
                  {state.result !== undefined && !state.loading && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300 justify-center">
                      <CheckCircle2 className="h-3 w-3" /> Selesai
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
