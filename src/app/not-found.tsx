import Link from "next/link";
import { Library, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-3xl bg-gold/20 backdrop-blur-md grid place-items-center mx-auto mb-6 ring-2 ring-gold/40">
          <Library className="h-10 w-10 text-gold" />
        </div>
        <h1 className="font-serif text-6xl font-bold text-white mb-3">404</h1>
        <h2 className="font-serif text-xl text-white/90 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          Jelajahi pusat pengetahuan kami dari beranda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="bg-gold hover:bg-gold/90 text-emerald-deep rounded-full px-6"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ke Beranda
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white/15 rounded-full px-6"
          >
            <Link href="/knowledge">
              <Search className="h-4 w-4 mr-2" />
              Jelajahi Knowledge Hub
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
