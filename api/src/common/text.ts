export interface SnippetPart {
  text: string;
  hit: boolean;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  apos: "'",
  nbsp: ' ',
};

/** Plain text from HTML, good enough for search and snippets. Ported from web/src/lib/text.ts. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (m, name: string) => ENTITIES[name] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9’']+/)
        .filter((t) => t.length > 1),
    ),
  );
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function countOccurrences(haystack: string, term: string): number {
  const matches = haystack
    .toLowerCase()
    .match(new RegExp(`\\b${escapeRe(term)}`, 'g'));
  return matches ? matches.length : 0;
}

/** A window of text around the first hit, split into highlighted parts. */
export function buildSnippet(
  text: string,
  terms: string[],
  radius = 90,
): SnippetPart[] {
  const lower = text.toLowerCase();
  const first = terms
    .map((t) => lower.search(new RegExp(`\\b${escapeRe(t)}`)))
    .filter((i) => i >= 0);
  const at = first.length ? Math.min(...first) : 0;
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + radius * 1.6);
  let window = text.slice(start, end);
  if (start > 0) window = '…' + window.replace(/^\S*\s/, '');
  if (end < text.length) window = window.replace(/\s\S*$/, '') + '…';

  if (!terms.length) return [{ text: window, hit: false }];
  const re = new RegExp(`\\b(${terms.map(escapeRe).join('|')})\\w*`, 'gi');
  const parts: SnippetPart[] = [];
  let last = 0;
  for (const m of window.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ text: window.slice(last, i), hit: false });
    parts.push({ text: m[0], hit: true });
    last = i + m[0].length;
  }
  if (last < window.length)
    parts.push({ text: window.slice(last), hit: false });
  return parts;
}
