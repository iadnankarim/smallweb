"use client";

import { toast } from "sonner";
import { PageCard } from "@/components/shell/page-card";
import { Skeleton } from "@/components/ui/skeleton";
import { classifyHref } from "@/lib/address";
import { useBrowser } from "@/lib/browser/browser-provider";
import { NowhereView } from "./nowhere-view";
import { PageFrame } from "./page-frame";
import { PageHeader } from "./page-header";
import { SearchResults } from "./search-results";
import { StartView } from "./start-view";

/** The page card on "/": whatever the current trail entry is. */
export function BrowseView() {
  const b = useBrowser();
  const { current, page } = b;

  if (!b.hydrated) return <PageCard><LoadingPage /></PageCard>;
  if (!current) {
    return (
      <PageCard>
        <StartView sites={b.directory} onOpen={(a) => b.openAddress(a, "link")} />
      </PageCard>
    );
  }

  // Until the loader has caught up with this entry, show a skeleton.
  if (page.entryId !== current.id || page.status === "loading") return <PageCard><LoadingPage /></PageCard>;

  if (page.error) {
    return (
      <PageCard>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
          <p className="text-base font-semibold">This page couldn’t be loaded.</p>
          <p className="text-sm text-subtle">{page.error}</p>
        </div>
      </PageCard>
    );
  }

  if (page.status === "results" && page.results) {
    return (
      <PageCard>
        <SearchResults
          entryId={current.id}
          query={current.address}
          results={page.results}
          totalSites={b.directory.length}
          restoreRatio={current.scrollRatio}
          onOpen={(address) => b.openAddress(address, "search")}
          onScroll={(ratio) => b.reportScroll(current.id, ratio)}
        />
      </PageCard>
    );
  }

  if (page.status === "nowhere") {
    return (
      <PageCard>
        <NowhereView
          entry={current}
          cameFrom={b.previous}
          canGoBack={b.canGoBack}
          onBack={b.back}
          onOpen={(address) => b.openAddress(address, "link")}
        />
      </PageCard>
    );
  }

  if (page.status === "shown" && page.site) {
    const site = page.site;
    return (
      <PageCard>
        <PageHeader site={site} known={b.knownAddresses} />
        <div className="min-h-0 flex-1">
          <PageFrame
            renderKey={`${current.id}:${site.address}`}
            html={site.html}
            title={site.title}
            restoreRatio={current.scrollRatio}
            onScroll={(ratio) => b.reportScroll(current.id, ratio)}
            onNavigate={(href) => {
              const target = classifyHref(href);
              if (target.kind === "address") b.openAddress(target.address, "link");
              else if (target.kind === "outside") toast("That link points outside the small web.", { description: href });
              else if (target.kind === "invalid") toast("That link isn’t a .zz address.", { description: href });
            }}
          />
        </div>
      </PageCard>
    );
  }

  return <PageCard><LoadingPage /></PageCard>;
}

function LoadingPage() {
  return (
    <div aria-busy className="flex flex-1 flex-col">
      <div className="flex h-[52px] items-center gap-2.5 border-b border-line px-5">
        <Skeleton className="size-[26px] rounded-[7px]" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-6 py-14">
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
