"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { apiFetch } from "@/components/admin/utils";
import {
  BookOpen,
  Heart,
  Scale,
  Scroll,
  Moon,
  Sparkles,
  Languages,
  Library,
  HandHeart,
  AudioLines,
  Star,
  FileText,
} from "lucide-react";

type FormValues = z.infer<typeof createCategorySchema>;

const ICON_OPTIONS = [
  { name: "BookOpen", icon: BookOpen },
  { name: "Heart", icon: Heart },
  { name: "Scale", icon: Scale },
  { name: "Scroll", icon: Scroll },
  { name: "Moon", icon: Moon },
  { name: "Sparkles", icon: Sparkles },
  { name: "Languages", icon: Languages },
  { name: "Library", icon: Library },
  { name: "HandHeart", icon: HandHeart },
  { name: "AudioLines", icon: AudioLines },
  { name: "Star", icon: Star },
  { name: "FileText", icon: FileText },
];

const PRESET_COLORS = [
  "#059669",
  "#d4af37",
  "#dc2626",
  "#7c3aed",
  "#2563eb",
  "#db2777",
  "#0891b2",
  "#ea580c",
  "#16a34a",
  "#475569",
];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { books: number };
}

interface CategoryFormProps {
  category?: Category | null;
  onSaved?: (c: Category) => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, onSaved, onCancel }: CategoryFormProps) {
  const isEdit = !!category;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "BookOpen",
      color: category?.color ?? "#059669",
      sortOrder: category?.sortOrder ?? 0,
    },
  });

  const nameValue = watch("name");
  const slugTouched = React.useRef(!!category?.slug);

  React.useEffect(() => {
    if (!slugTouched.current && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  const iconValue = watch("icon");
  const colorValue = watch("color");
  const ActiveIcon = React.useMemo(() => {
    const found = ICON_OPTIONS.find((o) => o.name === iconValue);
    return found ? found.icon : BookOpen;
  }, [iconValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        description: data.description || null,
        icon: data.icon || null,
        color: data.color || null,
      };
      if (isEdit && category) {
        const updated = await apiFetch<Category>(
          `/api/admin/categories/${category.id}`,
          { method: "PUT", body: JSON.stringify(payload) }
        );
        toast.success("Kategori berhasil diperbarui");
        onSaved?.(updated);
      } else {
        const created = await apiFetch<Category>("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Kategori berhasil ditambahkan");
        onSaved?.(created);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan kategori");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cat-name">Nama Kategori *</Label>
          <Input
            id="cat-name"
            {...register("name")}
            placeholder="contoh: Fiqih"
            className="mt-1.5"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            {...register("slug", {
              onChange: () => {
                slugTouched.current = true;
              },
            })}
            placeholder="fiqih"
            className="mt-1.5 font-mono text-sm"
            aria-invalid={!!errors.slug}
          />
          {errors.slug && (
            <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cat-desc">Deskripsi</Label>
          <Textarea
            id="cat-desc"
            {...register("description")}
            placeholder="Deskripsi singkat kategori…"
            className="mt-1.5 min-h-[80px]"
          />
        </div>
        <div>
          <Label htmlFor="cat-icon">Ikon</Label>
          <Select
            value={iconValue}
            onValueChange={(v) => setValue("icon", v, { shouldValidate: true })}
          >
            <SelectTrigger id="cat-icon" className="mt-1.5 w-full">
              <SelectValue placeholder="Pilih ikon" />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((opt) => {
                const I = opt.icon;
                return (
                  <SelectItem key={opt.name} value={opt.name}>
                    <span className="inline-flex items-center gap-2">
                      <I className="h-4 w-4" />
                      {opt.name}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cat-order">Urutan Sortir</Label>
          <Input
            id="cat-order"
            type="number"
            {...register("sortOrder", {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            placeholder="0"
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cat-color">Warna Aksen</Label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <div
              className="h-10 w-10 rounded-xl ring-2 ring-border/60 grid place-items-center"
              style={{ backgroundColor: colorValue || "#059669" }}
            >
              <ActiveIcon className="h-5 w-5 text-white" />
            </div>
            <Input
              type="color"
              value={colorValue || "#059669"}
              onChange={(e) =>
                setValue("color", e.target.value, { shouldValidate: true })
              }
              className="h-10 w-14 p-1 cursor-pointer"
            />
            <Input
              {...register("color")}
              placeholder="#059669"
              className="max-w-[160px] font-mono text-sm"
            />
            <div className="flex items-center gap-1.5 ml-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValue("color", c, { shouldValidate: true })}
                  className="h-7 w-7 rounded-lg ring-1 ring-border/60 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  aria-label={`Pilih warna ${c}`}
                />
              ))}
            </div>
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

export { ICON_OPTIONS as CATEGORY_ICONS };
