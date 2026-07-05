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

const SITE_NAME = "MDTA Digital Knowledge Center";
const SITE_TAGLINE = "Membangun Peradaban Melalui Ilmu dan Teknologi";
const SITE_DESCRIPTION =
  "MDTA Digital Knowledge Center — Pusat Pengetahuan Islam Digital Modern yang menyediakan kitab, buku, artikel, materi pembelajaran, audio, video, dan referensi keislaman dalam satu platform. Membangun Peradaban Melalui Ilmu dan Teknologi.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "mdta digital knowledge center",
    "pusat pengetahuan islam",
    "knowledge center",
    "digital learning islam",
    "MDTA MIFTAHUL ULUM",
    "kitab kuning",
    "kitab digital",
    "diniyah",
    "buku islami",
    "kitab klasik",
    "artikel islam",
    "kajian audio",
    "video dakwah",
    "materi pembelajaran",
    "fiqih",
    "aqidah",
    "tafsir",
    "hadits",
    "tajwid",
    "sirah nabawiyah",
    "edutech islam",
    "platform pembelajaran islam",
  ],
  authors: [{ name: "MDTA MIFTAHUL ULUM 01" }],
  creator: "MDTA MIFTAHUL ULUM 01",
  publisher: "MDTA MIFTAHUL ULUM 01",
  manifest: "/manifest.webmanifest",
  applicationName: "MDTA Digital Knowledge Center",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MDTA Knowledge Center",
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
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
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
