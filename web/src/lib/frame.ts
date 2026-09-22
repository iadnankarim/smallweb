/**
 * SECOND WALL: how a page someone else wrote is put on screen.
 *
 *  <iframe sandbox="allow-scripts" srcdoc="...">
 *    - no `allow-same-origin`: the page gets an opaque origin, so it cannot read
 *      this app's DOM, cookies, storage, or call our API as us.
 *    - no `allow-top-navigation`, `allow-popups`, `allow-forms`: it cannot move
 *      the app away, open windows, or submit anything.
 *  plus a Content-Security-Policy inside the document:
 *    - scripts only with our per-render nonce (so only the bridge below runs),
 *    - no network at all: no remote images, fonts, styles or fetches.
 *
 * Cost to authors: no JavaScript, no forms, no embeds, no remote images or fonts.
 * They keep headings, text, lists, tables, inline <style> and links to .zz addresses.
 *
 * The bridge script is ours. It turns link clicks into messages to the parent
 * (the parent decides where to go) and reports scroll so Back can restore it.
 */

export type FrameMessage =
  | { type: "navigate"; href: string; token: string }
  | { type: "scroll"; ratio: number; token: string }
  | { type: "ready"; token: string };

const BASE_CSS = `
  :root { color-scheme: light; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; color: #1f1f23;
         font: 19px/1.7 Georgia, "Times New Roman", serif; }
  .sw-page { box-sizing: border-box; min-height: 100vh;
             padding: 56px 64px 80px; background: #fff; }
  h1 { font-size: 44px; line-height: 1.08; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 22px; }
  h2 { font-size: 28px; line-height: 1.2; font-weight: 500; margin: 36px 0 12px; }
  h3 { font-size: 22px; margin: 28px 0 10px; }
  p, ul, ol, blockquote, pre, table { margin-top: 0; margin-bottom: 18px; }
  a { color: #2f6bf2; text-underline-offset: 3px; }
  blockquote { border-left: 3px solid #e4eaf3; padding-left: 16px; color: #364152; }
  pre, code { font-family: ui-monospace, Menlo, monospace; font-size: 0.85em; }
  img { max-width: 100%; height: auto; }
  hr { border: 0; border-top: 1px solid #e4eaf3; margin: 32px 0; }
`;

function bridge(token: string, restoreRatio: number): string {
  return `(function () {
  var T = ${JSON.stringify(token)}, R = ${Number.isFinite(restoreRatio) ? restoreRatio : 0};
  function send(m) { m.token = T; parent.postMessage(m, "*"); }
  document.addEventListener("click", function (e) {
    if (e.button !== 0) return;
    var el = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!el) return;
    var href = el.getAttribute("href") || "";
    if (href.charAt(0) === "#") return;
    e.preventDefault();
    send({ type: "navigate", href: href });
  }, true);
  document.addEventListener("submit", function (e) { e.preventDefault(); }, true);
  function room() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
  var pending = null;
  window.addEventListener("scroll", function () {
    if (pending) return;
    pending = setTimeout(function () {
      pending = null;
      send({ type: "scroll", ratio: Math.min(1, Math.max(0, window.scrollY / room())) });
    }, 120);
  }, { passive: true });
  function restore() { if (R > 0) window.scrollTo(0, R * room()); send({ type: "ready" }); }
  if (document.readyState === "complete") restore(); else window.addEventListener("load", restore);
})();`;
}

export function newFrameToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function buildSrcDoc({ html, token, restoreRatio }: { html: string; token: string; restoreRatio: number }): string {
  const csp = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "img-src data:",
    `script-src 'nonce-${token}'`,
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${BASE_CSS}</style></head><body><div class="sw-page">${html}</div><script nonce="${token}">${bridge(token, restoreRatio)}</script></body></html>`;
}

export function isFrameMessage(data: unknown, token: string): data is FrameMessage {
  if (!data || typeof data !== "object") return false;
  const m = data as Record<string, unknown>;
  if (m.token !== token) return false;
  if (m.type === "navigate") return typeof m.href === "string" && m.href.length < 2048;
  if (m.type === "scroll") return typeof m.ratio === "number" && m.ratio >= 0 && m.ratio <= 1;
  return m.type === "ready";
}
