"use client";

import { Compass, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrailPanel } from "@/components/browser/trail-panel";
import { useBrowser } from "@/lib/browser/browser-provider";
import { cn } from "@/lib/utils";
import { MainNav } from "./main-nav";
import { PersonSwitcher } from "./person-switcher";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { people, personId, setPersonId, trail, jump, visitCount } = useBrowser();
  const depth = trail.index + 1;

  return (
    <aside
      className={cn(
        "glass flex shrink-0 flex-col gap-[18px] rounded-[20px] border border-white/90 py-[18px] shadow-[0_1px_2px_rgb(30_64_130/0.04),0_10px_30px_rgb(30_64_130/0.06)] transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[76px] px-2.5" : "w-[272px] px-3.5",
      )}
    >
      <div className={cn("flex items-center gap-2.5 px-1.5", collapsed && "flex-col gap-2 px-0")}>
        <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-ink text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]">
          <Compass className="size-[17px]" strokeWidth={1.8} />
        </span>
        {!collapsed && (
          <>
            <span className="text-base font-semibold tracking-tight">Smallweb</span>
            <span className="ml-auto rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[11px] text-subtle">.zz</span>
          </>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-card text-subtle transition-colors hover:bg-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" strokeWidth={1.8} />
          ) : (
            <PanelLeftClose className="size-4" strokeWidth={1.8} />
          )}
        </button>
      </div>

      <PersonSwitcher people={people} currentId={personId} onChange={setPersonId} collapsed={collapsed} />

      <MainNav historyCount={visitCount} collapsed={collapsed} />

      {!collapsed && (
        <section aria-labelledby="trail-heading" className="flex min-h-0 flex-1 flex-col gap-2.5">
          <div className="flex items-center justify-between px-2.5">
            <h2 id="trail-heading" className="text-xs font-semibold text-subtle">
              Session trail
            </h2>
            {depth > 0 && <span className="font-mono text-[11px] text-faint">{depth} deep</span>}
          </div>
          <ScrollArea className="min-h-0 flex-1 pr-1">
            <TrailPanel entries={trail.entries} index={trail.index} onJump={jump} />
          </ScrollArea>
        </section>
      )}

      {collapsed && <div className="min-h-0 flex-1" />}
    </aside>
  );
}
