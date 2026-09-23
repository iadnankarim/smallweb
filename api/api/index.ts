import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { createApp } from '../src/create-app';

/**
 * Vercel serverless entry point. Wraps the same Nest app that src/main.ts runs
 * as a long-lived server, but calls app.init() instead of app.listen() and hands
 * the underlying Express instance to the request/response pair Vercel gives us.
 * Cached across invocations of the same lambda instance so Nest (and the Mongo
 * connection) isn't rebuilt on every request.
 */
let cachedServer: express.Express | undefined;

async function bootstrapServer(): Promise<express.Express> {
  if (!cachedServer) {
    const expressInstance = express();
    const app = await createApp(new ExpressAdapter(expressInstance));
    await app.init();
    cachedServer = expressInstance;
  }
  return cachedServer;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrapServer();
  server(req as unknown as express.Request, res as unknown as express.Response);
}
