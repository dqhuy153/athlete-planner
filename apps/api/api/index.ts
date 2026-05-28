/**
 * Vercel serverless entry for the NestJS API.
 * Vercel routes all /api/* requests through this single function.
 */
import type { IncomingMessage, ServerResponse } from 'http';
import { createNestApp } from '../src/main';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await createNestApp();
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
}
