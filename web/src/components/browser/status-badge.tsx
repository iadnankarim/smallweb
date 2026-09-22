import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PageStatus } from "@/lib/types";

const TONES = {
  neutral: "bg-soft border-line text-ink-2",
  brand: "bg-brand-tint border-brand-line text-brand",
  ok: "bg-ok-tint border-ok-line text-ok",
  danger: "bg-danger-tint border-danger-line text-danger",
} as const;

export type ChipTone = keyof typeof TONES;

/** Rounded pill used for small facts: "Sandboxed", "2 links", "Nowhere". */
export function Chip({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: ChipTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap [&_svg]:size-[13px]",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const STATUS: Record<Exclude<PageStatus, "idle">, { label: string; tone: ChipTone }> = {
  loading: { label: "Loading", tone: "neutral" },
  shown: { label: "Shown", tone: "ok" },
  nowhere: { label: "Nowhere", tone: "danger" },
  results: { label: "Results", tone: "brand" },
};

/** The state of the current page, shown inside the address bar. */
export function StatusBadge({ status }: { status: PageStatus }) {
  if (status === "idle") return null;
  const { label, tone } = STATUS[status];
  return (
    <span aria-live="polite" className="shrink-0">
      <Chip tone={tone}>
        <span aria-hidden className={cn("size-1.5 rounded-full bg-current", status === "loading" && "animate-pulse")} />
        {label}
      </Chip>
    </span>
  );
}
