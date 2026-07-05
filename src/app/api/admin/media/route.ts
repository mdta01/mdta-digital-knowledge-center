import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/lib/services";
import { withAdmin } from "@/lib/auth/with-admin";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

// GET — daftar upload dengan paginasi + filter kategori + pencarian originalName.
export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "30");
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const where: Record<string, unknown> = { deletedAt: null };
  if (category) where.category = category;
  if (search) where.originalName = { contains: search };

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    db.upload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.upload.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
});

// POST — multipart upload. Mendukung field `folder` (digabung ke `category`,
// contoh: folder="covers" + category="image" → category="image/covers").
export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const category = (formData.get("category") as string) || "other";
      const folder = (formData.get("folder") as string) || "";
      if (!file) {
        return NextResponse.json(
          { error: "File tidak ditemukan" },
          { status: 400 }
        );
      }
      // Limit 25MB
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran file melebihi 25MB" },
          { status: 413 }
        );
      }
      const ext = path.extname(file.name) || "";
      const filename = `${crypto.randomUUID()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, bytes);

      // Gabungkan kategori dengan folder (mis. "image/covers").
      const finalCategory = folder
        ? `${category}/${folder}`.replace(/\/+$/g, "")
        : category;

      const upload = await uploadService.create({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        path: filepath,
        category: finalCategory,
      });
      return NextResponse.json(upload, { status: 201 });
    } catch (e) {
      console.error("[admin media POST]", e);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  { action: "CREATE", entity: "Upload" }
);
