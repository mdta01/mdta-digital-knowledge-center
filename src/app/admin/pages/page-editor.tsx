"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPageSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { apiFetch } from "@/components/admin/utils";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type FormValues = z.infer<typeof createPageSchema>;

export interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: string;
}

interface PageEditorProps {
  page?: PageData | null;
  mode: "create" | "edit";
}

export function PageEditor({ page, mode }: PageEditorProps) {
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
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      title: page?.title ?? "",
      slug: page?.slug ?? "",
      content: page?.content ?? "",
      excerpt: page?.excerpt ?? "",
      seoTitle: page?.seoTitle ?? "",
      seoDescription: page?.seoDescription ?? "",
      status: (page?.status as "DRAFT" | "PUBLISHED") ?? "PUBLISHED",
    },
  });

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const statusValue = watch("status");
  const contentValue = watch("content");
  const slugTouched = React.useRef(!!page?.slug);

  React.useEffect(() => {
    if (!slugTouched.current && titleValue) {
      setValue("slug", slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        excerpt: data.excerpt || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      };
      if (isEdit && page) {
        await apiFetch(`/api/admin/pages/${page.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Halaman berhasil diperbarui");
      } else {
        const created = await apiFetch<{ id: string }>("/api/admin/pages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Halaman berhasil dibuat");
        router.push(`/admin/pages/${created.id}`);
        return;
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan halaman");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar halaman
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {isEdit ? "Edit Halaman" : "Halaman Baru"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={
              statusValue === "PUBLISHED"
                ? "bg-emerald-500/15 text-emerald-700"
                : "bg-amber-500/15 text-amber-700"
            }
          >
            {statusValue === "PUBLISHED" ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
            {statusValue}
          </Badge>
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
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <Card className="lg:col-span-2 glass rounded-3xl border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Konten Halaman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="page-title">Judul *</Label>
              <Input
                id="page-title"
                {...register("title")}
                placeholder="contoh: Tentang Kami"
                className="mt-1.5"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="page-slug">Slug</Label>
              <Input
                id="page-slug"
                {...register("slug", {
                  onChange: () => {
                    slugTouched.current = true;
                  },
                })}
                placeholder="tentang-kami"
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
              <Label htmlFor="page-excerpt">Ringkasan (excerpt)</Label>
              <Textarea
                id="page-excerpt"
                {...register("excerpt")}
                placeholder="Deskripsi singkat halaman untuk preview…"
                className="mt-1.5 min-h-[70px]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="page-content">Konten Halaman</Label>
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
                    placeholder="Mulai menulis konten halaman…"
                    minHeight={420}
                  />
                )}
              />
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Search className="h-3 w-3" />
                Editor mendukung heading, format teks, gambar, tabel, link,
                dan alignment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-status">Status</Label>
                <Select
                  value={statusValue}
                  onValueChange={(v: "DRAFT" | "PUBLISHED") =>
                    setValue("status", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="page-status" className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-seo-title">SEO Title</Label>
                <Input
                  id="page-seo-title"
                  {...register("seoTitle")}
                  placeholder="Judul untuk search engine"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="page-seo-desc">SEO Description</Label>
                <Textarea
                  id="page-seo-desc"
                  {...register("seoDescription")}
                  placeholder="Deskripsi untuk search engine (max 300 karakter)"
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
