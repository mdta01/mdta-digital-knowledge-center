"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Mail, MapPin, Phone, Facebook, Instagram, Youtube, Send } from "lucide-react";

/**
 * SiteFooter — client component.
 *
 * Previously a server component that called settingService.getAll() on every
 * page load, causing connection pool timeouts on Vercel serverless.
 *
 * Now renders immediately with defaults, then fetches settings client-side
 * from the cached /api/public/settings endpoint. This ensures pages NEVER
 * block on DB during server-side rendering.
 */

interface FooterSettings {
  siteName?: string;
  siteDescription?: string;
  footerText?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialTelegram?: string;
  contactAddress?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
}

const DEFAULTS: FooterSettings = {
  siteName: "MDTA Digital Knowledge Center",
  siteDescription: "Pusat Pengetahuan Islam Digital Modern",
  footerText: "© MDTA MIFTAHUL ULUM 01",
};

// In-memory cache (survives across re-renders in the same client session)
let _clientSettingsCache: FooterSettings | null = null;

export function SiteFooter() {
  const [settings, setSettings] = useState<FooterSettings>(_clientSettingsCache || DEFAULTS);

  useEffect(() => {
    if (_clientSettingsCache) return; // already fetched
    fetch("/api/public/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          _clientSettingsCache = data;
          setSettings(data);
        }
      })
      .catch(() => {
        // keep defaults on error
      });
  }, []);

  const year = new Date().getFullYear();
  const footerText = (settings.footerText || DEFAULTS.footerText!).replace(
    /\{year\}/g,
    String(year)
  );

  return (
    <footer className="mt-auto relative overflow-hidden border-t border-border/60 bg-gradient-to-b from-secondary/40 to-secondary/80">
      {/* Decorative islamic ornament */}
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden ring-2 ring-gold/40">
                <Image
                  src="/icons/icon-192.png"
                  alt="Logo MDTA"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-foreground">
                  MDTA MIFTAHUL ULUM 01
                </h3>
                <p className="text-xs text-muted-foreground">
                  Digital Knowledge Center
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {settings.siteDescription ||
                "Platform perpustakaan digital Islami modern dengan koleksi kitab klasik, modul pembelajaran diniyah, dan buku-buku berkualitas untuk para pencari ilmu."}
            </p>
            <div className="flex items-center gap-2">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-background/60 hover:bg-primary hover:text-primary-foreground grid place-items-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-background/60 hover:bg-primary hover:text-primary-foreground grid place-items-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.socialYoutube && (
                <a
                  href={settings.socialYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-background/60 hover:bg-primary hover:text-primary-foreground grid place-items-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {settings.socialTelegram && (
                <a
                  href={settings.socialTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-background/60 hover:bg-primary hover:text-primary-foreground grid place-items-center transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
              Jelajahi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/knowledge" className="text-muted-foreground hover:text-primary transition-colors">
                  Knowledge Hub
                </Link>
              </li>
              <li>
                <Link href="/books" className="text-muted-foreground hover:text-primary transition-colors">
                  Pusat Pengetahuan
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Kategori
                </Link>
              </li>
              <li>
                <Link href="/authors" className="text-muted-foreground hover:text-primary transition-colors">
                  Penulis
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
              Kontak
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {settings.contactAddress && (
                <li className="flex gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>{settings.contactAddress}</span>
                </li>
              )}
              {settings.contactWhatsapp && (
                <li className="flex gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <a href={`https://wa.me/${settings.contactWhatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {settings.contactWhatsapp}
                  </a>
                </li>
              )}
              {settings.contactEmail && (
                <li className="flex gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary transition-colors break-all">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{footerText}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Syarat Penggunaan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
