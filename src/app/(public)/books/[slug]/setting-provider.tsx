"use client";
import { useEffect } from "react";

/**
 * Sets a session flag so the client knows the book has been visited.
 * View increment is handled server-side by the GET /api/public/books/[slug] route.
 * Must render children — used as a wrapper around the article content.
 */
export function SettingProvider({
  bookId,
  children,
}: {
  bookId: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(`viewed-${bookId}`, "1");
  }, [bookId]);
  return <>{children}</>;
}
