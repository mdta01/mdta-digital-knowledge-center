"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  File,
  Trash2,
  Pencil,
  Check,
  X,
  Upload,
  Loader2,
  LayoutGrid,
  List,
  Search,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiFetch, formatFileSize, formatDateTime, useDebounced } from "@/components/admin/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string | null;
  createdAt: string;
}

interface MediaManagerProps {
  initialUploads: UploadItem[];
  initialTotal: number;
  initialStorageUsed: number;
}

interface ListResponse {
  data: UploadItem[];
  total: number;
  page: number;
  pageSize: number;
}

const CATEGORY_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "image", label: "Gambar" },
  { value: "cover", label: "Cover" },
  { value: "pdf", label: "PDF" },
  { value: "epub", label: "EPUB" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "document", label: "Dokumen" },
];

const UPLOAD_FOLDERS = [
  { value: "covers", label: "Covers" },
  { value: "pdfs", label: "PDFs" },
  { value: "images", label: "Images" },
  { value: "audio", label: "Audio" },
  { value: "documents", label: "Documents" },
];

function getCategoryFilter(mime: string, category: string | null): string {
  if (mime.startsWith("image/")) return "Gambar";
  if (mime === "application/pdf") return "PDF";
  if (mime === "application/epub+zip") return "EPUB";
  if (mime.startsWith("audio/")) return "Audio";
  if (mime.startsWith("video/")) return "Video";
  if (mime.includes("document") || mime.includes("word")) return "Dokumen";
  return category || "Lainnya";
}

function getFileIcon(mime: string, category: string | null) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime === "application/pdf") return FileText;
  if (mime === "application/epub+zip") return FileText;
  if (mime.startsWith("audio/")) return Music;
  if (mime.startsWith("video/")) return Film;
  return File;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "success" | "error";
}

