/**
 * Generate PWA icons (192, 512, maskable 512, apple-touch) from the master SVG.
 * Run: bun /home/z/my-project/scripts/generate-icons.ts
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = "/home/z/my-project";
const ICONS_DIR = path.join(ROOT, "public/icons");
const SOURCE_SVG = path.join(ICONS_DIR, "icon.svg");

async function main() {
  if (!existsSync(SOURCE_SVG)) {
    throw new Error(`Missing source SVG: ${SOURCE_SVG}`);
  }
  await mkdir(ICONS_DIR, { recursive: true });
  const svg = await readFile(SOURCE_SVG);

  const targets: Array<{ name: string; size: number; padding?: number; bg?: string }> = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "icon-maskable-512.png", size: 512, padding: 0.18 },
    { name: "apple-touch-icon.png", size: 180, bg: "#047857" },
    { name: "favicon-32.png", size: 32 },
    { name: "favicon-16.png", size: 16 },
  ];

  for (const t of targets) {
    let pipeline = sharp(svg, { density: 384 });
    if (t.padding) {
      // Maskable: place logo on a coloured background with safe padding
      const inner = Math.round(t.size * (1 - t.padding));
      const innerBuf = await sharp(svg, { density: 384 })
        .resize(inner, inner)
        .png()
        .toBuffer();
      const overlay = Buffer.from(
        `<svg width="${t.size}" height="${t.size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#047857"/>
        </svg>`
      );
      pipeline = sharp({
        create: {
          width: t.size,
          height: t.size,
          channels: 4,
          background: { r: 4, g: 120, b: 87, alpha: 1 },
        },
      }).composite([
        { input: overlay, blend: "over" },
        {
          input: innerBuf,
          blend: "over",
          gravity: "center",
        },
      ]);
      const buf = await pipeline.png().toBuffer();
      await writeFile(path.join(ICONS_DIR, t.name), buf);
      console.log(`✓ ${t.name}`);
      continue;
    }
    if (t.bg) {
      const inner = Math.round(t.size * 0.92);
      const innerBuf = await sharp(svg, { density: 384 })
        .resize(inner, inner)
        .png()
        .toBuffer();
      const overlay = Buffer.from(
        `<svg width="${t.size}" height="${t.size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${t.bg}"/>
        </svg>`
      );
      const buf = await sharp(overlay)
        .composite([{ input: innerBuf, blend: "over", gravity: "center" }])
        .png()
        .toBuffer();
      await writeFile(path.join(ICONS_DIR, t.name), buf);
      console.log(`✓ ${t.name}`);
      continue;
    }
    const buf = await pipeline.resize(t.size, t.size).png().toBuffer();
    await writeFile(path.join(ICONS_DIR, t.name), buf);
    console.log(`✓ ${t.name}`);
  }

  // Also emit an ICO-like favicon (we use 32 png as favicon fallback)
  await writeFile(path.join(ROOT, "public/favicon.ico"), await sharp(svg).resize(32, 32).png().toBuffer());
  console.log("✓ favicon.ico");
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
