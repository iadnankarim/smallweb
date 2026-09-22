"use client";

import Link from "next/link";
import { ArrowLeft, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { addressStem } from "@/lib/address";
import { api } from "@/lib/api";
import type { SearchResult, TrailEntry } from "@/lib/types";
import { SiteTile } from "./site-tile";

interface NowhereViewProps {
  entry: TrailEntry;
  cameFrom?: TrailEntry;
  canGoBack: boolean;
  onBack: () => void;
  onOpen: (address: string) => void;
}

/** An address nobody has published. Still a stop in the trail, still a visit in history. */
export function NowhereView({ entry, cameFrom, canGoBack, onBack, onOpen }: NowhereViewProps) {
  const words = addressStem(entry.address).replace(/-/g, " ");
  const [related, setRelated] = useState<SearchResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .search(words)
      .then((r) => !cancelled && setRelated(r.slice(0, 3)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [words]);

  const via =
    entry.via === "link" && cameFrom
      ? `You followed a link on ${cameFrom.address}, but nobody has ever published here.`
      : "Nobody has ever published a page at this address.";

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[radial-gradient(520px_340px_at_50%_30%,#EEF4FF_0%,#FFFFFF_75%)] p-10">
      <div className="flex w-full max-w-[540px] flex-col items-center gap-4 text-center">
        <span className="inline-flex size-[76px] items-center justify-center rounded-[22px] border-[1.5px] border-dashed border-faint bg-danger-tint text-danger">
          <Unlink className="size-8" strokeWidth={1.6} />
        </span>
        <span className="rounded-full border border-danger-line bg-danger-tint px-2.5 py-0.5 font-mono text-[13px] text-danger">
          {entry.address}
        </span>
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Nothing lives at this address</h1>
        <p className="text-[15px] leading-relaxed text-subtle">
          {via} The visit is kept in your history{canGoBack ? ", and Back takes you to where you were." : "."}
        </p>
        <div className="mt-1 flex gap-2">
          {canGoBack && (
            <Button onClick={onBack} className="h-10 rounded-full px-4 shadow-cta">
              <ArrowLeft />
              Go back
            </Button>
          )}
          <Button asChild variant="outline" className="h-10 rounded-full px-[18px]">
            <Link href={`/publish?address=${encodeURIComponent(addressStem(entry.address))}`}>Publish at this address</Link>
          </Button>
        </div>

        {related.length > 0 && (
          <div className="mt-4 flex w-full flex-col gap-2 text-left">
            <span className="text-xs font-semibold text-subtle">Pages that mention “{words}”</span>
            {related.map((r) => (
              <button
                key={r.address}
                type="button"
                onClick={() => onOpen(r.address)}
                className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3 text-left transition-colors hover:bg-soft/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <SiteTile address={r.address} title={r.title} size="md" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{r.title}</span>
                  <span className="font-mono text-[11px] text-subtle">{r.address}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
