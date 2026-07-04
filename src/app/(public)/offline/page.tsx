import { BookOff, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-3xl bg-gold/20 backdrop-blur-md grid place-items-center mx-auto mb-6 ring-2 ring-gold/40">
          <BookOff className="h-10 w-10 text-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mb-3">
          Anda Sedang Offline
        </h1>
        <p className="text-white/80 text-sm leading-relaxed mb-6">
          Maaf, halaman ini belum tersedia di cache offline. Silakan
          periksa koneksi internet Anda lalu coba lagi.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-emerald-deep font-semibold hover:bg-gold/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Muat Ulang
        </Link>
      </div>
    </div>
  );
}
