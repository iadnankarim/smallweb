"use client";

import type { FormEvent, ReactNode, Ref } from "react";
import type { PageStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";

interface OmniboxProps {
  ref?: Ref<HTMLInputElement>;
  value: string;
  onValueChange: (value: string) => void;
  /** Called with the trimmed text when the person presses Enter. */
  onSubmit: (value: string) => void;
  status: PageStatus;
  /** Tile or icon shown at the start of the bar. */
  leading?: ReactNode;
}

/**
 * The one place an address is typed. A valid .zz address is opened;
 * anything else becomes a search (see parseOmnibox).
 */
export function Omnibox({ ref, value, onValueChange, onSubmit, status, leading }: OmniboxProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim();
    if (text) onSubmit(text);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-card pr-1.5 pl-3 shadow-pill transition-shadow focus-within:border-brand-line focus-within:ring-4 focus-within:ring-brand/10"
    >
      {leading}
      <label htmlFor="omnibox" className="sr-only">
        Address, or words to search
      </label>
      <input
        ref={ref}
        id="omnibox"
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        placeholder="Type an address like tidepool.zz, or words to search"
        autoComplete="off"
        spellCheck={false}
        className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:font-sans placeholder:text-faint"
      />
      <StatusBadge status={status} />
      <kbd className="hidden shrink-0 rounded-full border border-line bg-soft px-2 py-0.5 font-mono text-[11px] text-subtle lg:inline">
        ⌘L
      </kbd>
    </form>
  );
}
