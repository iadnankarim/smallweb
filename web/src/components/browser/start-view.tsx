"use client";

import type { SiteSummary } from "@/lib/types";
import { SiteTile } from "./site-tile";

/** Shown before the first page of a session: every site, so there is somewhere to start. */
export function StartView({ sites, onOpen }: { sites: SiteSummary[]; onOpen: (address: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-16 pt-14 pb-20">
        <h1 className="text-[34px] font-semibold tracking-[-0.02em]">Where to?</h1>
        <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-subtle">
          Type an address in the bar above, search for words, or start at one of the {sites.length} sites on the small
          web. Everything you open from here builds your trail.
        </p>
        <ul className="mt-8 grid grid-cols-3 gap-2">
          {sites.map((site) => (
            <li key={site.address}>
              <button
                type="button"
                onClick={() => onOpen(site.address)}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3 text-left transition-colors hover:bg-soft/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <SiteTile address={site.address} title={site.title} size="lg" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">{site.title}</span>
                  <span className="truncate font-mono text-xs text-subtle">
                    {site.address} · {site.author.name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
