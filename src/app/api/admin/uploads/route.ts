import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/lib/services";
import { uploadRepository } from "@/lib/repositories";
import { withAdmin } from "@/lib/auth/with-admin";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "30");
  const category = searchParams.get("category") || undefined;
  const result = await uploadService.list({ page, pageSize, category });
  return NextResponse.json(result);
});

export const POST = withAdmin(
  async (req: NextRequest) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const category = (formData.get("category") as string) || "other";
      if (!file) {
        return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
      }
      // Limit 25MB
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran file melebihi 25MB" }, { status: 413 });
      }
      const ext = path.extname(file.name) || "";
      const filename = `${crypto.randomUUID()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, bytes);

      const upload = await uploadService.create({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        path: filepath,
        category,
      });
      return NextResponse.json(upload, { status: 201 });
    } catch (e) {
      console.error("[admin uploads POST]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  },
  { action: "CREATE", entity: "Upload" }
);
