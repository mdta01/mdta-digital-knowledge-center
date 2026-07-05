"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuthorSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { UploadButton } from "@/components/admin/upload-button";
import { apiFetch } from "@/components/admin/utils";

type FormValues = z.infer<typeof createAuthorSchema>;

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  photo?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  nationality?: string | null;
  createdAt: string;
  updatedAt: string;
  books?: unknown[];
}

interface AuthorFormProps {
  author?: Author | null;
  onSaved?: (author: Author) => void;
  onCancel?: () => void;
}

export function AuthorForm({ author, onSaved, onCancel }: AuthorFormProps) {
  const isEdit = !!author;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createAuthorSchema),
    defaultValues: {
      name: author?.name ?? "",
      slug: author?.slug ?? "",
      bio: author?.bio ?? "",
      photo: author?.photo ?? "",
      birthYear: author?.birthYear ?? undefined,
      deathYear: author?.deathYear ?? undefined,
      nationality: author?.nationality ?? "",
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");
  const photoValue = watch("photo");
  const slugTouched = React.useRef(!!author?.slug);

  // Auto-generate slug from name (only when user hasn't manually edited slug)
  React.useEffect(() => {
    if (!slugTouched.current && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        bio: data.bio || null,
        photo: data.photo || "",
        nationality: data.nationality || null,
        birthYear: data.birthYear ?? null,
        deathYear: data.deathYear ?? null,
      };
      if (isEdit && author) {
        const updated = await apiFetch<Author>(
          `/api/admin/authors/${author.id}`,
          { method: "PUT", body: JSON.stringify(payload) }
        );
        toast.success("Penulis berhasil diperbarui");
        onSaved?.(updated);
      } else {
        const created = await apiFetch<Author>("/api/admin/authors", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Penulis berhasil ditambahkan");
        onSaved?.(created);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan penulis";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="author-name">Nama Penulis *</Label>
          <Input
            id="author-name"
            {...register("name")}
            placeholder="contoh: Imam Al-Ghazali"
            className="mt-1.5"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="author-slug">Slug</Label>
          <Input
            id="author-slug"
            {...register("slug", {
              onChange: () => {
                slugTouched.current = true;
              },
            })}
            placeholder="imam-al-ghazali"
            className="mt-1.5 font-mono text-sm"
            aria-invalid={!!errors.slug}
          />
          {errors.slug && (
            <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
          )}
          {!slugValue && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Otomatis dibuat dari nama
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="author-nationality">Kebangsaan</Label>
          <Input
            id="author-nationality"
            {...register("nationality")}
            placeholder="contoh: Persia"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="author-birth">Tahun Lahir</Label>
          <Input
            id="author-birth"
            type="number"
            {...register("birthYear", { setValueAs: (v) => v === "" || v === null ? null : Number(v) })}
            placeholder="1058"
            className="mt-1.5"
          />
          {errors.birthYear && (
            <p className="text-xs text-destructive mt-1">{errors.birthYear.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="author-death">Tahun Wafat</Label>
          <Input
            id="author-death"
            type="number"
            {...register("deathYear", { setValueAs: (v) => v === "" || v === null ? null : Number(v) })}
            placeholder="1111"
            className="mt-1.5"
          />
          {errors.deathYear && (
            <p className="text-xs text-destructive mt-1">{errors.deathYear.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="author-photo">Foto</Label>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Input
              id="author-photo"
              {...register("photo")}
              placeholder="/uploads/foto.jpg"
              className="flex-1 min-w-[200px]"
            />
            <UploadButton
              category="image"
              accept="image/*"
              label="Unggah Foto"
              showPreview
              previewUrl={photoValue || undefined}
              onUploaded={(url) => {
                setValue("photo", url, { shouldValidate: true });
              }}
            />
          </div>
          {errors.photo && (
            <p className="text-xs text-destructive mt-1">{errors.photo.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="author-bio">Biografi</Label>
          <Textarea
            id="author-bio"
            {...register("bio")}
            placeholder="Biografi singkat penulis…"
            className="mt-1.5 min-h-[120px]"
          />
          {errors.bio && (
            <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>
          )}
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
        <Button
          type="submit"
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
    </form>
  );
}
