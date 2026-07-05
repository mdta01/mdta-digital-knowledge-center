import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MDTA Digital Knowledge Center",
    short_name: "MDTA Knowledge",
    description:
      "MDTA Digital Knowledge Center — Pusat Pengetahuan Islam Digital Modern: kitab, buku, artikel, materi pembelajaran, audio, video, dan referensi keislaman. Membangun Peradaban Melalui Ilmu dan Teknologi.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f1",
    theme_color: "#059669",
    orientation: "portrait-primary",
    categories: ["education", "books", "religion"],
    lang: "id",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Koleksi Buku",
        short_name: "Buku",
        url: "/books",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Kategori",
        short_name: "Kategori",
        url: "/categories",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
