"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight analytics tracker — fires a PAGE_VIEW event on every route change.
 * Uses a session ID stored in localStorage for unique-session counting.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    // Generate or retrieve session ID
    if (typeof window === "undefined") return;
    let sid = localStorage.getItem("mdta_session_id");
    if (!sid) {
      sid = "sess-" + Math.random().toString(36).slice(2, 12) + "-" + Date.now().toString(36);
      localStorage.setItem("mdta_session_id", sid);
    }
    sessionIdRef.current = sid;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionIdRef.current) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Skip API routes, admin, and dev-only paths
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Fire and forget
    fetch("/api/public/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionIdRef.current,
      },
      body: JSON.stringify({
        type: "PAGE_VIEW",
        path: pathname,
        referrer: document.referrer || undefined,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
