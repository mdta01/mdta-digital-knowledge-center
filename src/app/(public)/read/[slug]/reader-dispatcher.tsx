"use client";
import dynamic from "next/dynamic";
import { ArticleReader } from "./article-reader";
import { Loader2 } from "lucide-react";

const PdfReader = dynamic(
  () => import("./pdf-reader").then((m) => m.PdfReader),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memuat pembaca PDF…
      </div>
    ),
  }
);

const EpubReader = dynamic(
  () => import("./epub-reader").then((m) => m.EpubReader),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memuat pembaca EPUB…
      </div>
    ),
  }
);

interface BookFile {
  id: string;
  format: string;
  url: string;
  filename: string;
  size?: number | null;
}

interface ReaderDispatcherProps {
  book: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    content?: string | null;
    excerpt?: string | null;
    collectionType: string;
    videoUrl?: string | null;
    audioUrl?: string | null;
    duration?: number | null;
    readingTime?: number | null;
    coverImage?: string | null;
    files: BookFile[];
    author?: { name: string; slug: string } | null;
    category?: { name: string; slug: string } | null;
  };
}

export function ReaderDispatcher({ book }: ReaderDispatcherProps) {
  const pdfFile = book.files.find((f) => f.format === "PDF");
  const epubFile = book.files.find((f) => f.format === "EPUB");

  if (pdfFile) {
    return (
      <PdfReader
        bookId={book.id}
        bookTitle={book.title}
        pdfUrl={pdfFile.url}
        downloadUrl={pdfFile.url}
      />
    );
  }

  if (epubFile) {
    return (
      <EpubReader
        bookId={book.id}
        bookTitle={book.title}
        epubUrl={epubFile.url}
        downloadUrl={epubFile.url}
      />
    );
  }

  if (book.videoUrl) {
    return <ArticleReader book={book} mode="video" />;
  }

  if (book.audioUrl) {
    return <ArticleReader book={book} mode="audio" />;
  }

  // Fallback: article reader
  return <ArticleReader book={book} mode="article" />;
}
