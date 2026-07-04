"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

type FormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal mengirim pesan");
      }
      toast.success("Pesan terkirim! Kami akan segera merespons.");
      setSubmitted(true);
      reset();
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-green-500/15 grid place-items-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
          Terima Kasih!
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Pesan Anda telah kami terima. Kami akan merespons via email
          secepatnya.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-full">
          Kirim Pesan Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Nama Anda"
            className="mt-1.5"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="email@contoh.com"
            className="mt-1.5"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">No. WhatsApp (opsional)</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="08xxxxxxxxxx"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subjek</Label>
          <Input
            id="subject"
            {...register("subject")}
            placeholder="Topik pesan"
            className="mt-1.5"
            aria-invalid={!!errors.subject}
          />
          {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="message">Pesan</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Tulis pesan Anda di sini…"
          className="mt-1.5 min-h-[140px]"
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-full px-7"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengirim…
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" /> Kirim Pesan
          </>
        )}
      </Button>
    </form>
  );
}
