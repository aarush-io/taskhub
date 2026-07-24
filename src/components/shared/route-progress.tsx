"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
  return true;
}

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  let node = target as HTMLElement | null;
  while (node && node.tagName !== "A") node = node.parentElement;
  return node as HTMLAnchorElement | null;
}

function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    function start() {
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setVisible(true);
      setProgress(10);
      trickleRef.current = setInterval(() => {
        setProgress((current) => {
          if (current >= 90) return current;
          return current + (90 - current) * 0.12;
        });
      }, 180);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = findAnchor(event.target);
      if (!anchor || !isInternalNavigation(anchor)) return;
      start();
    }

    function handlePopState() {
      start();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    // The pathname/search params only change once the new route has fully
    // taken over, so this is the exact moment to finish the bar - the old
    // page was on screen for the entire wait, not a skeleton or blank state.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (trickleRef.current) clearInterval(trickleRef.current);
    setProgress(100);
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return (
    <div className="route-progress-track" aria-hidden="true">
      <div
        className="route-progress-bar"
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBar />
    </Suspense>
  );
}
