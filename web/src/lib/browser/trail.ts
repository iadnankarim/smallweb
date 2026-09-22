import type { TrailEntry } from "../types";

/**
 * The back/forward model, as a pure reducer.
 *
 *   entries: every stop in this session, oldest first
 *   index:   the stop being shown
 *
 *   entries[0 .. index-1]  -> reachable with Back
 *   entries[index+1 .. ]   -> reachable with Forward
 *
 * Rules (the ones every browser follows):
 *  - Going somewhere new from the middle of the stack drops everything after
 *    `index` first. That is "forward can be lost".
 *  - Back/Forward/jump only move `index`; they never add or remove entries.
 *  - Each entry remembers its own scroll, so returning shows the page as it was left.
 *
 * Nothing here talks to the network or the DOM, so it is easy to reason about
 * (and to unit test).
 */
export interface TrailState {
  entries: TrailEntry[];
  index: number;
}

export const EMPTY_TRAIL: TrailState = { entries: [], index: -1 };

export type TrailAction =
  | { type: "push"; entry: TrailEntry }
  | { type: "back" }
  | { type: "forward" }
  | { type: "jump"; index: number }
  | { type: "patch"; id: string; patch: Partial<Pick<TrailEntry, "kind" | "title">> }
  | { type: "scroll"; id: string; ratio: number };

export function trailReducer(state: TrailState, action: TrailAction): TrailState {
  switch (action.type) {
    case "push": {
      const kept = state.entries.slice(0, state.index + 1);
      const entries = [...kept, action.entry];
      return { entries, index: entries.length - 1 };
    }
    case "back":
      return canGoBack(state) ? { ...state, index: state.index - 1 } : state;
    case "forward":
      return canGoForward(state) ? { ...state, index: state.index + 1 } : state;
    case "jump": {
      if (action.index < 0 || action.index >= state.entries.length || action.index === state.index) return state;
      return { ...state, index: action.index };
    }
    case "patch":
    case "scroll": {
      let changed = false;
      const entries = state.entries.map((entry) => {
        if (entry.id !== action.id) return entry;
        const next = action.type === "patch" ? { ...entry, ...action.patch } : { ...entry, scrollRatio: action.ratio };
        changed = next.kind !== entry.kind || next.title !== entry.title || next.scrollRatio !== entry.scrollRatio;
        return changed ? next : entry;
      });
      return changed ? { ...state, entries } : state;
    }
  }
}

export function currentEntry(state: TrailState): TrailEntry | undefined {
  return state.index >= 0 ? state.entries[state.index] : undefined;
}

export function canGoBack(state: TrailState): boolean {
  return state.index > 0;
}

export function canGoForward(state: TrailState): boolean {
  return state.index >= 0 && state.index < state.entries.length - 1;
}
