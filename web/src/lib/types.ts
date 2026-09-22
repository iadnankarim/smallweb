/** How a person arrived somewhere. Recorded on every visit. */
export type Via = "typed" | "link" | "back" | "forward" | "history" | "search" | "reload";

export interface Person {
  id: string;
  name: string;
}

export interface SiteSummary {
  address: string;
  title: string;
  author: Person;
}

export interface Site extends SiteSummary {
  /** The author's HTML exactly as stored (already sanitized on publish). */
  html: string;
  createdAt: string;
}

export interface NewSite {
  address: string;
  title: string;
  authorId: string;
  html: string;
}

/** A recorded fact: this person arrived here, at this time, this way. */
export interface Visit {
  id: string;
  personId: string;
  kind: "page" | "search";
  /** Site address, or the query for a search. */
  address: string;
  title: string;
  via: Via;
  /** False when the address led nowhere. */
  found: boolean;
  at: string;
}

export type NewVisit = Omit<Visit, "id" | "at">;

/** A piece of a search snippet; `hit` pieces are highlighted. */
export interface SnippetPart {
  text: string;
  hit: boolean;
}

export interface SearchResult {
  address: string;
  title: string;
  author: Person;
  parts: SnippetPart[];
  matches: number;
}

/**
 * One stop in the current browsing session (the back/forward stack).
 * A search result list is a stop too, so Back can return to it.
 */
export interface TrailEntry {
  id: string;
  kind: "page" | "search" | "nowhere";
  /** Site address, or the query for kind "search". */
  address: string;
  title: string;
  via: Via;
  /** Scroll position when the person left this entry, 0–1 of the scrollable height. */
  scrollRatio: number;
}

/** What the page card is showing for the current entry. */
export type PageStatus = "idle" | "loading" | "shown" | "nowhere" | "results";
