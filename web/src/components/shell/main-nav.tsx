"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Compass, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Browse", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/history", label: "History", icon: Clock },
  { href: "/publish", label: "Publish", icon: Plus },
] as const;

export function MainNav({ historyCount, collapsed = false }: { historyCount?: number; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections" className="flex flex-col gap-0.5">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "flex h-[38px] items-center gap-2.5 rounded-[10px] border px-2.5 text-sm font-medium transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              collapsed && "justify-center px-0",
              active
                ? "border-line bg-card text-ink shadow-[0_1px_2px_rgb(30_64_130/0.06)]"
                : "border-transparent text-ink-2 hover:bg-white/60",
            )}
          >
            <Icon className={cn("size-[17px]", active ? "text-brand" : "text-subtle")} strokeWidth={1.8} />
            {!collapsed && (
              <>
                {label}
                {label === "History" && historyCount !== undefined && (
                  <span className="ml-auto font-mono text-xs text-subtle">{historyCount}</span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
