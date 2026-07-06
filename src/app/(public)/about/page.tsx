import { Metadata } from "next";
import Image from "next/image";
import { BookOpen, Users, Target, Heart, Sparkles, Award } from "lucide-react";
import { settingService, bookService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Mengenal lebih dekat MDTA MIFTAHUL ULUM 01 — lembaga pendidikan diniyah yang berkomitmen pada penyebaran ilmu keagamaan.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  // Sequential queries to avoid connection pool exhaustion
  const settings = await settingService.getAll();
  const stats = await bookService.publicStats();

  const statCards = [
    { label: "Koleksi Buku", value: stats.published, icon: BookOpen },
    { label: "Penulis", value: stats.authors, icon: Users },
    { label: "Kategori", value: stats.categories, icon: Award },
    { label: "Total Dibaca", value: stats.totalViews, icon: Sparkles },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep">
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-6 rounded-3xl overflow-hidden ring-4 ring-gold/40 shadow-2xl">
            <Image
              src="/icons/icon-192.png"
              alt="Logo MDTA"
              fill
              sizes="96px"
              className="object-cover"
              priority
            />
          </div>
          <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-3">
            Tentang Kami
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            MDTA MIFTAHUL ULUM 01
          </h1>
          <p className="mt-4 text-white/85 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Madrasah Diniyah Takmiliyah Awaliyah yang berkomitmen pada
            penyebaran ilmu keagamaan Islam melalui pendidikan klasik dan
            modern.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 grid place-items-center mb-3">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold font-serif text-foreground">
                {Number(s.value).toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-8">
            <div className="h-12 w-12 rounded-2xl bg-gold/20 grid place-items-center mb-4">
              <Target className="h-6 w-6 text-gold" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              Visi
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Menjadi lembaga pendidikan diniyah unggul yang mencetak generasi
              muslim berakhlak qur'ani, menguasai khazanah ilmu keislaman, dan
              berkontribusi nyata bagi masyarakat.
            </p>
          </div>
          <div className="glass rounded-3xl p-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/15 grid place-items-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              Misi
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-gold">•</span>
                <span>Menyediakan pendidikan agama Islam yang komprehensif dan aplikatif.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold">•</span>
                <span>Mengembangkan literasi kitab kuning dan literatur Islam klasik.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold">•</span>
                <span>Membangun ekosistem digital pengetahuan Islam yang mudah diakses.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold">•</span>
                <span>Menanamkan akhlakul karimah dalam setiap aspek pembelajaran.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="prose-kitap max-w-none">
          <h2>Profil Singkat</h2>
          <p>
            MDTA MIFTAHUL ULUM 01 adalah madrasah diniyah takmiliyah awaliyah
            yang berfokus pada pendidikan ilmu keagamaan Islam untuk tingkat
            dasar. Lembaga ini berkomitmen menghadirkan pendidikan yang
            memadukan tradisi keilmuan klasik dengan pendekatan modern, agar
            siswa tidak hanya memahami teks agama, tetapi juga mampu
            mengamalkannya dalam kehidupan sehari-hari.
          </p>
          <p>
            Sebagai bagian dari komitmen untuk memperluas akses ilmu, kami
            membangun Digital Knowledge Center ini agar seluruh khazanah literatur
            Islam — mulai dari kitab klasik, modul pembelajaran, hingga buku
            diniyah — dapat dinikmati oleh siapa saja, kapan saja, tanpa
            hambatan. Semua koleksi dapat diakses gratis dan didukung dengan
            pembaca digital yang nyaman, baik untuk teks Latin maupun Arab.
          </p>
          <p>
            Kami percaya bahwa ilmu adalah cahaya, dan dengan menyebarkan
            cahaya tersebut melalui platform digital, semoga menjadi amal
            jariyah yang berkesinambungan. Selamat membaca, semoga bermanfaat.
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="relative py-16 sm:py-20 overflow-hidden mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-primary to-emerald-deep" />
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl text-white leading-relaxed font-medium italic">
            {settings.islamicQuote ||
              "Barangsiapa menempuh jalan untuk mencari ilmu, Allah akan memudahkan baginya jalan menuju surga."}
          </blockquote>
          {settings.quoteAuthor && (
            <div className="mt-6 inline-flex items-center gap-2 text-gold text-sm">
              <span className="h-px w-8 bg-gold/60" />
              <span className="font-medium">{settings.quoteAuthor}</span>
              <span className="h-px w-8 bg-gold/60" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
