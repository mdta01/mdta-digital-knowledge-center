"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Top progress bar — shows a thin gold bar at the top of the page
 * during route transitions. Gives instant visual feedback that
 * navigation is happening.
 *
 * Lightweight: pure CSS, no library. Uses requestAnimationFrame
 * for smooth animation.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trigger on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);

    let raf: number;
    let current = 0;
    const animate = () => {
      // Ease towards 90% (never reach 100% until loaded)
      current += (90 - current) * 0.1;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(current);
      if (current < 89) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);

    // Complete after a short delay (page usually loads fast)
    const complete = setTimeout(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(100);
      setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(complete);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-gold via-amber-300 to-gold transition-all duration-200 ease-out shadow-sm shadow-gold/50"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
