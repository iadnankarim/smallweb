"use client";

import { Compass, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrailPanel } from "@/components/browser/trail-panel";
import { useBrowser } from "@/lib/browser/browser-provider";
import { MainNav } from "./main-nav";
import { PersonSwitcher } from "./person-switcher";

export function Sidebar() {
  const { people, personId, setPersonId, trail, jump, visitCount } = useBrowser();
  const depth = trail.index + 1;

  return (
    <aside className="glass flex w-[272px] shrink-0 flex-col gap-[18px] rounded-[20px] border border-white/90 px-3.5 py-[18px] shadow-[0_1px_2px_rgb(30_64_130/0.04),0_10px_30px_rgb(30_64_130/0.06)]">
      <div className="flex items-center gap-2.5 px-1.5">
        <span className="inline-flex size-[30px] items-center justify-center rounded-[9px] bg-ink text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]">
          <Compass className="size-[17px]" strokeWidth={1.8} />
        </span>
        <span className="text-base font-semibold tracking-tight">Smallweb</span>
        <span className="ml-auto rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[11px] text-subtle">.zz</span>
      </div>

      <PersonSwitcher people={people} currentId={personId} onChange={setPersonId} />

      <MainNav historyCount={visitCount} />

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

      <div className="flex items-start gap-2.5 rounded-[14px] border border-ok-line bg-ok-tint p-3">
        <ShieldCheck className="mt-px size-[18px] shrink-0 text-ok" strokeWidth={1.8} />
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-[#14532D]">Pages are sandboxed</span>
          <span className="text-xs leading-snug text-[#276749]">No author scripts, forms or frames reach this app.</span>
        </div>
      </div>
    </aside>
  );
}
