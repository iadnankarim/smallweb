import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The white card every screen renders into. */
export function PageCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-white/95 bg-card shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Thin header strip at the top of a PageCard. */
export function CardBar({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-line px-5">
      <div className="flex min-w-0 items-center gap-2.5">{left}</div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}
