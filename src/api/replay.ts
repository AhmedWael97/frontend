/**
 * Session Replay API
 * Routes: /replay/{domainId}/*
 */
import client from "./client";
import { REPLAY_ROUTES } from "./routes";

type DateParams = { from?: string; to?: string };

export const replayApi = {
  /** GET /replay/{domainId}/sessions — list recorded sessions */
  sessions: (domainId: number, params?: DateParams) =>
    client.get(REPLAY_ROUTES.sessions(domainId), { params }),

  /** GET /replay/{domainId}/sessions/{sessionId} — stream rrweb events */
  events: (domainId: number, sessionId: string) =>
    client.get(REPLAY_ROUTES.events(domainId, sessionId)),

  /** DELETE /replay/{domainId}/sessions/{sessionId} — GDPR delete */
  destroy: (domainId: number, sessionId: string) =>
    client.delete(REPLAY_ROUTES.destroy(domainId, sessionId)),
};
