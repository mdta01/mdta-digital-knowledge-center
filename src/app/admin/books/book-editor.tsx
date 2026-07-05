"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  FileText,
  Tags,
  Star,
  Search as SearchIcon,
  Upload,
  Trash2,
  File as FileIcon,
  Eye,
  Archive,
  PencilLine,
  History,
  RotateCcw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { UploadButton } from "@/components/admin/upload-button";
import { apiFetch, formatFileSize, formatDateTime } from "@/components/admin/utils";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof createBookSchema>;

export interface BookFile {
  id?: string;
  bookId?: string;
  format: string;
  url: string;
  filename: string;
  size?: number | null;
  createdAt?: string;
}

export interface BookTag {
  id: string;
  name: string;
  slug: string;
}

export interface BookData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  coverImage?: string | null;
  pages?: number | null;
  language: string;
  isbn?: string | null;
  publishedYear?: number | null;
  publisher?: string | null;
  status: string;
  featured: boolean;
  views: number;
  downloads: number;
  toc?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  categoryId: string;
  authorId: string;
  category?: { id: string; name: string; slug: string } | null;
  author?: { id: string; name: string; slug: string } | null;
  tags?: BookTag[];
  files?: BookFile[];
}

export interface OptionItem {
  id: string;
  name: string;
  slug?: string;
}

interface BookEditorProps {
  book?: BookData | null;
  categories: OptionItem[];
  authors: OptionItem[];
  mode: "create" | "edit";
}

