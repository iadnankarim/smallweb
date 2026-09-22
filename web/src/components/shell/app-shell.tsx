"use client";

import { useState, type ReactNode } from "react";
import { Toolbar } from "@/components/browser/toolbar";
import { Sidebar } from "./sidebar";

/**
 * Whole-window layout: floating glass sidebar on the left,
 * browser toolbar + one white page card on the right.
 * Designed for desktop widths; narrower windows scroll sideways.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-dvh overflow-x-auto">
      <div className="flex h-full min-w-[1024px] gap-[18px] p-3.5">
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 pt-1">
          <Toolbar />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
