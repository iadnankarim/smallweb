"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageCard } from "@/components/shell/page-card";
import { Button } from "@/components/ui/button";
import { useBrowser } from "@/lib/browser/browser-provider";
import { SiteTile } from "./site-tile";

const SUGGESTIONS = ["low tide", "lantern", "soup", "stars", "apples"];

/** A place to start a search. Results open in the browser as a stop in the trail. */
export function SearchStart() {
  const { openSearch, openAddress, directory } = useBrowser();
  const [query, setQuery] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) openSearch(query.trim(), "typed");
  }

  return (
    <PageCard>
      <div className="flex flex-1 overflow-y-auto bg-[radial-gradient(620px_360px_at_50%_20%,#EEF4FF_0%,#FFFFFF_75%)] px-16 pt-14 pb-20">
        <div className="flex w-full flex-col gap-5">
          <div>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Search the small web</h1>
            <p className="mt-1.5 text-[15px] text-subtle">
              Finds pages by what is written in them, across all {directory.length || "the"} sites.
            </p>
          </div>
          <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-line bg-card p-1.5 pl-4 shadow-pill focus-within:border-brand-line focus-within:ring-4 focus-within:ring-brand/10">
            <Search className="size-[18px] shrink-0 text-subtle" />
            <label htmlFor="search-q" className="sr-only">Words to search for</label>
            <input
              id="search-q"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Words from a page, like “low tide”"
              className="h-10 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
            />
            <Button type="submit" disabled={!query.trim()} className="h-10 rounded-full px-5">
              Search
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-subtle">Try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => openSearch(s, "typed")}
                className="h-8 rounded-full border border-line bg-card px-3 text-[13px] text-ink-2 transition-colors hover:bg-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {s}
              </button>
            ))}
          </div>

          {directory.length > 0 && (
            <div className="flex flex-col gap-2.5 border-t border-line pt-5">
              <span className="text-[13px] text-subtle">Or open a site directly</span>
              <div className="flex flex-wrap gap-2">
                {directory.slice(0, 6).map((site) => (
                  <button
                    key={site.address}
                    type="button"
                    onClick={() => openAddress(site.address, "typed")}
                    className="flex max-w-[220px] items-center gap-2 rounded-full border border-line bg-card py-1.5 pr-3.5 pl-1.5 text-left transition-colors hover:bg-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <SiteTile address={site.address} title={site.title} size="sm" />
                    <span className="truncate text-[13px] font-medium text-ink-2">{site.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageCard>
  );
}
