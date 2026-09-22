"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBrowser } from "@/lib/browser/browser-provider";
import { NavButtons } from "./nav-buttons";
import { Omnibox } from "./omnibox";
import { SiteTile } from "./site-tile";

export function Toolbar() {
  const { current, page, canGoBack, canGoForward, back, forward, reload, go } = useBrowser();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Show the current address (or query) whenever the current stop changes.
  const shown = current?.address ?? "";
  useEffect(() => setValue(shown), [current?.id, shown]);

  // ⌘L / Ctrl+L focuses the bar; Alt+←/→ go back and forward.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if (e.altKey && !typing && e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.altKey && !typing && e.key === "ArrowRight") {
        e.preventDefault();
        forward();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, forward]);

  const leading = !current ? null : current.kind === "search" ? (
    <SiteTile address={current.address} variant="search" size="xs" />
  ) : (
    <SiteTile
      address={current.address}
      title={current.kind === "nowhere" ? undefined : current.title}
      variant={current.kind === "nowhere" ? "nowhere" : "site"}
      size="xs"
    />
  );

  const status = page.entryId && page.entryId === current?.id ? page.status : "idle";

  return (
    <header className="flex items-center gap-3">
      <NavButtons
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        canReload={Boolean(current)}
        onBack={back}
        onForward={forward}
        onReload={reload}
      />
      <Omnibox
        ref={inputRef}
        value={value}
        onValueChange={setValue}
        onSubmit={(text) => {
          go(text);
          inputRef.current?.blur();
        }}
        status={status}
        leading={leading}
      />
      <Button asChild className="h-11 shrink-0 rounded-full px-5 shadow-cta">
        <Link href="/publish">
          <Plus className="size-4" strokeWidth={2.2} />
          Publish
        </Link>
      </Button>
    </header>
  );
}
