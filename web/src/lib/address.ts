/**
 * Addresses on the small web look like `tidepool.zz`:
 * lowercase letters, digits and hyphens, then `.zz`. Nothing else is an address.
 */
export const ADDRESS_SUFFIX = ".zz";
const ADDRESS_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?\.zz$/;

export function isAddress(value: string): boolean {
  return ADDRESS_RE.test(value);
}

/** Lowercases and strips things people paste from real browsers. */
export function normalizeAddress(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^\.?\//, "")
    .replace(/\/+$/, "");
}

/** Address-bar rule: a valid address goes there, anything else is a search. */
export function parseOmnibox(text: string): { kind: "address"; address: string } | { kind: "search"; query: string } {
  const candidate = normalizeAddress(text);
  if (isAddress(candidate)) return { kind: "address", address: candidate };
  return { kind: "search", query: text.trim() };
}

export type LinkTarget =
  | { kind: "address"; address: string }
  | { kind: "anchor" }
  | { kind: "outside"; href: string }
  | { kind: "invalid"; href: string };

/** What a link inside a published page points at. */
export function classifyHref(href: string): LinkTarget {
  const value = href.trim();
  if (!value || value.startsWith("#")) return { kind: "anchor" };
  if (/^(https?:|mailto:|tel:|ftp:|javascript:|data:)/i.test(value) || value.startsWith("//")) {
    return { kind: "outside", href: value };
  }
  const address = normalizeAddress(value.split("#")[0]!.split("?")[0]!);
  return isAddress(address) ? { kind: "address", address } : { kind: "invalid", href: value };
}

/** "tidepool.zz" -> "tidepool" */
export function addressStem(address: string): string {
  return address.endsWith(ADDRESS_SUFFIX) ? address.slice(0, -ADDRESS_SUFFIX.length) : address;
}
