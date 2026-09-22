import type { Via, Visit } from "../types";

/**
 * An hour of browsing across five people, generated deterministically:
 * the same seed always produces the same visits, ids and times.
 * Mira has been nearly everywhere; everyone else wanders a little.
 */
type Step = [kind: "page" | "search", address: string, via: Via, found?: boolean];

const TITLES: Record<string, string> = {
  "keeper.zz": "The Keeper’s Notes",
  "tidepool.zz": "What the low tide leaves behind",
  "saltmarsh.zz": "Saltmarsh Birds",
  "kelpkitchen.zz": "Kelp Kitchen",
  "nighttrains.zz": "Night Trains",
  "lanternmakers.zz": "The Lantern Makers",
  "orchardledger.zz": "The Orchard Ledger",
  "stargazing.zz": "Stargazing from a Flat Roof",
  "typewriter.zz": "Letters from a Typewriter",
  "riverstones.zz": "River Stones",
};

const TRAILS: Record<string, { start: string; steps: Step[] }> = {
  mira: {
    start: "2026-09-21T13:02:00.000Z",
    steps: [
      ["page", "keeper.zz", "typed"],
      ["page", "tidepool.zz", "link"],
      ["page", "kelpkitchen.zz", "link"],
      ["page", "orchardledger.zz", "link"],
      ["page", "riverstones.zz", "link"],
      ["page", "saltmarsh.zz", "link"],
      ["page", "nighttrains.zz", "link"],
      ["page", "stargazing.zz", "link"],
      ["page", "lanternmakers.zz", "link"],
      ["page", "stargazing.zz", "back"],
      ["page", "typewriter.zz", "link"],
      ["page", "harbourmap.zz", "typed", false],
      ["search", "low tide", "typed"],
      ["page", "tidepool.zz", "search"],
      ["page", "keeper.zz", "history"],
    ],
  },
  tomas: {
    start: "2026-09-21T13:10:00.000Z",
    steps: [
      ["page", "keeper.zz", "typed"],
      ["page", "lanternmakers.zz", "link"],
      ["page", "stargazing.zz", "link"],
      ["page", "lanternmakers.zz", "back"],
      ["page", "keeper.zz", "back"],
      ["page", "oldferry.zz", "link", false],
    ],
  },
  ines: {
    start: "2026-09-21T13:18:00.000Z",
    steps: [
      ["page", "tidepool.zz", "typed"],
      ["page", "harbourmap.zz", "link", false],
      ["page", "tidepool.zz", "back"],
      ["page", "saltmarsh.zz", "link"],
      ["page", "riverstones.zz", "link"],
    ],
  },
  dev: {
    start: "2026-09-21T13:25:00.000Z",
    steps: [
      ["page", "kelpkitchen.zz", "typed"],
      ["page", "moonbakery.zz", "link", false],
      ["page", "kelpkitchen.zz", "back"],
      ["search", "soup", "typed"],
      ["page", "nighttrains.zz", "search"],
    ],
  },
  kofi: {
    start: "2026-09-21T13:31:00.000Z",
    steps: [
      ["page", "orchardledger.zz", "typed"],
      ["page", "kelpkitchen.zz", "link"],
      ["page", "tidepool.zz", "link"],
      ["page", "keeper.zz", "link"],
      ["page", "oldferry.zz", "link", false],
      ["page", "keeper.zz", "back"],
      ["page", "orchardledger.zz", "typed"],
    ],
  },
};

export function buildSeedVisits(): Visit[] {
  const visits: Visit[] = [];
  for (const [personId, trail] of Object.entries(TRAILS)) {
    const t0 = new Date(trail.start).getTime();
    trail.steps.forEach(([kind, address, via, found = true], i) => {
      visits.push({
        id: `seed-${personId}-${String(i + 1).padStart(2, "0")}`,
        personId,
        kind,
        address,
        title: kind === "search" ? `Search: ${address}` : found ? (TITLES[address] ?? address) : address,
        via,
        found,
        at: new Date(t0 + i * 3 * 60_000 + (i % 3) * 25_000).toISOString(),
      });
    });
  }
  return visits;
}
