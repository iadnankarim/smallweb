"use client";

import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavButtonsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  canReload: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
}

export function NavButtons({ canGoBack, canGoForward, canReload, onBack, onForward, onReload }: NavButtonsProps) {
  return (
    <div className="flex h-11 shrink-0 items-center rounded-full border border-line bg-card px-1 shadow-pill">
      <NavButton label="Back" hint="Alt ←" icon={ChevronLeft} disabled={!canGoBack} onClick={onBack} />
      <span aria-hidden className="h-5 w-px bg-line" />
      <NavButton label="Forward" hint="Alt →" icon={ChevronRight} disabled={!canGoForward} onClick={onForward} />
      <span aria-hidden className="h-5 w-px bg-line" />
      <NavButton label="Reload" icon={RotateCw} disabled={!canReload} onClick={onReload} small />
    </div>
  );
}

function NavButton({
  label,
  hint,
  icon: Icon,
  disabled,
  onClick,
  small,
}: {
  label: string;
  hint?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors",
        "hover:bg-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:text-faint/60 disabled:hover:bg-transparent",
      )}
    >
      <Icon className={small ? "size-[17px]" : "size-5"} strokeWidth={1.9} />
    </button>
  );
  if (disabled) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        {label}
        {hint && <span className="ml-2 font-mono text-white/60">{hint}</span>}
      </TooltipContent>
    </Tooltip>
  );
}
