import { Metadata } from "next";
import { authorService } from "@/lib/services";
import { AuthorsGrid } from "./authors-grid";

export const metadata: Metadata = {
  title: "Penulis",
  description: "Para ulama, penulis, dan kontributor yang karyanya tersedia di MDTA Digital Knowledge Center.",
};

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const result = await authorService.list({ pageSize: 100 });
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          Para Penulis
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Penulis & Ulama
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Mengenal para penulis dan ulama yang karyanya tersedia di perpustakaan.
        </p>
      </div>
      <AuthorsGrid authors={result.data} />
    </div>
  );
}
