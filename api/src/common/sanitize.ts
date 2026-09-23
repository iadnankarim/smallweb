import DOMPurify from 'isomorphic-dompurify';

/**
 * Server-side wall: the client sanitizer in web/src/lib/sanitize.ts is UX only.
 * Whatever an author submits is re-sanitized here before it ever reaches the database,
 * because the client is never trusted. Same forbidden list as the frontend, so behaviour matches.
 */
const FORBID_TAGS = [
  'script',
  'noscript',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'portal',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'link',
  'meta',
  'base',
];
const FORBID_ATTR = ['srcset', 'ping', 'formaction', 'action', 'target'];

export function sanitizeAuthorHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
  });
}
