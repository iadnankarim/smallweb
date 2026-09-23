import { buildSnippet, countOccurrences, htmlToText, tokenize } from './text';

export interface SearchAuthor {
  id: string;
  name: string;
}

export interface Searchable {
  address: string;
  title: string;
  html: string;
  author: SearchAuthor;
}

export interface SearchResultDto {
  address: string;
  title: string;
  author: SearchAuthor;
  matches: number;
  parts: { text: string; hit: boolean }[];
}

/**
 * Full-text search over what pages say, not just their titles.
 * Ported from web/src/lib/search.ts so the API and the frontend mock score the same way.
 * Every word of the query must appear; title hits count three times; the exact phrase earns a bonus.
 */
export function searchSites(
  sites: Searchable[],
  query: string,
): SearchResultDto[] {
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
    return [
      {
        score,
        result: {
          address: site.address,
          title: site.title,
          author: site.author,
          matches,
          parts: buildSnippet(text, terms),
        },
      },
    ];
  });

  return scored
    .sort(
      (a, b) =>
        b.score - a.score || a.result.title.localeCompare(b.result.title),
    )
    .map((s) => s.result);
}
