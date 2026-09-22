"use client";

import { useEffect, useRef } from "react";
import { CardBar } from "@/components/shell/page-card";
import type { SearchResult } from "@/lib/types";
import { SiteTile } from "./site-tile";

interface SearchResultsProps {
  entryId: string;
  query: string;
  results: SearchResult[];
  totalSites: number;
  restoreRatio: number;
  onOpen: (address: string) => void;
  onScroll: (ratio: number) => void;
}

/** A results page. It is a stop in the trail, so Back from a result lands here, scrolled as left. */
export function SearchResults({ entryId, query, results, totalSites, restoreRatio, onOpen, onScroll }: SearchResultsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const restore = useRef(restoreRatio);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = restore.current * Math.max(0, el.scrollHeight - el.clientHeight);
  }, [entryId]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const room = Math.max(1, el.scrollHeight - el.clientHeight);
    onScroll(Math.min(1, el.scrollTop / room));
  }

  return (
    <>
      <CardBar
        left={
          <>
            <span className="text-sm font-semibold">
              {results.length} {results.length === 1 ? "page" : "pages"}
            </span>
            <span className="truncate text-[13px] text-subtle">
              of {totalSites} mention “{query}” in their text
            </span>
          </>
        }
      />
      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3.5">
        {results.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <p className="text-base font-semibold">No page mentions “{query}”.</p>
            <p className="mt-1.5 text-sm text-subtle">
              Search looks for every word you type. Try fewer words, or a different one.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-1">
            {results.map((r, i) => (
              <li key={r.address}>
                <button
                  type="button"
                  onClick={() => onOpen(r.address)}
                  className={
                    "flex w-full gap-3.5 rounded-xl border px-[18px] py-4 text-left transition-colors hover:bg-soft/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none " +
                    (i === 0 ? "border-line bg-[#F7F9FC]" : "border-transparent")
                  }
                >
                  <SiteTile address={r.address} title={r.title} size="lg" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center gap-2.5">
                      <span className="text-base font-semibold text-ink">{r.title}</span>
                      <span className="font-mono text-xs text-subtle">{r.address}</span>
                      <span className="ml-auto shrink-0 text-xs text-subtle">
                        {r.matches} {r.matches === 1 ? "match" : "matches"}
                      </span>
                    </span>
                    <span className="text-sm leading-relaxed text-ink-2">
                      {r.parts.map((p, j) =>
                        p.hit ? (
                          <mark key={j} className="rounded-[3px] bg-[#DCE7FE] px-0.5 text-ink">
                            {p.text}
                          </mark>
                        ) : (
                          <span key={j}>{p.text}</span>
                        ),
                      )}
                    </span>
                    <span className="text-xs text-faint">by {r.author.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
