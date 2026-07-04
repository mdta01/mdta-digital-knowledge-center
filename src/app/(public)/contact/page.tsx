import { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { settingService } from "@/lib/services";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi MDTA MIFTAHUL ULUM 01 untuk pertanyaan, kerja sama, atau informasi lebih lanjut.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await settingService.getAll();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          Hubungi Kami
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Kontak
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Punya pertanyaan, kritik, saran, atau ingin bekerja sama? Sampaikan
          kepada kami melalui kanal di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Info */}
        <div className="space-y-4">
          {settings.contactAddress && (
            <div className="glass rounded-3xl p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground mb-1">Alamat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {settings.contactAddress}
                </p>
              </div>
            </div>
          )}

          {settings.contactWhatsapp && (
            <a
              href={`https://wa.me/${settings.contactWhatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block glass rounded-3xl p-6 flex items-start gap-4 hover:bg-primary/5 transition-colors card-hover"
            >
              <div className="h-12 w-12 rounded-2xl bg-green-500/15 grid place-items-center shrink-0">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground mb-1">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">{settings.contactWhatsapp}</p>
                <p className="text-xs text-primary mt-1 font-medium">Klik untuk chat →</p>
              </div>
            </a>
          )}

          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="block glass rounded-3xl p-6 flex items-start gap-4 hover:bg-primary/5 transition-colors card-hover"
            >
              <div className="h-12 w-12 rounded-2xl bg-gold/15 grid place-items-center shrink-0">
                <Mail className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground break-all">{settings.contactEmail}</p>
              </div>
            </a>
          )}

          {settings.contactMapsUrl && (
            <div className="glass rounded-3xl p-2 overflow-hidden">
              <iframe
                src={settings.contactMapsUrl}
                width="100%"
                height="280"
                style={{ border: 0, borderRadius: 16 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi MDTA MIFTAHUL ULUM 01"
              />
            </div>
          )}
        </div>

        {/* Form */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-1">
            Kirim Pesan
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Isi formulir berikut, kami akan merespons secepatnya.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
