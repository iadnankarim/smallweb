"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildSrcDoc, isFrameMessage, newFrameToken } from "@/lib/frame";
import { sanitizeAuthorHtml } from "@/lib/sanitize";

interface PageFrameProps {
  /** Changes whenever a different page (or a reload) should be rendered. */
  renderKey: string;
  html: string;
  title: string;
  /** Scroll to restore when this render starts, 0–1. */
  restoreRatio?: number;
  onNavigate: (href: string) => void;
  onScroll?: (ratio: number) => void;
}

/**
 * Renders HTML nobody here wrote. See lib/frame.ts for the full reasoning.
 * THE LINE THAT CONTAINS IT: sandbox="allow-scripts" (no allow-same-origin).
 */
export function PageFrame({ renderKey, html, title, restoreRatio = 0, onNavigate, onScroll }: PageFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  // Only build the document in the browser (it needs DOMPurify and a fresh token).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Handlers change every render; keep the latest in refs so the listener stays stable.
  const navigateRef = useRef(onNavigate);
  const scrollRef = useRef(onScroll);
  navigateRef.current = onNavigate;
  scrollRef.current = onScroll;

  // Build the document once per render key: scroll updates must NOT rebuild it,
  // otherwise the page would reload every time it reports its own scroll.
  const restoreRef = useRef(restoreRatio);
  restoreRef.current = restoreRatio;
  const { srcDoc, token } = useMemo(() => {
    if (!mounted) return { srcDoc: "", token: "" };
    const t = newFrameToken();
    const clean = sanitizeAuthorHtml(html).html;
    return { token: t, srcDoc: buildSrcDoc({ html: clean, token: t, restoreRatio: restoreRef.current }) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderKey, html, mounted]);

  useEffect(() => {
    if (!token) return;
    function onMessage(event: MessageEvent) {
      // Only our own iframe, only with this render's token, only known message shapes.
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isFrameMessage(event.data, token)) return;
      if (event.data.type === "navigate") navigateRef.current(event.data.href);
      else if (event.data.type === "scroll") scrollRef.current?.(event.data.ratio);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token]);

  if (!mounted) return <div className="size-full bg-white" />;

  return (
    <iframe
      ref={frameRef}
      key={token}
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="size-full border-0 bg-white"
    />
  );
}
