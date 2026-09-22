"use client";

import { cn } from "@/lib/utils";
import type { TrailEntry } from "@/lib/types";
import { SiteTile } from "./site-tile";

interface TrailPanelProps {
  entries: TrailEntry[];
  /** Index of the entry currently shown. Entries after it are "forward". */
  index: number;
  onJump: (index: number) => void;
}

/**
 * The session's back/forward stack, drawn as a timeline.
 * Everything after `index` is the forward part: dimmed, joined by a dashed line,
 * and dropped as soon as the person goes somewhere new.
 */
export function TrailPanel({ entries, index, onJump }: TrailPanelProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-xs leading-relaxed text-subtle">
        Pages you open in this session appear here, in order.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry, i) => {
        const isCurrent = i === index;
        const isForward = i > index;
        const isLast = i === entries.length - 1;
        const nowhere = entry.kind === "nowhere";
        const search = entry.kind === "search";

        return (
          <li key={entry.id} className={cn("flex gap-2.5", isForward && "opacity-50")}>
            <div className="flex flex-col items-center pt-2">
              <SiteTile
                address={entry.address}
                title={entry.title}
                size="sm"
                variant={nowhere ? "nowhere" : search ? "search" : "site"}
              />
              {!isLast && (
                <span
                  aria-hidden
                  className={cn("mt-1 w-0 flex-1 border-l-[1.5px] border-line", i + 1 > index && "border-dashed")}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => onJump(i)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${isForward ? "Forward to" : isCurrent ? "Current:" : "Back to"} ${entry.title}`}
              className={cn(
                "mb-1.5 flex min-w-0 flex-1 flex-col gap-0.5 rounded-[10px] border px-2.5 py-[7px] text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isCurrent
                  ? "border-line bg-card shadow-[0_1px_2px_rgb(30_64_130/0.06)]"
                  : "border-transparent hover:bg-white/60",
              )}
            >
              <span className="flex items-center justify-between gap-1.5">
                <span className="truncate text-[13px] font-medium text-ink">{entry.title}</span>
                {isCurrent && (
                  <span className="rounded-[5px] bg-brand-tint px-1.5 py-0.5 text-[10px] font-semibold text-brand">Now</span>
                )}
                {isForward && (
                  <span className="rounded-[5px] border border-dashed border-faint px-1 text-[10px] font-semibold text-subtle">
                    Fwd
                  </span>
                )}
              </span>
              <span className="flex justify-between gap-1.5 font-mono text-[11px]">
                <span className={cn("truncate", nowhere ? "text-danger" : "text-subtle")}>
                  {search ? "search" : entry.address}
                </span>
                <span className="shrink-0 text-faint">
                  {entry.via} · {nowhere ? "—" : `${Math.round(entry.scrollRatio * 100)}%`}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
