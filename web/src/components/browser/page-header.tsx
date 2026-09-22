"use client";

import { Link2, ShieldCheck, Unlink } from "lucide-react";
import { CardBar } from "@/components/shell/page-card";
import { summarizeLinks } from "@/lib/links";
import type { Site } from "@/lib/types";
import { useMemo } from "react";
import { SiteTile } from "./site-tile";
import { Chip } from "./status-badge";

export function PageHeader({ site, known }: { site: Site; known: Set<string> }) {
  const links = useMemo(() => summarizeLinks(site.html, known), [site.html, known]);

  return (
    <CardBar
      left={
        <>
          <SiteTile address={site.address} title={site.title} />
          <span className="truncate text-sm font-semibold">{site.title}</span>
          <span className="shrink-0 text-[13px] text-subtle">by {site.author.name}</span>
        </>
      }
      right={
        <>
          <Chip icon={<Link2 />}>
            {links.total} {links.total === 1 ? "link" : "links"}
          </Chip>
          {links.nowhere > 0 && (
            <Chip tone="danger" icon={<Unlink />}>
              {links.nowhere} {links.nowhere === 1 ? "leads" : "lead"} nowhere
            </Chip>
          )}
          <Chip tone="ok" icon={<ShieldCheck />}>
            Sandboxed
          </Chip>
        </>
      }
    />
  );
}
