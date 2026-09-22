import { buildSnippet, countOccurrences, htmlToText, tokenize } from "./text";
import type { Person, SearchResult } from "./types";

interface Searchable {
  address: string;
  title: string;
  html: string;
  author: Person;
}

/**
 * Full-text search over what pages say, not just their titles.
 * Every word of the query must appear (so search has to choose);
 * title hits count three times; the exact phrase earns a bonus.
 * The backend does the same with a MongoDB text index; this is the mock's version.
 */
export function searchSites(sites: Searchable[], query: string): SearchResult[] {
  const terms = tokenize(query);
  if (!terms.length) return [];
  const phrase = query.trim().toLowerCase();

  const scored = sites.flatMap((site) => {
    const text = htmlToText(site.html);
    const lowerText = text.toLowerCase();
    let score = 0;
    let matches = 0;
    for (const term of terms) {
      const inBody = countOccurrences(text, term);
      const inTitle = countOccurrences(site.title, term);
      if (inBody + inTitle === 0) return [];
      matches += inBody + inTitle;
      score += inBody + inTitle * 3;
    }
    if (terms.length > 1 && lowerText.includes(phrase)) score += 5;
    return [{ score, result: { address: site.address, title: site.title, author: site.author, matches, parts: buildSnippet(text, terms) } }];
  });

  return scored
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
    .map((s) => s.result);
}
