"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { parseOmnibox } from "../address";
import { api } from "../api";
import type { PageStatus, Person, SearchResult, Site, SiteSummary, TrailEntry, Via } from "../types";
import {
  EMPTY_TRAIL,
  canGoBack as trailCanGoBack,
  canGoForward as trailCanGoForward,
  currentEntry,
  trailReducer,
  type TrailAction,
  type TrailState,
} from "./trail";

/**
 * The browser engine: one trail per person, plus loading pages and recording visits.
 *
 * Flow of a navigation:
 *   1. an action (go / back / forward / jump / reload) notes WHICH entry it moves to
 *      and HOW (the `via`) in `pendingVisit`, then updates the trail;
 *   2. the load effect sees a new current entry, fetches the site or search results;
 *   3. once it knows whether the address exists, it records exactly one visit.
 * Switching person or restoring after a refresh changes the current entry too,
 * but sets no pendingVisit, so it is not recorded as a visit.
 */

interface PageState {
  entryId: string | null;
  status: PageStatus;
  site?: Site;
  results?: SearchResult[];
  error?: string;
}

interface BrowserContextValue {
  hydrated: boolean;
  people: Person[];
  personId: string;
  setPersonId: (id: string) => void;

  trail: TrailState;
  current: TrailEntry | undefined;
  previous: TrailEntry | undefined;
  canGoBack: boolean;
  canGoForward: boolean;
  page: PageState;

  directory: SiteSummary[];
  knownAddresses: Set<string>;
  historyVersion: number;
  visitCount: number | undefined;

  go: (text: string) => void;
  openAddress: (address: string, via: Via) => void;
  openSearch: (query: string, via: Via) => void;
  back: () => void;
  forward: () => void;
  jump: (index: number) => void;
  reload: () => void;
  reportScroll: (entryId: string, ratio: number) => void;
  sitePublished: (site: Site) => void;
}

const BrowserContext = createContext<BrowserContextValue | null>(null);

const PERSON_KEY = "smallweb.person";
const TRAILS_KEY = "smallweb.trails.v1";

type Trails = Record<string, TrailState>;
type TrailsAction = { type: "hydrate"; trails: Trails } | { type: "person"; personId: string; action: TrailAction };

function trailsReducer(state: Trails, action: TrailsAction): Trails {
  if (action.type === "hydrate") return action.trails;
  const before = state[action.personId] ?? EMPTY_TRAIL;
  const after = trailReducer(before, action.action);
  return after === before ? state : { ...state, [action.personId]: after };
}

function newId() {
  return crypto.randomUUID();
}

