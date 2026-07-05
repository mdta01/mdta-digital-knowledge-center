"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Loader2,
  Globe,
  Palette,
  Share2,
  MapPin,
  Search as SearchIcon,
  BookOpen,
  ImageIcon,
  Sparkles,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/components/admin/upload-button";
import { apiFetch } from "@/components/admin/utils";

type FormValues = z.infer<typeof settingsSchema>;

const COLOR_PRESETS = [
  "#059669", // emerald
  "#0d9488", // teal
  "#16a34a", // green
  "#d4af37", // gold
  "#ca8a04", // amber
  "#dc2626", // red
  "#7c3aed", // violet
  "#2563eb", // blue
];

interface SettingsFormProps {
  initial: FormValues;
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  });

  const logo = watch("siteLogo");
  const favicon = watch("siteFavicon");
  const primaryColor = watch("primaryColor");
  const accentColor = watch("accentColor");
  const themeBgColor = watch("themeBgColor");
  const themeHeroImage = watch("themeHeroImage");
  const themeFontHeading = watch("themeFontHeading");
  const themeFontBody = watch("themeFontBody");
  const themeBorderRadius = watch("themeBorderRadius");

  const onSubmit = async (data: FormValues) => {
    try {
      await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Pengaturan berhasil disimpan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengaturan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto h-auto py-1 rounded-2xl">
          <TabsTrigger value="general" className="rounded-xl gap-2">
            <Globe className="h-4 w-4" /> Umum
          </TabsTrigger>
          <TabsTrigger value="theme" className="rounded-xl gap-2">
            <Palette className="h-4 w-4" /> Tema
          </TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl gap-2">
            <Sparkles className="h-4 w-4" /> Tema &amp; Branding
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl gap-2">
            <Share2 className="h-4 w-4" /> Sosial
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl gap-2">
            <MapPin className="h-4 w-4" /> Kontak
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl gap-2">
            <SearchIcon className="h-4 w-4" /> SEO
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-xl gap-2">
            <BookOpen className="h-4 w-4" /> Konten
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Informasi Situs
              </CardTitle>
              <CardDescription>
                Pengaturan dasar identitas situs web.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Nama Situs</Label>
                <Input
                  id="siteName"
                  {...register("siteName")}
                  className="mt-1.5"
                />
                {errors.siteName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.siteName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="siteDescription">Deskripsi Situs</Label>
                <Textarea
                  id="siteDescription"
                  {...register("siteDescription")}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="siteKeywords">Kata Kunci Situs</Label>
                <Input
                  id="siteKeywords"
                  {...register("siteKeywords")}
                  placeholder="perpustakaan, islami, kitab, …"
                  className="mt-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pisahkan dengan koma
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Logo & Favicon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteLogo">Logo</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0">
                    {logo ? (
                       
                      <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="siteLogo"
                    {...register("siteLogo")}
                    placeholder="/uploads/logo.png"
                    className="flex-1 min-w-[200px]"
                  />
                  <UploadButton
                    category="image"
                    accept="image/*"
                    label="Unggah"
                    onUploaded={(url) => setValue("siteLogo", url, { shouldValidate: true })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteFavicon">Favicon</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0">
                    {favicon ? (
                       
                      <img src={favicon} alt="Favicon" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="siteFavicon"
                    {...register("siteFavicon")}
                    placeholder="/uploads/favicon.ico"
                    className="flex-1 min-w-[200px]"
                  />
                  <UploadButton
                    category="image"
                    accept="image/x-icon,image/png,image/svg+xml"
                    label="Unggah"
                    onUploaded={(url) => setValue("siteFavicon", url, { shouldValidate: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Footer</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="footerText">Teks Footer</Label>
              <Textarea
                id="footerText"
                {...register("footerText")}
                className="mt-1.5"
                placeholder="© 2025 MDTA MIFTAHUL ULUM 01"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Skema Warna
              </CardTitle>
              <CardDescription>
                Sesuaikan warna primer dan aksen situs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorField
                id="primaryColor"
                label="Warna Primer"
                value={primaryColor || ""}
                onChange={(v) => setValue("primaryColor", v, { shouldValidate: true })}
                register={register("primaryColor")}
              />
              <ColorField
                id="accentColor"
                label="Warna Aksen"
                value={accentColor || ""}
                onChange={(v) => setValue("accentColor", v, { shouldValidate: true })}
                register={register("accentColor")}
              />
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs text-muted-foreground mb-3">Pratinjau</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button style={{ backgroundColor: primaryColor }} className="rounded-full">
                    Tombol Primer
                  </Button>
                  <Button
                    style={{ backgroundColor: accentColor }}
                    className="rounded-full text-black"
                  >
                    Tombol Aksen
                  </Button>
                  <div
                    className="h-10 w-10 rounded-xl ring-2 ring-border/60"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="h-10 w-10 rounded-xl ring-2 ring-border/60"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme & Branding (V2) */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Branding Lanjutan
              </CardTitle>
              <CardDescription>
                Kustomisasi tampilan situs lebih dalam: warna latar, gambar hero, tipografi, dan radius border.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorField
                id="themeBgColor"
                label="Warna Latar Belakang"
                value={themeBgColor || "#fafaf9"}
                onChange={(v) => setValue("themeBgColor", v, { shouldValidate: true })}
                register={register("themeBgColor")}
              />

              <div>
                <Label htmlFor="themeHeroImage">Gambar Hero</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="h-14 w-24 rounded-2xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0">
                    {themeHeroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={themeHeroImage} alt="Hero" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="themeHeroImage"
                    {...register("themeHeroImage")}
                    placeholder="/uploads/hero.jpg"
                    className="flex-1 min-w-[200px]"
                  />
                  <UploadButton
                    category="image"
                    accept="image/*"
                    label="Unggah"
                    onUploaded={(url) => setValue("themeHeroImage", url, { shouldValidate: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="themeFontHeading">Font Heading</Label>
                  <Select
                    value={themeFontHeading || "serif"}
                    onValueChange={(v) => setValue("themeFontHeading", v as "serif" | "sans" | "arabic", { shouldValidate: true })}
                  >
                    <SelectTrigger id="themeFontHeading" className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif (Lora)</SelectItem>
                      <SelectItem value="sans">Sans (Plus Jakarta)</SelectItem>
                      <SelectItem value="arabic">Arab (Amiri)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="themeFontBody">Font Body</Label>
                  <Select
                    value={themeFontBody || "sans"}
                    onValueChange={(v) => setValue("themeFontBody", v as "serif" | "sans" | "arabic", { shouldValidate: true })}
                  >
                    <SelectTrigger id="themeFontBody" className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif (Lora)</SelectItem>
                      <SelectItem value="sans">Sans (Plus Jakarta)</SelectItem>
                      <SelectItem value="arabic">Arab (Amiri)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="themeBorderRadius">Radius Border</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {Number(themeBorderRadius ?? 16)}px
                  </span>
                </div>
                <Slider
                  value={[Number(themeBorderRadius ?? 16)]}
                  min={0}
                  max={32}
                  step={1}
                  onValueChange={(v) => setValue("themeBorderRadius", v[0], { shouldValidate: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> Pratinjau Langsung
              </CardTitle>
              <CardDescription>Contoh tampilan dengan pengaturan tema saat ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-3xl border border-border/60 p-6 space-y-4"
                style={{
                  backgroundColor: themeBgColor || "#fafaf9",
                  backgroundImage: themeHeroImage
                    ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${themeHeroImage})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <h3
                  className="font-bold text-2xl text-white"
                  style={{
                    fontFamily:
                      themeFontHeading === "serif"
                        ? "var(--font-serif), serif"
                        : themeFontHeading === "arabic"
                        ? "var(--font-arabic), serif"
                        : "var(--font-sans), sans-serif",
                  }}
                >
                  MDTA Digital Knowledge Center
                </h3>
                <p
                  className="text-sm text-white/90"
                  style={{
                    fontFamily:
                      themeFontBody === "serif"
                        ? "var(--font-serif), serif"
                        : themeFontBody === "arabic"
                        ? "var(--font-arabic), serif"
                        : "var(--font-sans), sans-serif",
                  }}
                >
                  Jelajahi ribuan kitab kuning, buku modern, dan kajian Islam.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    style={{
                      backgroundColor: primaryColor || "#059669",
                      borderRadius: `${Number(themeBorderRadius ?? 16)}px`,
                    }}
                    className="px-4 py-2 text-sm font-medium text-white"
                  >
                    Mulai Membaca
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: accentColor || "#d4af37",
                      borderRadius: `${Number(themeBorderRadius ?? 16)}px`,
                    }}
                    className="px-4 py-2 text-sm font-medium text-black"
                  >
                    Jelajahi Koleksi
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Logo, Favicon, Footer (existing - moved here for convenience) */}
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Logo, Favicon &amp; Footer
              </CardTitle>
              <CardDescription>
                Logo dan favicon juga dapat diatur di tab Umum. Footer ditampilkan di seluruh halaman.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteLogo-branding">Logo</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="siteLogo-branding"
                    {...register("siteLogo")}
                    placeholder="/uploads/logo.png"
                    className="flex-1 min-w-[200px]"
                  />
                  <UploadButton
                    category="image"
                    accept="image/*"
                    label="Unggah"
                    onUploaded={(url) => setValue("siteLogo", url, { shouldValidate: true })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteFavicon-branding">Favicon</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-border/60 bg-secondary/40 grid place-items-center shrink-0">
                    {favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={favicon} alt="Favicon" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="siteFavicon-branding"
                    {...register("siteFavicon")}
                    placeholder="/uploads/favicon.ico"
                    className="flex-1 min-w-[200px]"
                  />
                  <UploadButton
                    category="image"
                    accept="image/x-icon,image/png,image/svg+xml"
                    label="Unggah"
                    onUploaded={(url) => setValue("siteFavicon", url, { shouldValidate: true })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="footerText-branding">Teks Footer</Label>
                <Textarea
                  id="footerText-branding"
                  {...register("footerText")}
                  className="mt-1.5"
                  placeholder="© 2025 MDTA MIFTAHUL ULUM 01"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" /> Media Sosial
              </CardTitle>
              <CardDescription>
                Tautan ke akun media sosial pesantren.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="socialFacebook">Facebook</Label>
                <Input
                  id="socialFacebook"
                  {...register("socialFacebook")}
                  placeholder="https://facebook.com/…"
                  className="mt-1.5"
                />
                {errors.socialFacebook && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.socialFacebook.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="socialInstagram">Instagram</Label>
                <Input
                  id="socialInstagram"
                  {...register("socialInstagram")}
                  placeholder="https://instagram.com/…"
                  className="mt-1.5"
                />
                {errors.socialInstagram && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.socialInstagram.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="socialYoutube">YouTube</Label>
                <Input
                  id="socialYoutube"
                  {...register("socialYoutube")}
                  placeholder="https://youtube.com/…"
                  className="mt-1.5"
                />
                {errors.socialYoutube && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.socialYoutube.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="socialTelegram">Telegram</Label>
                <Input
                  id="socialTelegram"
                  {...register("socialTelegram")}
                  placeholder="https://t.me/…"
                  className="mt-1.5"
                />
                {errors.socialTelegram && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.socialTelegram.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Kontak
              </CardTitle>
              <CardDescription>
                Informasi kontak pesantren.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactAddress">Alamat</Label>
                <Textarea
                  id="contactAddress"
                  {...register("contactAddress")}
                  className="mt-1.5"
                  placeholder="Jl. Pesantren No. 01, …"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactWhatsapp">WhatsApp</Label>
                  <Input
                    id="contactWhatsapp"
                    {...register("contactWhatsapp")}
                    placeholder="08xxxxxxxxxx"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register("contactEmail")}
                    placeholder="info@mdta-miftahululum.sch.id"
                    className="mt-1.5"
                  />
                  {errors.contactEmail && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="contactMapsUrl">URL Google Maps</Label>
                <Input
                  id="contactMapsUrl"
                  {...register("contactMapsUrl")}
                  placeholder="https://maps.google.com/…"
                  className="mt-1.5"
                />
                {errors.contactMapsUrl && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.contactMapsUrl.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <SearchIcon className="h-5 w-5 text-primary" /> SEO & Analytics
              </CardTitle>
              <CardDescription>
                Konfigurasi analitik dan pelacakan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                <Input
                  id="googleAnalytics"
                  {...register("googleAnalytics")}
                  placeholder="G-XXXXXXXXXX"
                  className="mt-1.5 font-mono text-sm"
                />
                {errors.googleAnalytics && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.googleAnalytics.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content">
          <Card className="glass rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Kutipan Islami
              </CardTitle>
              <CardDescription>
                Kutipan yang ditampilkan di beranda atau sidebar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="islamicQuote">Kutipan</Label>
                <Textarea
                  id="islamicQuote"
                  {...register("islamicQuote")}
                  className="mt-1.5 min-h-[100px]"
                  placeholder="Membaca adalah kunci pembuka pintu kebijaksanaan."
                />
              </div>
              <div>
                <Label htmlFor="quoteAuthor">Pengarang Kutipan</Label>
                <Input
                  id="quoteAuthor"
                  {...register("quoteAuthor")}
                  className="mt-1.5"
                  placeholder="Imam Al-Ghazali"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="glass-strong rounded-full shadow-lg border border-border/60 p-1.5 pr-2 flex items-center gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  register: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
}

function ColorField({ id, label, value, onChange, register }: ColorFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <div
          className="h-10 w-10 rounded-xl ring-2 ring-border/60 shrink-0"
          style={{ backgroundColor: value || "#059669" }}
        />
        <Input
          type="color"
          value={value || "#059669"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 p-1 cursor-pointer"
          aria-label={`${label} picker`}
        />
        <Input
          id={id}
          {...register}
          placeholder="#059669"
          className="max-w-[180px] font-mono text-sm"
        />
        <div className="flex items-center gap-1.5 ml-1">
          {COLOR_PRESETS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => onChange(c)}
              className="h-7 w-7 rounded-lg ring-1 ring-border/60 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              aria-label={`Pilih warna ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
