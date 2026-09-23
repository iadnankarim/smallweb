import sanitizeHtml = require('sanitize-html');

/**
 * Server-side wall: the client sanitizer in web/src/lib/sanitize.ts is UX only.
 * Whatever an author submits is re-sanitized here before it ever reaches the database,
 * because the client is never trusted.
 *
 * Allow-list, not a forbid-list: only headings, text, lists, tables, inline style, links
 * and images survive. Everything else (script, iframe, form, event handler attributes,
 * javascript:/data: URLs) is discarded by omission rather than named one by one.
 */
const ALLOWED_TAGS = [...sanitizeHtml.defaults.allowedTags, 'style', 'img'];

export function sanitizeAuthorHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    // <style> is on sanitize-html's own risk list, but the real containment is the
    // sandboxed iframe with its own CSP (see web/src/lib/frame.ts) — this is the first
    // wall, not the only one.
    allowVulnerableTags: true,
  });
}
