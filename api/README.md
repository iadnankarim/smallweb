# Small Web API

NestJS + MongoDB backend for the small web browser. Sites, people, visits and search — the
seven routes the frontend expects, documented in `src/sites/sites.controller.ts` and
`src/visits/visits.controller.ts`.

## Setup

```bash
cp .env.example .env.local   # set MONGODB_URI to your MongoDB (Atlas or local)
npm install
```

## Run

```bash
npm run start:dev   # watch mode
npm run start:prod  # after npm run build
```

API docs (Swagger, for manual testing): http://localhost:4000/docs

## Seed

```bash
npm run seed
```

Deterministic and idempotent — every write is an upsert keyed by `address` (sites), `id`
(people, visits), so running it again never doubles the web. Seed content lives in
`src/seed/data.ts`, ported from `web/src/lib/mock/*.ts` so the real database and the
frontend's in-browser mock agree.

## Routes

| Method | Path | Notes |
|---|---|---|
| GET | `/people` | |
| GET | `/sites` | `SiteSummary[]`, author populated |
| GET | `/sites/:address` | 404 if nothing published there |
| POST | `/sites` | 409 if taken, 400 if invalid; HTML is re-sanitized server-side regardless of what the client sent |
| GET | `/search?q=` | full-text over page content, not just titles |
| GET | `/people/:id/visits` | newest first |
| POST | `/visits` | |

## Notable design points

- **The client is never trusted.** `POST /sites` sanitizes the submitted HTML again on the
  server (`src/common/sanitize.ts`) with the same forbidden-tag list the frontend uses for
  its own preview — publishing directly against this API bypasses the browser entirely, so
  the server has to be the real wall.
- **Search logic is shared, not reinvented.** `src/common/search.ts` and `src/common/text.ts`
  are ports of `web/src/lib/search.ts` / `text.ts`, so the mock and the real API score results
  the same way.
