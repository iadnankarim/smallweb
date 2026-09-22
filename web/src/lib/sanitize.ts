import DOMPurify from "dompurify";

/**
 * FIRST WALL: strip what an author may not ship.
 * This runs on publish (preview + mock store) and again right before rendering,
 * so HTML that reached the database some other way is still cleaned.
 * The backend must run its own sanitizer too: the client is never trusted.
 *
 * The SECOND WALL is the iframe itself (see lib/frame.ts): even if something
 * slipped through here, the page runs in an opaque origin with a strict CSP.
 */
const FORBID_TAGS = [
  "script", "noscript", "iframe", "frame", "frameset", "object", "embed", "applet", "portal",
  "form", "input", "button", "textarea", "select", "option", "link", "meta", "base",
];
const FORBID_ATTR = ["srcset", "ping", "formaction", "action", "target"];

export interface SanitizeReport {
  html: string;
  /** Human-readable list of what was removed, e.g. "<script>" or "onerror on <img>". */
  removed: string[];
}

export function sanitizeAuthorHtml(dirty: string): SanitizeReport {
  if (typeof window === "undefined") return { html: "", removed: [] };
  const purifier = DOMPurify(window);
  const html = purifier.sanitize(dirty, {
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true, // keep a leading <style> block
  });

  const removed: string[] = [];
  for (const item of purifier.removed as unknown as Array<Record<string, unknown>>) {
    if ("element" in item && item.element instanceof Element) {
      removed.push(`<${item.element.nodeName.toLowerCase()}>`);
    } else if ("attribute" in item && item.attribute && "from" in item && item.from instanceof Element) {
      const attr = item.attribute as Attr;
      removed.push(`${attr.name} on <${item.from.nodeName.toLowerCase()}>`);
    }
  }
  return { html, removed: Array.from(new Set(removed)) };
}
