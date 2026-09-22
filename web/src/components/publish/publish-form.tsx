"use client";

import { useSearchParams } from "next/navigation";
import { Check, Eye, Loader2, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageFrame } from "@/components/browser/page-frame";
import { SiteTile } from "@/components/browser/site-tile";
import { Chip } from "@/components/browser/status-badge";
import { CardBar, PageCard } from "@/components/shell/page-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADDRESS_SUFFIX, isAddress } from "@/lib/address";
import { api, ApiError } from "@/lib/api";
import { useBrowser } from "@/lib/browser/browser-provider";
import { summarizeLinks } from "@/lib/links";
import { sanitizeAuthorHtml } from "@/lib/sanitize";

const STARTER = `<h1>A page of my own</h1>
<p>Write whatever you like here, in plain HTML.</p>
<p>Link to other sites by their address, like <a href="tidepool.zz">the tidepools</a>.</p>`;

type Availability = "empty" | "invalid" | "checking" | "available" | "taken";

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function PublishForm() {
  const params = useSearchParams();
  const { hydrated, people, personId, knownAddresses, sitePublished } = useBrowser();

  const [stem, setStem] = useState(() => (params.get("address") ?? "").toLowerCase());
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState(personId);
  const [html, setHtml] = useState(STARTER);
  const [availability, setAvailability] = useState<Availability>("empty");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authorId && personId) setAuthorId(personId);
  }, [authorId, personId]);

  const address = `${stem.trim()}${ADDRESS_SUFFIX}`;
  const debouncedAddress = useDebounced(address, 300);
  const previewHtml = useDebounced(html, 250);

  useEffect(() => {
    if (!stem.trim()) return setAvailability("empty");
    if (!isAddress(debouncedAddress)) return setAvailability("invalid");
    let cancelled = false;
    setAvailability("checking");
    api
      .getSite(debouncedAddress)
      .then((site) => !cancelled && setAvailability(site ? "taken" : "available"))
      .catch(() => !cancelled && setAvailability("empty"));
    return () => {
      cancelled = true;
    };
  }, [debouncedAddress, stem]);

  const report = useMemo(() => {
    const { removed } = sanitizeAuthorHtml(previewHtml);
    const links = summarizeLinks(previewHtml, knownAddresses);
    return { removed, links };
  }, [previewHtml, knownAddresses]);

  const canPublish = availability === "available" && title.trim().length > 0 && Boolean(authorId) && html.trim().length > 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canPublish || submitting) return;
    setSubmitting(true);
    try {
      const site = await api.publish({ address, title: title.trim(), authorId, html });
      toast.success(`Published ${site.address}`);
      sitePublished(site);
    } catch (error) {
      if (error instanceof ApiError && error.code === "taken") setAvailability("taken");
      toast.error("Not published.", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setSubmitting(false);
    }
  }

  // Sanitizing and previewing need the DOM, so render once the browser has started.
  if (!hydrated) return <PageCard>{null}</PageCard>;

  return (
    <PageCard>
      <CardBar
        left={
          <>
            <SiteTile address={isAddress(address) ? address : "new.zz"} title={title || stem || "N"} />
            <span className="text-sm font-semibold">New site</span>
            <span className="text-[13px] text-subtle">An address and a page of HTML</span>
          </>
        }
      />

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1">
        {/* ---------- left: the form ---------- */}
        <div className="flex w-[520px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-line px-6 py-[22px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-address">Address</Label>
              <div className="flex h-10 items-center rounded-[10px] border border-input bg-card pr-3 focus-within:border-brand-line focus-within:ring-4 focus-within:ring-brand/10">
                <input
                  id="p-address"
                  value={stem}
                  onChange={(e) => setStem(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="nighttrains"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={availability === "invalid" || availability === "taken"}
                  aria-describedby="p-address-hint"
                  className="h-full min-w-0 flex-1 bg-transparent pl-3 font-mono text-sm outline-none placeholder:text-faint"
                />
                <span className="font-mono text-sm text-faint">{ADDRESS_SUFFIX}</span>
              </div>
              <AvailabilityHint id="p-address-hint" state={availability} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-author">Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger id="p-author">
                  <SelectValue placeholder="Who wrote it" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Night Trains" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="p-html">Page HTML</Label>
              <span className="text-xs text-subtle">One page. Scripts and forms are removed.</span>
            </div>
            <Textarea
              id="p-html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck={false}
              className="min-h-[260px] flex-1 resize-none rounded-[14px] border-code bg-code px-4 py-3.5 font-mono text-[12.5px] leading-[1.8] text-[#E4E4E7] placeholder:text-[#52525B] focus-visible:border-brand focus-visible:ring-brand/20"
            />
          </div>
        </div>

        {/* ---------- right: preview + what changes ---------- */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#F7F9FC]">
          <div className="flex items-center justify-between px-6 pt-[22px]">
            <span className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
              <Eye className="size-4 text-subtle" />
              Preview as it will render
            </span>
            <Chip tone="ok" icon={<ShieldCheck />}>Sandboxed</Chip>
          </div>

          <div className="mx-6 mt-3.5 flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-[14px] border border-line bg-card">
            <div className="flex h-9 shrink-0 items-center gap-2.5 border-b border-line bg-[#F7F9FC] px-3.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-[9px] rounded-full bg-[#FF6159]" />
                <span className="size-[9px] rounded-full bg-[#FFBD2E]" />
                <span className="size-[9px] rounded-full bg-[#28CA41]" />
              </span>
              <span className="truncate rounded-full border border-line bg-white px-2.5 py-[3px] font-mono text-[11px] text-subtle">
                {isAddress(address) ? address : `${stem.trim() || "your-address"}${ADDRESS_SUFFIX}`}
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <PageFrame
                renderKey={previewHtml}
                html={previewHtml}
                title="Preview"
                onNavigate={() => toast("Links open once the page is published.")}
              />
            </div>
          </div>

          <div className="mx-6 mt-3.5 flex flex-col gap-2 rounded-[14px] border border-line bg-card p-4">
            <span className="text-[13px] font-semibold">What changes when it’s published</span>
            <ReportLine ok>Headings, text, lists and inline styles are kept</ReportLine>
            {report.links.total > 0 && (
              <ReportLine ok>
                {report.links.total - report.links.nowhere} of {report.links.total} links go to published .zz sites
              </ReportLine>
            )}
            {report.links.nowhere > 0 && (
              <ReportLine>
                {report.links.nowhere} {report.links.nowhere === 1 ? "link points" : "links point"} nowhere yet (kept, but leads to an empty address)
              </ReportLine>
            )}
            {report.removed.map((item) => (
              <ReportLine key={item} removed>
                {item} removed
              </ReportLine>
            ))}
          </div>

          <div className="mt-auto flex justify-end gap-2 border-t border-line bg-card px-6 py-4">
            <Button type="submit" disabled={!canPublish || submitting} className="h-10 rounded-full px-5 shadow-cta">
              {submitting && <Loader2 className="animate-spin" />}
              {isAddress(address) ? `Publish ${address}` : "Publish"}
            </Button>
          </div>
        </div>
      </form>
    </PageCard>
  );
}

function AvailabilityHint({ id, state }: { id: string; state: Availability }) {
  const content = {
    empty: <span className="text-subtle">Lowercase letters, numbers and hyphens.</span>,
    invalid: <span className="text-danger">Use lowercase letters, numbers and hyphens only.</span>,
    checking: <span className="text-subtle">Checking…</span>,
    available: (
      <span className="flex items-center gap-1 text-ok">
        <Check className="size-3.5" strokeWidth={2.4} />
        Available
      </span>
    ),
    taken: <span className="text-danger">Already taken. Pick another address.</span>,
  }[state];
  return (
    <span id={id} aria-live="polite" className="text-xs">
      {content}
    </span>
  );
}

function ReportLine({ children, ok, removed }: { children: React.ReactNode; ok?: boolean; removed?: boolean }) {
  return (
    <span className="flex items-start gap-2 text-[13px] text-ink-2">
      {removed ? (
        <X className="mt-0.5 size-[15px] shrink-0 text-danger" strokeWidth={2.2} />
      ) : ok ? (
        <Check className="mt-0.5 size-[15px] shrink-0 text-ok" strokeWidth={2.2} />
      ) : (
        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-faint" aria-hidden />
      )}
      <span className={removed ? "font-mono text-[12.5px]" : undefined}>{children}</span>
    </span>
  );
}
