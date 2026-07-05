"use client";

import * as React from "react";
import { Upload, Loader2, ImageIcon, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
  /** Called with the resulting URL after a successful upload */
  onUploaded: (url: string, file?: { filename: string; originalName: string; size: number; mimeType: string }) => void;
  /** Upload category (e.g. "image", "pdf", "epub", "cover") */
  category: string;
  /** HTML accept attribute (e.g. "image/*", "application/pdf") */
  accept?: string;
  /** Optional label override */
  label?: string;
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Show preview thumbnail for image uploads */
  showPreview?: boolean;
  /** Current preview URL (controlled externally) */
  previewUrl?: string;
}

export function UploadButton({
  onUploaded,
  category,
  accept = "image/*",
  label = "Unggah",
  size = "sm",
  variant = "outline",
  className,
  disabled,
  showPreview = false,
  previewUrl,
}: UploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal mengunggah file");
      }
      onUploaded(data.url, {
        filename: data.filename,
        originalName: data.originalName,
        size: data.size,
        mimeType: data.mimeType,
      });
      toast.success("File berhasil diunggah");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengunggah file";
      toast.error(msg);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const isImage = category === "image" || category === "cover" || (accept ?? "").startsWith("image/");
  const Icon = isImage ? ImageIcon : FileText;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showPreview && isImage && (
        <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0">
          {previewUrl ? (
             
            <img
              src={previewUrl}
              alt="Pratinjau"
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
        disabled={disabled || loading}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah…
          </>
        ) : previewUrl && isImage ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Ganti {label}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" /> {label}
          </>
        )}
      </Button>
    </div>
  );
}
