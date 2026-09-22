"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PersonAvatar } from "@/components/shell/person-switcher";
import { CardBar, PageCard } from "@/components/shell/page-card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useBrowser } from "@/lib/browser/browser-provider";
import { dayLabel, formatTime } from "@/lib/time";
import type { Visit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SiteTile } from "./site-tile";
import { Chip } from "./status-badge";

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "typed", label: "Typed", test: (v: Visit) => v.via === "typed" },
  { id: "link", label: "Link", test: (v: Visit) => v.via === "link" },
  { id: "search", label: "Search", test: (v: Visit) => v.via === "search" || v.kind === "search" },
  { id: "backfwd", label: "Back · Fwd", test: (v: Visit) => v.via === "back" || v.via === "forward" },
  { id: "history", label: "From history", test: (v: Visit) => v.via === "history" },
  { id: "nowhere", label: "Nowhere", test: (v: Visit) => !v.found },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];
const GRID = "grid grid-cols-[56px_minmax(0,1fr)_170px_100px_104px] items-center gap-3.5";

/** Every visit a person has made, newest first. Anyone's history can be read and jumped into. */
export function HistoryView() {
  const { people, personId, historyVersion, openAddress, openSearch } = useBrowser();
  const [viewedId, setViewedId] = useState(personId);
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [text, setText] = useState("");

  useEffect(() => setViewedId(personId), [personId]);

  useEffect(() => {
    if (!viewedId) return;
    let cancelled = false;
    setVisits(null);
    api
      .listVisits(viewedId)
      .then((v) => !cancelled && setVisits(v))
      .catch(() => !cancelled && setVisits([]));
    return () => {
      cancelled = true;
    };
  }, [viewedId, historyVersion]);

  const viewed = people.find((p) => p.id === viewedId);

  const groups = useMemo(() => {
    if (!visits) return [];
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const needle = text.trim().toLowerCase();
    const shown = visits.filter(
      (v) => test(v) && (!needle || v.title.toLowerCase().includes(needle) || v.address.toLowerCase().includes(needle)),
    );
    const byDay = new Map<string, Visit[]>();
    for (const v of shown) {
      const label = dayLabel(v.at);
      byDay.set(label, [...(byDay.get(label) ?? []), v]);
    }
    return Array.from(byDay, ([label, items]) => ({ label, items }));
  }, [visits, filter, text]);

  const addressCount = useMemo(
    () => new Set((visits ?? []).filter((v) => v.kind === "page").map((v) => v.address)).size,
    [visits],
  );

  return (
    <PageCard>
      <CardBar
        left={
          <>
            <div className="flex items-center pl-0.5" role="group" aria-label="Whose history">
              {people.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={p.id === viewedId}
                  aria-label={`Show ${p.name}’s history`}
                  title={p.name}
                  onClick={() => setViewedId(p.id)}
                  className={cn(
                    "relative rounded-full ring-2 ring-card shadow-[0_1px_3px_rgb(15_23_42/0.2)] transition-transform hover:z-10 focus-visible:z-10 focus-visible:outline-none",
                    i > 0 && "-ml-2",
                    p.id === viewedId
                      ? "z-10 ring-offset-2 ring-offset-brand"
                      : "hover:-translate-y-0.5",
                  )}
                >
                  <PersonAvatar person={p} size={30} />
                </button>
              ))}
            </div>
            <span className="ml-2 truncate text-sm font-semibold">{viewed ? `${viewed.name}’s history` : "History"}</span>
            {visits && (
              <span className="shrink-0 text-[13px] text-subtle">
                {visits.length} visits · {addressCount} addresses
              </span>
            )}
          </>
        }
        right={
          <label className="flex h-8 w-60 items-center gap-2 rounded-full border border-line bg-soft px-3 focus-within:border-brand-line focus-within:bg-card">
            <Search className="size-[15px] text-faint" />
            <span className="sr-only">Filter history</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Filter by title or address"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
            />
          </label>
        }
      />

      <div className="flex gap-1.5 border-b border-line px-5 py-3" role="group" aria-label="Filter by how they arrived">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-8 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              filter === f.id ? "border-ink bg-ink text-white" : "border-line bg-card text-ink-2 hover:bg-soft",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={cn(GRID, "border-b border-line bg-[#F7F9FC] px-5 py-2.5 text-xs font-medium text-subtle")}>
        <span>Time</span>
        <span>Page</span>
        <span>Address</span>
        <span>Arrived by</span>
        <span>Result</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!visits ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="p-10 text-center text-sm text-subtle">
            {visits.length === 0 ? "No visits yet. Pages you open are recorded here." : "No visits match this filter."}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h3 className="px-5 pt-3.5 pb-1.5 text-xs font-semibold text-subtle">{group.label}</h3>
              <ul>
                {group.items.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => (v.kind === "search" ? openSearch(v.address, "history") : openAddress(v.address, "history"))}
                      className={cn(
                        GRID,
                        "w-full border-t border-soft px-5 py-2.5 text-left transition-colors hover:bg-soft/60 focus-visible:bg-soft focus-visible:outline-none",
                      )}
                    >
                      <span className="font-mono text-xs text-subtle">{formatTime(v.at)}</span>
                      <span className="flex min-w-0 items-center gap-2.5">
                        <SiteTile
                          address={v.address}
                          title={v.title}
                          variant={v.kind === "search" ? "search" : v.found ? "site" : "nowhere"}
                          size="md"
                        />
                        <span className="truncate text-sm font-medium">{v.title}</span>
                      </span>
                      <span className="truncate font-mono text-xs text-subtle">{v.kind === "search" ? "—" : v.address}</span>
                      <span className="text-[13px] text-ink-2">{v.via}</span>
                      <span>
                        {v.found ? <Chip tone="ok">Shown</Chip> : <Chip tone="danger">Nowhere</Chip>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </PageCard>
  );
}
