import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { tileColor, tileLetter } from "@/lib/identity";

const SIZES = {
  xs: "size-[22px] rounded-[6px] text-[11px]",
  sm: "size-6 rounded-[7px] text-[12px]",
  md: "size-[26px] rounded-[7px] text-[13px]",
  lg: "size-9 rounded-[10px] text-[16px]",
  xl: "size-[76px] rounded-[22px] text-[30px]",
} as const;

interface SiteTileProps {
  address: string;
  title?: string;
  /** "nowhere" draws a dashed empty tile, "search" a search glyph. */
  variant?: "site" | "nowhere" | "search";
  size?: keyof typeof SIZES;
  className?: string;
}

/** Small square that stands in for a site's favicon. */
export function SiteTile({ address, title, variant = "site", size = "md", className }: SiteTileProps) {
  const base = cn(
    "inline-flex shrink-0 items-center justify-center font-serif font-semibold leading-none",
    SIZES[size],
    className,
  );

  if (variant === "nowhere") {
    return (
      <span aria-hidden className={cn(base, "border-[1.5px] border-dashed border-faint font-mono font-medium text-faint")}>
        ?
      </span>
    );
  }

  if (variant === "search") {
    return (
      <span aria-hidden className={cn(base, "border border-brand-line bg-brand-tint text-brand")}>
        <Search className="size-[58%]" strokeWidth={2.2} />
      </span>
    );
  }

  const color = tileColor(address);
  return (
    <span
      aria-hidden
      className={base}
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 11%, white)`,
        border: `1px solid color-mix(in srgb, ${color} 20%, white)`,
      }}
    >
      {tileLetter(title ?? address)}
    </span>
  );
}
