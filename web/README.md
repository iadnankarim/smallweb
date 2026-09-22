# Smallweb — web (Next.js)

The browser: address bar, links, back/forward, history, search and publish.

## Run

```bash
cd web
cp .env.example .env.local     # leave NEXT_PUBLIC_API_URL empty to use the built-in mock web
npm install
npm run dev                    # http://localhost:3000
```

To use the NestJS backend instead, set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local` and restart.

To reset the mock web (published sites and new visits), clear the `smallweb.mock.v1` key in the browser's localStorage.

## Where things live

| Concern | File |
|---|---|
| Back/forward model (pure reducer) | `src/lib/browser/trail.ts` |
| Loading pages, recording visits, per-person trails | `src/lib/browser/browser-provider.tsx` |
| Containing untrusted HTML (sandbox + CSP + bridge) | `src/lib/frame.ts`, `src/components/browser/page-frame.tsx` |
| Stripping scripts/handlers/forms | `src/lib/sanitize.ts` |
| Address rules, what the bar treats as a search | `src/lib/address.ts` |
| Search ranking (mock) | `src/lib/search.ts` |
| API contract, HTTP + mock clients | `src/lib/api/` |
| Seed web (sites, people, visits) | `src/lib/mock/` |

## API the backend should expose

```
GET  /people                 -> Person[]
GET  /sites                  -> SiteSummary[]
GET  /sites/:address         -> Site            (404 if nothing lives there)
GET  /search?q=              -> SearchResult[]
GET  /people/:id/visits      -> Visit[]         (newest first)
POST /visits                 -> Visit
POST /sites                  -> Site            (409 if the address is taken)
```

Shapes are in `src/lib/types.ts`.
