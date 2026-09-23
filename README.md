# Smallweb

A small web of one-page sites, and the browser you read them in.

- `web/` — Next.js + Tailwind v4 + shadcn/ui browser
- `api/` — NestJS + MongoDB backend

## Run the API

```bash
cd api
cp .env.example .env.local   # set MONGODB_URI to your MongoDB (Atlas or local)
npm install
npm run seed                 # deterministic — safe to run again, never doubles the web
npm run start:dev
```

API docs (Swagger, for manual testing): http://localhost:4000/docs

## Run the web

```bash
cd web
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:4000 to use the real API
npm install
npm run dev
```
