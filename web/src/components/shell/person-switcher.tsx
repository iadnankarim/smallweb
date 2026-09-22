"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { avatarColors, initials } from "@/lib/identity";
import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PersonAvatar({ person, size = 32, className }: { person: Person; size?: number; className?: string }) {
  const { bg, fg } = avatarColors(person.id);
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold", className)}
      style={{ width: size, height: size, backgroundColor: bg, color: fg }}
    >
      {initials(person.name)}
    </span>
  );
}

interface PersonSwitcherProps {
  people: Person[];
  currentId: string;
  onChange: (id: string) => void;
  collapsed?: boolean;
}

/** Who is browsing. No accounts: picking a name is the whole identity. */
export function PersonSwitcher({ people, currentId, onChange, collapsed = false }: PersonSwitcherProps) {
  const current = people.find((p) => p.id === currentId);
  if (!current) {
    return <Skeleton className={cn("rounded-[14px] bg-white/70", collapsed ? "size-9" : "h-[54px] w-full")} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={collapsed ? current.name : undefined}
          className={cn(
            "flex items-center rounded-[14px] border border-line bg-card text-left shadow-[0_1px_2px_rgb(30_64_130/0.05)] transition-colors hover:bg-soft/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            collapsed ? "size-9 justify-center" : "w-full gap-2.5 px-2.5 py-2",
          )}
        >
          <PersonAvatar person={current} />
          {!collapsed && (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[11px] text-subtle">Browsing as</span>
                <span className="truncate text-sm font-semibold text-ink">{current.name}</span>
              </span>
              <ChevronsUpDown className="size-4 text-faint" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={collapsed ? "w-56" : "w-[var(--radix-dropdown-menu-trigger-width)]"}>
        <DropdownMenuLabel>Browse as</DropdownMenuLabel>
        {people.map((person) => (
          <DropdownMenuItem key={person.id} onSelect={() => onChange(person.id)} className="gap-2.5 py-2">
            <PersonAvatar person={person} size={26} />
            <span className="flex-1">{person.name}</span>
            {person.id === current.id && <Check className="size-4 text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
