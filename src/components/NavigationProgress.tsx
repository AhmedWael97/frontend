"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const completeTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Start the bar on any anchor click that looks like an internal navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      // Same-page hash or external — skip
      if (anchor.target === "_blank") return;

      clearTimeout(completeTimer.current);
      clearTimeout(hideTimer.current);
      setVisible(true);
      setWidth(0);
      // Animate to 70% quickly to signal activity
      requestAnimationFrame(() => setWidth(70));
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // When pathname changes, the navigation completed — race to 100% then hide
  useEffect(() => {
    if (!visible) return;
    clearTimeout(completeTimer.current);
    clearTimeout(hideTimer.current);
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-all duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
