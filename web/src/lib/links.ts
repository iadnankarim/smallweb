import { classifyHref } from "./address";

export interface LinkSummary {
  total: number;
  /** Links to .zz addresses that nobody has published. */
  nowhere: number;
}

/** Counts the links in a page and how many lead to addresses that don't exist. */
export function summarizeLinks(html: string, known: Set<string>): LinkSummary {
  if (typeof window === "undefined") return { total: 0, nowhere: 0 };
  const doc = new DOMParser().parseFromString(html, "text/html");
  let total = 0;
  let nowhere = 0;
  doc.querySelectorAll("a[href]").forEach((a) => {
    const target = classifyHref(a.getAttribute("href") ?? "");
    if (target.kind === "anchor") return;
    total += 1;
    if (target.kind !== "address" || !known.has(target.address)) nowhere += 1;
  });
  return { total, nowhere };
}