export function BrowserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonIdState] = useState("");
  const [trails, dispatchTrails] = useReducer(trailsReducer, {});
  const [page, setPage] = useState<PageState>({ entryId: null, status: "idle" });
  const [directory, setDirectory] = useState<SiteSummary[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [visitCount, setVisitCount] = useState<number>();
  const [reloadTick, setReloadTick] = useState(0);

  const pendingVisit = useRef<{ entryId: string; via: Via } | null>(null);
  const siteCache = useRef(new Map<string, Site | null>());

  const trail = trails[personId] ?? EMPTY_TRAIL;
  const current = currentEntry(trail);
  const previous = trail.index > 0 ? trail.entries[trail.index - 1] : undefined;
  const canGoBack = trailCanGoBack(trail);
  const canGoForward = trailCanGoForward(trail);

  const dispatch = useCallback(
    (action: TrailAction) => dispatchTrails({ type: "person", personId, action }),
    [personId],
  );

  /* ---------- start-up: people, directory, restore the session ---------- */

  const refreshDirectory = useCallback(async () => {
    try {
      setDirectory(await api.listSites());
    } catch {
      toast.error("Couldn’t load the list of sites.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listPeople();
        if (cancelled) return;
        setPeople(list);
        const saved = window.localStorage.getItem(PERSON_KEY);
        setPersonIdState(list.some((p) => p.id === saved) ? saved! : (list[0]?.id ?? ""));
        const stored = window.sessionStorage.getItem(TRAILS_KEY);
        if (stored) dispatchTrails({ type: "hydrate", trails: JSON.parse(stored) as Trails });
      } catch {
        toast.error("Couldn’t reach the small web.", { description: "Check that the API is running." });
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    void refreshDirectory();
    return () => {
      cancelled = true;
    };
  }, [refreshDirectory]);

  // Keep every person's trail for this tab, so a refresh restores Back/Forward.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(TRAILS_KEY, JSON.stringify(trails));
    } catch {
      /* ignore quota errors */
    }
  }, [trails, hydrated]);

  const setPersonId = useCallback((id: string) => {
    setPersonIdState(id);
    window.localStorage.setItem(PERSON_KEY, id);
  }, []);

  /* ---------- history count for the sidebar ---------- */

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    api
      .listVisits(personId)
      .then((v) => !cancelled && setVisitCount(v.length))
      .catch(() => !cancelled && setVisitCount(undefined));
    return () => {
      cancelled = true;
    };
  }, [personId, historyVersion]);

  /* ---------- load whatever the current entry points at ---------- */

  const recordIfPending = useCallback(
    (entry: TrailEntry, found: boolean, title: string) => {
      const pending = pendingVisit.current;
      if (!pending || pending.entryId !== entry.id) return;
      pendingVisit.current = null;
      api
        .recordVisit({
          personId,
          kind: entry.kind === "search" ? "search" : "page",
          address: entry.address,
          title,
          via: pending.via,
          found,
        })
        .then(() => setHistoryVersion((v) => v + 1))
        .catch(() => toast.error("That visit couldn’t be saved to history."));
    },
    [personId],
  );

  const currentId = current?.id;
  useEffect(() => {
    if (!hydrated) return;
    const entry = current;
    if (!entry) {
      setPage({ entryId: null, status: "idle" });
      return;
    }
    let cancelled = false;
    setPage({ entryId: entry.id, status: "loading" });

    (async () => {
      try {
        if (entry.kind === "search") {
          const results = await api.search(entry.address);
          if (cancelled) return;
          setPage({ entryId: entry.id, status: "results", results });
          recordIfPending(entry, true, `Search: ${entry.address}`);
          return;
        }

        let site = siteCache.current.get(entry.address);
        if (site === undefined) {
          site = await api.getSite(entry.address);
          siteCache.current.set(entry.address, site);
        }
        if (cancelled) return;

        if (site) {
          setPage({ entryId: entry.id, status: "shown", site });
          dispatch({ type: "patch", id: entry.id, patch: { kind: "page", title: site.title } });
          recordIfPending(entry, true, site.title);
        } else {
          setPage({ entryId: entry.id, status: "nowhere" });
          dispatch({ type: "patch", id: entry.id, patch: { kind: "nowhere", title: "Nowhere" } });
          recordIfPending(entry, false, entry.address);
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Something went wrong.";
        setPage({ entryId: entry.id, status: "idle", error: message });
        toast.error("That page couldn’t be loaded.", { description: message });
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run only when the entry itself changes (or on reload), not when its scroll updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, reloadTick, hydrated, personId]);

  /* ---------- navigation actions ---------- */

  const showBrowser = useCallback(() => {
    if (pathname !== "/") router.push("/");
  }, [pathname, router]);

  const openAddress = useCallback(
    (address: string, via: Via) => {
      const entry: TrailEntry = { id: newId(), kind: "page", address, title: address, via, scrollRatio: 0 };
      pendingVisit.current = { entryId: entry.id, via };
      dispatch({ type: "push", entry });
      showBrowser();
    },
    [dispatch, showBrowser],
  );

  const openSearch = useCallback(
    (query: string, via: Via) => {
      const entry: TrailEntry = { id: newId(), kind: "search", address: query, title: `Search: ${query}`, via, scrollRatio: 0 };
      pendingVisit.current = { entryId: entry.id, via };
      dispatch({ type: "push", entry });
      showBrowser();
    },
    [dispatch, showBrowser],
  );

  const go = useCallback(
    (text: string) => {
      const parsed = parseOmnibox(text);
      if (parsed.kind === "address") openAddress(parsed.address, "typed");
      else openSearch(parsed.query, "typed");
    },
    [openAddress, openSearch],
  );

  const moveTo = useCallback(
    (index: number, via: Via) => {
      const target = trail.entries[index];
      if (!target || index === trail.index) {
        showBrowser();
        return;
      }
      pendingVisit.current = { entryId: target.id, via };
      dispatch({ type: "jump", index });
      showBrowser();
    },
    [trail, dispatch, showBrowser],
  );

  const back = useCallback(() => canGoBack && moveTo(trail.index - 1, "back"), [canGoBack, moveTo, trail.index]);
  const forward = useCallback(() => canGoForward && moveTo(trail.index + 1, "forward"), [canGoForward, moveTo, trail.index]);
  const jump = useCallback(
    (index: number) => moveTo(index, index < trail.index ? "back" : "forward"),
    [moveTo, trail.index],
  );

  const reload = useCallback(() => {
    if (!current) return;
    siteCache.current.delete(current.address);
    pendingVisit.current = { entryId: current.id, via: "reload" };
    setReloadTick((t) => t + 1);
    showBrowser();
  }, [current, showBrowser]);

  const reportScroll = useCallback(
    (entryId: string, ratio: number) => dispatch({ type: "scroll", id: entryId, ratio }),
    [dispatch],
  );

  const sitePublished = useCallback(
    (site: Site) => {
      siteCache.current.set(site.address, site);
      void refreshDirectory();
      openAddress(site.address, "typed");
    },
    [openAddress, refreshDirectory],
  );

  const knownAddresses = useMemo(() => new Set(directory.map((s) => s.address)), [directory]);

  const value: BrowserContextValue = {
    hydrated,
    people,
    personId,
    setPersonId,
    trail,
    current,
    previous,
    canGoBack,
    canGoForward,
    page,
    directory,
    knownAddresses,
    historyVersion,
    visitCount,
    go,
    openAddress,
    openSearch,
    back,
    forward,
    jump,
    reload,
    reportScroll,
    sitePublished,
  };

  return <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>;
}

export function useBrowser(): BrowserContextValue {
  const ctx = useContext(BrowserContext);
  if (!ctx) throw new Error("useBrowser must be used inside <BrowserProvider>");
  return ctx;
}
