"use client";
/**
 * Global error boundary — catches unhandled server-side exceptions
 * and shows a graceful fallback instead of the raw "Application error" page.
 *
 * This component MUST be a client component (Next.js requirement for error.tsx).
 */
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging (Vercel will capture this in server logs)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-3xl bg-gold/20 backdrop-blur-md grid place-items-center mx-auto mb-6 ring-2 ring-gold/40">
          <AlertTriangle className="h-10 w-10 text-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mb-3">
          Terjadi Kesalahan
        </h1>
        <p className="text-white/80 text-sm leading-relaxed mb-6">
          Maaf, terjadi kesalahan saat memuat halaman ini. Tim kami telah
          diberi notifikasi. Silakan coba muat ulang atau kembali ke beranda.
        </p>
        {error.digest && (
          <p className="text-white/50 text-xs mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-gold hover:bg-gold/90 text-emerald-deep rounded-full px-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white/15 rounded-full px-6"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
