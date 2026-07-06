"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("mdtadigital@center");
  const [password, setPassword] = useState("mdta@01");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-secondary/30">
      {/* Brand side */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <svg
          className="absolute -top-32 -right-20 w-[500px] h-[500px] text-gold/15"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <g stroke="currentColor" strokeWidth="0.8">
            <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" />
            <polygon points="100,40 160,70 160,130 100,160 40,130 40,70" />
            <polygon points="100,60 140,80 140,120 100,140 60,120 60,80" />
            <circle cx="100" cy="100" r="40" />
          </g>
        </svg>

        <Link href="/" className="relative flex items-center gap-3 text-white">
          <div className="h-12 w-12 rounded-2xl overflow-hidden ring-2 ring-gold/40">
            <Image
              src="/icons/icon-192.png"
              alt="Logo"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-serif font-bold">MDTA MIFTAHUL ULUM 01</div>
            <div className="text-xs text-white/70">Admin Panel</div>
          </div>
        </Link>

        <div className="relative text-white">
          <ShieldCheck className="h-12 w-12 text-gold mb-4" />
          <h2 className="font-serif text-3xl font-bold leading-tight mb-3">
            Selamat Datang,<br />Admin Knowledge Center
          </h2>
          <p className="text-white/80 max-w-md leading-relaxed">
            Kelola knowledge assets, penulis, kategori, dan seluruh aspek
            Digital Knowledge Center dari satu dashboard modern.
          </p>
        </div>

        <div className="relative text-white/70 text-xs">
          © {new Date().getFullYear()} MDTA MIFTAHUL ULUM 01
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke situs
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden ring-2 ring-gold/40">
              <Image
                src="/icons/icon-192.png"
                alt="Logo"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-sm">MDTA MIFTAHUL ULUM 01</div>
              <div className="text-xs text-muted-foreground">Admin Panel</div>
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Masuk ke Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Silakan masukkan kredensial admin Anda.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="mdtadigital@center"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses…
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Demo credentials telah terisi otomatis. Klik{" "}
            <span className="font-medium text-foreground">Masuk</span> untuk
            melanjutkan.
          </p>
        </div>
      </div>
    </div>
  );
}
