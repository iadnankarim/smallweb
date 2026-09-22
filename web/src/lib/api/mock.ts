import { isAddress } from "../address";
import { PEOPLE } from "../mock/people";
import { SEED_CREATED_AT, SEED_SITES } from "../mock/sites";
import { buildSeedVisits } from "../mock/visits";
import { sanitizeAuthorHtml } from "../sanitize";
import { searchSites } from "../search";
import type { Site, Visit } from "../types";
import { ApiError, type SmallWebApi } from "./contract";

/**
 * In-browser stand-in for the backend. Seed data is rebuilt on every load
 * (deterministic); anything published or visited here is kept in localStorage
 * so a refresh doesn't lose it. Remove the key to start over.
 */
const STORAGE_KEY = "smallweb.mock.v1";
const LATENCY_MS = 180;

interface Stored {
  sites: Site[];
  visits: Visit[];
}

const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS));

function personById(id: string) {
  return PEOPLE.find((p) => p.id === id) ?? { id, name: id };
}

export function createMockApi(): SmallWebApi {
  const seedSites: Site[] = SEED_SITES.map((s) => ({
    address: s.address,
    title: s.title,
    html: s.html,
    author: personById(s.authorId),
    createdAt: SEED_CREATED_AT,
  }));
  const seedVisits = buildSeedVisits();

  function load(): Stored {
    if (typeof window === "undefined") return { sites: [], visits: [] };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Stored) : { sites: [], visits: [] };
    } catch {
      return { sites: [], visits: [] };
    }
  }

  function save(data: Stored) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked: the session still works, it just won't survive a refresh */
    }
  }

  const allSites = () => [...seedSites, ...load().sites];

  return {
    async listPeople() {
      await wait();
      return PEOPLE;
    },
    async listSites() {
      await wait();
      return allSites()
        .map(({ address, title, author }) => ({ address, title, author }))
        .sort((a, b) => a.address.localeCompare(b.address));
    },
    async getSite(address) {
      await wait();
      return allSites().find((s) => s.address === address) ?? null;
    },
    async search(query) {
      await wait();
      return searchSites(allSites(), query);
    },
    async listVisits(personId) {
      await wait();
      return [...seedVisits, ...load().visits]
        .filter((v) => v.personId === personId)
        .sort((a, b) => b.at.localeCompare(a.at));
    },
    async recordVisit(input) {
      const data = load();
      const visit: Visit = { ...input, id: crypto.randomUUID(), at: new Date().toISOString() };
      data.visits.push(visit);
      save(data);
      return visit;
    },
    async publish(input) {
      await wait();
      if (!isAddress(input.address)) throw new ApiError("That isn’t a valid .zz address.", "invalid");
      if (!input.title.trim()) throw new ApiError("Give the page a title.", "invalid");
      if (allSites().some((s) => s.address === input.address)) {
        throw new ApiError(`${input.address} is already taken.`, "taken");
      }
      const { html } = sanitizeAuthorHtml(input.html);
      const site: Site = {
        address: input.address,
        title: input.title.trim(),
        html,
        author: personById(input.authorId),
        createdAt: new Date().toISOString(),
      };
      const data = load();
      data.sites.push(site);
      save(data);
      return site;
    },
  };
}