export function MediaManager({ initialUploads, initialTotal, initialStorageUsed }: MediaManagerProps) {
  const qc = useQueryClient();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [category, setCategory] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search, 350);
  const [page, setPage] = React.useState(1);
  const pageSize = 30;
  const [storageUsed, setStorageUsed] = React.useState(initialStorageUsed);

  const [uploads, setUploads] = React.useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState("images");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [renameTarget, setRenameTarget] = React.useState<UploadItem | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<UploadItem | null>(null);

  React.useEffect(() => setPage(1), [category, debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery<ListResponse>({
    queryKey: ["admin", "media", page, category, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (category !== "all") params.set("category", category);
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiFetch<ListResponse>(`/api/admin/media?${params}`);
    },
    initialData: { data: initialUploads, total: initialTotal, page: 1, pageSize },
    placeholderData: (prev) => prev,
  });

  const totalPages = Math.max(Math.ceil((data?.total ?? 0) / pageSize), 1);

  const handleUpload = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;

    const newUploads: UploadProgress[] = arr.map((f) => ({
      filename: f.name,
      progress: 0,
      status: "uploading",
    }));
    setUploads((prev) => [...newUploads, ...prev]);

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", "image");
        fd.append("folder", uploadFolder);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/media");
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setUploads((prev) => {
                const next = [...prev];
                const idx = next.findIndex(
                  (u, idx2) => idx2 === i && u.filename === file.name && u.status === "uploading"
                );
                if (idx >= 0) next[idx] = { ...next[idx], progress: pct };
                return next;
              });
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const resp = JSON.parse(xhr.responseText) as UploadItem;
                setStorageUsed((s) => s + resp.size);
                setUploads((prev) => {
                  const next = [...prev];
                  const idx = next.findIndex(
                    (u, idx2) => idx2 === i && u.filename === file.name && u.status === "uploading"
                  );
                  if (idx >= 0) next[idx] = { ...next[idx], progress: 100, status: "success" };
                  return next;
                });
                resolve();
              } catch {
                reject(new Error("Invalid response"));
              }
            } else {
              try {
                const resp = JSON.parse(xhr.responseText);
                reject(new Error(resp?.error || `Upload gagal (${xhr.status})`));
              } catch {
                reject(new Error(`Upload gagal (${xhr.status})`));
              }
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.send(fd);
        });
      } catch (e) {
        setUploads((prev) => {
          const next = [...prev];
          const idx = next.findIndex(
            (u, idx2) => idx2 === i && u.filename === file.name && u.status === "uploading"
          );
          if (idx >= 0) next[idx] = { ...next[idx], status: "error" };
          return next;
        });
        toast.error(e instanceof Error ? e.message : "Upload gagal");
      }
    }

    qc.invalidateQueries({ queryKey: ["admin", "media"] });
    setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.status === "uploading"));
    }, 2000);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      void handleUpload(e.dataTransfer.files);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void handleUpload(e.target.files);
      e.target.value = "";
    }
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    try {
      await apiFetch(`/api/admin/media/${renameTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ originalName: renameValue }),
      });
      toast.success("File berhasil diubah namanya");
      setRenameTarget(null);
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengubah nama");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/admin/media/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("File berhasil dihapus");
      setStorageUsed((s) => Math.max(0, s - deleteTarget.size));
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus file");
    }
  };

  const items = data?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" /> Media Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola file unggahan: gambar, dokumen, audio, video · {formatFileSize(storageUsed)} digunakan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={uploadFolder} onValueChange={setUploadFolder}>
            <SelectTrigger className="w-[140px] rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UPLOAD_FOLDERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-full border border-border/60 bg-background">
            <Button
              type="button"
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
              className="rounded-l-full rounded-r-none"
              aria-label="Tampilan grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
              className="rounded-r-full rounded-l-none"
              aria-label="Tampilan list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-3xl border-2 border-dashed transition-all p-8 mb-6 text-center cursor-pointer",
          dragActive
            ? "border-primary bg-primary/10"
            : "border-border/60 bg-secondary/30 hover:bg-secondary/50"
        )}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFileInput}
          aria-label="Pilih file untuk diunggah"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 grid place-items-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Seret & lepas file di sini, atau klik untuk memilih
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Folder: <span className="font-medium text-foreground">{uploadFolder}</span> · Maks 25MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploads.map((u, i) => (
            <div
              key={`${u.filename}-${i}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/60"
            >
              <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary/10 text-primary shrink-0">
                {u.status === "uploading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : u.status === "success" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{u.filename}</div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      u.status === "error" ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {u.status === "uploading" ? `${u.progress}%` : u.status === "success" ? "Selesai" : "Gagal"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama file…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTERS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 && uploads.length === 0 ? (
        <Card className="glass rounded-3xl border-border/60">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-secondary/60 grid place-items-center mb-4">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Belum ada file. Unggah file pertama Anda menggunakan zona unggah di atas.
            </p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {items.map((item, i) => {
            const Icon = getFileIcon(item.mimeType, item.category);
            const isImage = item.mimeType.startsWith("image/");
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Card className="border-border/60 hover:shadow-md transition-all overflow-hidden group">
                  <div className="aspect-square bg-secondary/40 grid place-items-center overflow-hidden relative">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Icon className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameTarget(item);
                          setRenameValue(item.originalName);
                        }}
                        aria-label="Ubah nama"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="text-xs font-medium text-foreground truncate" title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{getCategoryFilter(item.mimeType, item.category)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="glass rounded-3xl border-border/60 overflow-hidden">
          <div className="divide-y divide-border/60">
            {items.map((item, i) => {
              const Icon = getFileIcon(item.mimeType, item.category);
              const isImage = item.mimeType.startsWith("image/");
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-secondary/40 grid place-items-center shrink-0">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.originalName} className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{item.originalName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        {getCategoryFilter(item.mimeType, item.category)}
                      </Badge>
                      {formatFileSize(item.size)} · {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Lihat
                  </a>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full shrink-0"
                    onClick={() => {
                      setRenameTarget(item);
                      setRenameValue(item.originalName);
                    }}
                    aria-label="Ubah nama"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-muted-foreground">
            {isFetching ? "Memuat…" : `${data?.total ?? 0} file`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg"
            >
              Sebelumnya
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Hal. {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Nama File</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Nama file baru"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Batal
            </Button>
            <Button onClick={handleRename}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus File"
        description={`Yakin ingin menghapus "${deleteTarget?.originalName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
