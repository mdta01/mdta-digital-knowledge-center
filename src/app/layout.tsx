import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Lora, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "700"],
});

const SITE_NAME = "Islamic Knowledge Center — MDTA MIFTAHUL ULUM 01";
const SITE_DESCRIPTION =
  "Islamic Knowledge Center MDTA MIFTAHUL ULUM 01 — Pusat pengetahuan Islam modern: kitab klasik, buku, artikel, audio, video, dan materi diniyah. Gratis, tanpa login, dapat diinstal sebagai PWA.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: `${SITE_NAME} — Pusat Pengetahuan Islam Modern`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "islamic knowledge center",
    "perpustakaan digital islami",
    "MDTA MIFTAHUL ULUM",
    "kitab kuning",
    "diniyah",
    "buku islami",
    "kitab klasik",
    "artikel islam",
    "kajian audio",
    "video dakwah",
    "fiqih",
    "aqidah",
    "tafsir",
    "hadits",
    "tajwid",
    "sirah nabawiyah",
  ],
  authors: [{ name: "MDTA MIFTAHUL ULUM 01" }],
  creator: "MDTA MIFTAHUL ULUM 01",
  publisher: "MDTA MIFTAHUL ULUM 01",
  manifest: "/manifest.webmanifest",
  applicationName: "Islamic Knowledge Center",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Islamic Knowledge Center",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Perpustakaan Digital Islami`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2a22" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${lora.variable} ${amiri.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-right" richColors closeButton />
            <ServiceWorkerRegister />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
