import type { NewSite, NewVisit, Person, SearchResult, Site, SiteSummary, Visit } from "../types";

/**
 * Everything the browser needs from "the web". Two implementations:
 *  - http: the NestJS backend (set NEXT_PUBLIC_API_URL)
 *  - mock: an in-browser copy of the seed web, so the UI runs on its own
 */
export interface SmallWebApi {
  listPeople(): Promise<Person[]>;
  listSites(): Promise<SiteSummary[]>;
  /** null when nothing lives at the address. */
  getSite(address: string): Promise<Site | null>;
  search(query: string): Promise<SearchResult[]>;
  listVisits(personId: string): Promise<Visit[]>;
  recordVisit(visit: NewVisit): Promise<Visit>;
  publish(site: NewSite): Promise<Site>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: "taken" | "invalid" | "notfound" | "network" | "unknown",
  ) {
    super(message);
  }
}