const LANGUAGE_OPTIONS = [
  { value: "id", label: "Indonesia" },
  { value: "ar", label: "Arab" },
  { value: "en", label: "English" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", icon: PencilLine, color: "bg-amber-500/15 text-amber-700" },
  { value: "PUBLISHED", label: "Published", icon: Eye, color: "bg-emerald-500/15 text-emerald-700" },
  { value: "ARCHIVED", label: "Archived", icon: Archive, color: "bg-zinc-500/15 text-zinc-700" },
];

export function BookEditor({ book, categories, authors, mode }: BookEditorProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      title: book?.title ?? "",
      slug: book?.slug ?? "",
      description: book?.description ?? "",
      content: book?.content ?? "",
      coverImage: book?.coverImage ?? "",
      pages: book?.pages ?? undefined,
      language: (book?.language as "id" | "ar" | "en") ?? "id",
      isbn: book?.isbn ?? "",
      publishedYear: book?.publishedYear ?? undefined,
      publisher: book?.publisher ?? "",
      status: (book?.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
      featured: book?.featured ?? false,
      toc: book?.toc ?? "",
      seoTitle: book?.seoTitle ?? "",
      seoDescription: book?.seoDescription ?? "",
      seoKeywords: book?.seoKeywords ?? "",
      categoryId: book?.categoryId ?? "",
      authorId: book?.authorId ?? "",
      tagIds: book?.tags?.map((t) => t.id) ?? [],
    },
  });

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const statusValue = watch("status");
  const featuredValue = watch("featured");
  const coverImageValue = watch("coverImage");
  const categoryIdValue = watch("categoryId");
  const authorIdValue = watch("authorId");
  const tagIdsValue = watch("tagIds") ?? [];
  const contentValue = watch("content");
  const languageValue = watch("language");
  const slugTouched = React.useRef(!!book?.slug);

  // --- Auto-save state ---
  const [autoSaveTime, setAutoSaveTime] = React.useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = React.useState(false);
  const formDirtyRef = React.useRef(false);
  const lastSaveTimeRef = React.useRef<Date | null>(null);
  const lastRevisionTimeRef = React.useRef<Date | null>(null);

  // Track form dirty state via watch subscription
  React.useEffect(() => {
    const sub = watch(() => {
      formDirtyRef.current = true;
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // Auto-save every 30s if dirty + in edit mode + has title
  React.useEffect(() => {
    if (!isEdit || !book) return;
    const interval = setInterval(async () => {
      if (!formDirtyRef.current) return;
      const values = watch();
      // Don't auto-save if status is DRAFT and title is empty
      if (values.status === "DRAFT" && !values.title?.trim()) return;
      setAutoSaving(true);
      try {
        const payload = {
          ...values,
          description: values.description || null,
          content: values.content || null,
          coverImage: values.coverImage || "",
          isbn: values.isbn || null,
          publisher: values.publisher || null,
          toc: values.toc || null,
          seoTitle: values.seoTitle || null,
          seoDescription: values.seoDescription || null,
          seoKeywords: values.seoKeywords || null,
          pages: values.pages ?? null,
          publishedYear: values.publishedYear ?? null,
        };
        await apiFetch(`/api/admin/books/${book.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        formDirtyRef.current = false;
        lastSaveTimeRef.current = new Date();
        setAutoSaveTime(new Date());
      } catch {
        // silent fail on auto-save
      } finally {
        setAutoSaving(false);
      }
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isEdit, book, watch]);

  // Auto-save revision snapshot every 5 minutes
  React.useEffect(() => {
    if (!isEdit || !book) return;
    const interval = setInterval(async () => {
      const values = watch();
      if (!values.title?.trim()) return;
      try {
        await apiFetch(`/api/admin/books/${book.id}/revisions`, {
          method: "POST",
          body: JSON.stringify({
            content: values.content || "",
            title: values.title,
            message: "Auto-saved revision",
          }),
        });
        lastRevisionTimeRef.current = new Date();
      } catch {
        // silent fail
      }
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [isEdit, book, watch]);

  React.useEffect(() => {
    if (!slugTouched.current && titleValue) {
      setValue("slug", slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, setValue]);

  // --- Tags state (comma-separated input that maps to tagIds) ---
  const [tagsInput, setTagsInput] = React.useState(
    book?.tags?.map((t) => t.name).join(", ") ?? ""
  );
  const [availableTags, setAvailableTags] = React.useState<BookTag[]>(book?.tags ?? []);

  // Fetch existing tags on mount
  React.useEffect(() => {
    apiFetch<BookTag[]>("/api/admin/tags")
      .then((tags) => setAvailableTags(tags))
      .catch(() => {
        // silent fail — tags are optional
      });
  }, []);

  // --- Local book files state (newly uploaded, not yet persisted) ---
  const [localFiles, setLocalFiles] = React.useState<BookFile[]>(book?.files ?? []);

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    // Parse comma-separated names and resolve to IDs (creating new ones lazily on save)
    const names = value
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    // For now, store names locally; resolve to IDs at submit time
  };

  const resolveTagIds = async (): Promise<string[]> => {
    const names = tagsInput
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return [];

    // Build a lookup from available tags
    const byName = new Map(availableTags.map((t) => [t.name.toLowerCase(), t]));
    const ids: string[] = [];
    for (const name of names) {
      const existing = byName.get(name.toLowerCase());
      if (existing) {
        ids.push(existing.id);
      } else {
        // Create new tag via API
        try {
          const created = await apiFetch<BookTag>("/api/admin/tags", {
            method: "POST",
            body: JSON.stringify({ name, slug: slugify(name) }),
          });
          ids.push(created.id);
          setAvailableTags((prev) => [...prev, created]);
        } catch {
          // skip on failure
        }
      }
    }
    return ids;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Resolve tags from comma-separated input
      const tagIds = await resolveTagIds();
      const payload = {
        ...data,
        description: data.description || null,
        content: data.content || null,
        coverImage: data.coverImage || "",
        isbn: data.isbn || null,
        publisher: data.publisher || null,
        toc: data.toc || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        pages: data.pages ?? null,
        publishedYear: data.publishedYear ?? null,
        tagIds,
      };

      if (isEdit && book) {
        await apiFetch(`/api/admin/books/${book.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Buku berhasil diperbarui");
      } else {
        const created = await apiFetch<{ id: string }>("/api/admin/books", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Buku berhasil dibuat");
        router.push(`/admin/books/${created.id}`);
        return;
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan buku");
    }
  };

  const handleFileUploaded = (
    format: string,
    url: string,
    file: { filename: string; originalName: string; size: number; mimeType: string }
  ) => {
    setLocalFiles((prev) => [
      ...prev,
      {
        format,
        url,
        filename: file.originalName,
        size: file.size,
      },
    ]);
  };

  const removeLocalFile = (idx: number) => {
    setLocalFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const StatusIcon = STATUS_OPTIONS.find((s) => s.value === statusValue)?.icon ?? Eye;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/books"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar buku
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {isEdit ? "Edit Buku" : "Buku Baru"}
          </h1>
          {isEdit && book && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              ID: {book.id} · {book.views} dilihat · {book.downloads} unduhan
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={STATUS_OPTIONS.find((s) => s.value === statusValue)?.color}>
            <StatusIcon className="h-3 w-3" />
            {STATUS_OPTIONS.find((s) => s.value === statusValue)?.label}
          </Badge>
          {featuredValue && (
            <Badge variant="secondary" className="bg-gold/20 text-amber-700 dark:text-amber-300">
              <Star className="h-3 w-3 fill-current" /> Featured
            </Badge>
          )}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-full"
          >
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
          {isEdit && (
            <div className="hidden sm:flex items-center text-[11px] text-muted-foreground gap-1.5 ml-2">
              {autoSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan otomatis…
                </>
              ) : autoSaveTime ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Tersimpan otomatis {autoSaveTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" /> Auto-save aktif
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto h-auto py-1 rounded-2xl">
          <TabsTrigger value="content" className="rounded-xl gap-2">
            <BookOpen className="h-4 w-4" /> Konten
          </TabsTrigger>
          <TabsTrigger value="files" className="rounded-xl gap-2">
            <FileText className="h-4 w-4" /> File Buku
          </TabsTrigger>
          <TabsTrigger value="meta" className="rounded-xl gap-2">
            <Tags className="h-4 w-4" /> Kategori & Penulis
          </TabsTrigger>
          <TabsTrigger value="status" className="rounded-xl gap-2">
            <Star className="h-4 w-4" /> Status
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl gap-2">
            <SearchIcon className="h-4 w-4" /> SEO
          </TabsTrigger>
          {isEdit && (
            <TabsTrigger value="revisions" className="rounded-xl gap-2">
              <History className="h-4 w-4" /> Revisi
            </TabsTrigger>
          )}
        </TabsList>

        {/* Konten */}
        <TabsContent value="content" className="space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Informasi Buku</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="book-title">Judul *</Label>
                <Input
                  id="book-title"
                  {...register("title")}
                  placeholder="contoh: Ihya Ulumuddin"
                  className="mt-1.5"
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="book-slug">Slug</Label>
                  <Input
                    id="book-slug"
                    {...register("slug", {
                      onChange: () => {
                        slugTouched.current = true;
                      },
                    })}
                    placeholder="ihya-ulumuddin"
                    className="mt-1.5 font-mono text-sm"
                    aria-invalid={!!errors.slug}
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
                  )}
                  {!slugValue && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Otomatis dibuat dari judul
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="book-language">Bahasa</Label>
                  <Controller
                    control={control}
                    name="language"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="book-language" className="mt-1.5 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="book-description">Deskripsi</Label>
                <Textarea
                  id="book-description"
                  {...register("description")}
                  placeholder="Deskripsi singkat buku…"
                  className="mt-1.5 min-h-[100px]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="book-content">Konten Buku</Label>
                  <span className="text-[11px] text-muted-foreground">
                    {contentValue?.length || 0} karakter
                  </span>
                </div>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Mulai menulis konten buku… Gunakan toggle RTL & Mode Arab di kanan atas untuk penulisan kitab berbahasa Arab."
                      minHeight={520}
                    />
                  )}
                />
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <SearchIcon className="h-3 w-3" />
                  Editor mendukung: heading, bold/italic/underline, highlight,
                  warna teks, link, gambar, tabel, code block, video YouTube,
                  checklist, quote, RTL Arab, dan font Arab berkualitas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Cover & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="book-cover">Cover Buku</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="h-24 w-16 rounded-xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0 shadow-sm">
                    {coverImageValue ? (
                       
                      <img
                        src={coverImageValue}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <Input
                      id="book-cover"
                      {...register("coverImage")}
                      placeholder="/uploads/cover.jpg"
                    />
                    <UploadButton
                      category="cover"
                      accept="image/*"
                      label="Unggah Cover"
                      onUploaded={(url) =>
                        setValue("coverImage", url, { shouldValidate: true })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="book-pages">Halaman</Label>
                  <Input
                    id="book-pages"
                    type="number"
                    {...register("pages", {
                      setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                    })}
                    placeholder="320"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="book-year">Tahun Terbit</Label>
                  <Input
                    id="book-year"
                    type="number"
                    {...register("publishedYear", {
                      setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                    })}
                    placeholder="2020"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="book-isbn">ISBN</Label>
                  <Input
                    id="book-isbn"
                    {...register("isbn")}
                    placeholder="978-…"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="book-publisher">Penerbit</Label>
                  <Input
                    id="book-publisher"
                    {...register("publisher")}
                    placeholder="Nama penerbit"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="book-toc">Daftar Isi (JSON atau teks)</Label>
                <Textarea
                  id="book-toc"
                  {...register("toc")}
                  placeholder='[{"title":"Bab 1","page":1}]'
                  className="mt-1.5 min-h-[80px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Buku */}
        <TabsContent value="files">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> File Buku
              </CardTitle>
              <div className="flex items-center gap-2">
                <UploadButton
                  category="pdf"
                  accept="application/pdf"
                  label="Upload PDF"
                  onUploaded={(url, f) =>
                    f && handleFileUploaded("PDF", url, f)
                  }
                />
                <UploadButton
                  category="epub"
                  accept="application/epub+zip"
                  label="Upload EPUB"
                  onUploaded={(url, f) =>
                    f && handleFileUploaded("EPUB", url, f)
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {localFiles.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="h-14 w-14 rounded-2xl bg-secondary/60 grid place-items-center mb-4">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Belum ada file buku terlampir. Unggah file PDF atau EPUB
                    menggunakan tombol di atas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {localFiles.map((f, idx) => (
                    <div
                      key={`${f.url}-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/60"
                    >
                      <div className="h-10 w-10 rounded-xl grid place-items-center bg-primary/10 text-primary shrink-0">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {f.filename}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {f.format} · {formatFileSize(f.size)} ·{" "}
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary underline"
                          >
                            Lihat
                          </a>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {f.format}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeLocalFile(idx)}
                        aria-label="Hapus file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Catatan: file yang diunggah disimpan di repository uploads.
                    Penautan permanen ke buku akan tersedia setelah update API.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kategori & Penulis */}
        <TabsContent value="meta" className="space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Kategori & Penulis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="book-category">Kategori *</Label>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="book-category" className="mt-1.5 w-full">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.categoryId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="book-author">Penulis *</Label>
                  <Controller
                    control={control}
                    name="authorId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="book-author" className="mt-1.5 w-full">
                          <SelectValue placeholder="Pilih penulis" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.authorId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.authorId.message}
                    </p>
                  )}
                </div>
              </div>
              {(!categoryIdValue || !authorIdValue) && (
                <div className="flex flex-wrap gap-2">
                  {!categoryIdValue && (
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href="/admin/categories">+ Tambah Kategori</Link>
                    </Button>
                  )}
                  {!authorIdValue && (
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href="/admin/authors">+ Tambah Penulis</Link>
                    </Button>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="book-tags">Tag (pisahkan dengan koma)</Label>
                <Input
                  id="book-tags"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="fiqih, tasawuf, hadits"
                  className="mt-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tag baru akan dibuat otomatis saat menyimpan.
                </p>
                {availableTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {availableTags.slice(0, 12).map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          const names = tagsInput
                            .split(",")
                            .map((n) => n.trim())
                            .filter(Boolean);
                          if (!names.some((n) => n.toLowerCase() === t.name.toLowerCase())) {
                            const next = names.concat(t.name).join(", ");
                            setTagsInput(next);
                          }
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                      >
                        + {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status */}
        <TabsContent value="status">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Status & Visibilitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status Buku</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1.5 w-full sm:max-w-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => {
                          const I = s.icon;
                          return (
                            <SelectItem key={s.value} value={s.value}>
                              <span className="inline-flex items-center gap-2">
                                <I className="h-4 w-4" />
                                {s.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Draft: hanya terlihat admin · Published: terlihat publik · Archived: disembunyikan dari daftar utama.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/50 border border-border/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gold/15 grid place-items-center">
                    <Star className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <Label htmlFor="book-featured" className="text-sm font-medium cursor-pointer">
                      Buku Featured
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Tampilkan di bagian unggulan beranda.
                    </p>
                  </div>
                </div>
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Switch
                      id="book-featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Pengaturan SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="book-seo-title">SEO Title</Label>
                <Input
                  id="book-seo-title"
                  {...register("seoTitle")}
                  placeholder="Judul untuk search engine"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="book-seo-desc">SEO Description</Label>
                <Textarea
                  id="book-seo-desc"
                  {...register("seoDescription")}
                  placeholder="Deskripsi untuk search engine (max 300 karakter)"
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="book-seo-keywords">SEO Keywords</Label>
                <Input
                  id="book-seo-keywords"
                  {...register("seoKeywords")}
                  placeholder="kata kunci, dipisah, koma"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revisions */}
        {isEdit && book && (
          <TabsContent value="revisions">
            <RevisionsPanel bookId={book.id} onRestore={(content) => {
              setValue("content", content, { shouldValidate: true });
              formDirtyRef.current = true;
              toast.success("Konten dipulihkan dari revisi. Jangan lupa simpan perubahan.");
            }} />
          </TabsContent>
        )}
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="glass-strong rounded-full shadow-lg border border-border/60 p-1.5 pr-2 flex items-center gap-2">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> {isEdit ? "Perbarui Buku" : "Simpan Buku"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Revisions Panel ---
interface RevisionItem {
  id: string;
  title: string;
  content: string;
  message?: string | null;
  userId: string;
  createdAt: string;
}

function RevisionsPanel({
  bookId,
  onRestore,
}: {
  bookId: string;
  onRestore: (content: string) => void;
}) {
  const [revisions, setRevisions] = React.useState<RevisionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewing, setViewing] = React.useState<RevisionItem | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: RevisionItem[] }>(`/api/admin/revisions?bookId=${bookId}&limit=50`);
      setRevisions(res.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus revisi ini?")) return;
    try {
      await apiFetch(`/api/admin/revisions/${id}`, { method: "DELETE" });
      toast.success("Revisi dihapus");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  return (
    <Card className="glass rounded-3xl border-border/60">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Riwayat Revisi
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => void load()} className="rounded-full">
          Muat ulang
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : revisions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Belum ada revisi tersimpan. Revisi otomatis dibuat setiap 5 menit saat mengedit.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {revisions.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/60"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {r.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(r.createdAt)}
                  </div>
                  {r.message && (
                    <Badge variant="secondary" className="mt-1.5 text-[10px] py-0 px-1.5">
                      {r.message}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setViewing(r)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Lihat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      onRestore(r.content);
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => void handleDelete(r.id)}
                    aria-label="Hapus revisi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {viewing?.title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {viewing && formatDateTime(viewing.createdAt)}
              {viewing?.message && ` · ${viewing.message}`}
            </p>
          </DialogHeader>
          <div
            className="flex-1 overflow-y-auto prose prose-sm max-w-none p-4 rounded-2xl bg-secondary/30 border border-border/60"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: viewing?.content || "" }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Tutup
            </Button>
            <Button
              onClick={() => {
                if (viewing) {
                  onRestore(viewing.content);
                  setViewing(null);
                }
              }}
            >
              <RotateCcw className="h-4 w-4" /> Restore ke Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
