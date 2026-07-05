import { Metadata } from "next";
import { notFound } from "next/navigation";
import { bookService } from "@/lib/services";
import { ReaderDispatcher } from "./reader-dispatcher";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await bookService.getBySlug(slug);
  if (!book) return { title: "Buku tidak ditemukan" };
  return {
    title: `Baca: ${book.title}`,
    description: book.seoDescription || book.description || `Baca ${book.title} online di Islamic Knowledge Center.`,
    openGraph: {
      title: book.title,
      description: book.description || "",
      images: book.coverImage ? [{ url: book.coverImage }] : undefined,
      type: "article",
    },
  };
}

export default async function ReadPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await bookService.getBySlug(slug);
  if (!book || book.status !== "PUBLISHED") notFound();

  // Determine reader type
  const pdfFile = book.files.find((f) => f.format === "PDF");
  const epubFile = book.files.find((f) => f.format === "EPUB");
  const isPdf = !!pdfFile;
  const isEpub = !!epubFile;
  const isVideo = !isPdf && !isEpub && !!book.videoUrl;
  const isAudio = !isPdf && !isEpub && !isVideo && !!book.audioUrl;
  const mode: "pdf" | "epub" | "video" | "audio" | "article" = isPdf
    ? "pdf"
    : isEpub
      ? "epub"
      : isVideo
        ? "video"
        : isAudio
          ? "audio"
          : "article";

  // For PDF / EPUB readers we use full-screen UI without the public layout's header/footer
  if (mode === "pdf" || mode === "epub") {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ReaderDispatcher book={serializeBook(book)} />
      </div>
    );
  }

  // For video / audio / article, render inside the normal public layout
  return <ReaderDispatcher book={serializeBook(book)} />;
}

function serializeBook(book: Awaited<ReturnType<typeof bookService.getBySlug>>) {
  if (!book) throw new Error("book required");
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description,
    content: book.content,
    excerpt: book.excerpt,
    collectionType: book.collectionType,
    videoUrl: book.videoUrl,
    audioUrl: book.audioUrl,
    duration: book.duration,
    readingTime: book.readingTime,
    coverImage: book.coverImage,
    publishedYear: book.publishedYear,
    author: book.author
      ? { name: book.author.name, slug: book.author.slug }
      : null,
    category: book.category
      ? { name: book.category.name, slug: book.category.slug }
      : null,
    files: book.files.map((f) => ({
      id: f.id,
      format: f.format,
      url: f.url,
      filename: f.filename,
      size: f.size,
    })),
  };
}
