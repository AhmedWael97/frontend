/**
 * AI API
 * Routes: /ai/{domainId}/*
 * Docs: api-contract.json → endpoints.ai
 */
import client from "./client";
import { AI_ROUTES } from "./routes";

export const aiApi = {
  /** GET /ai/{domainId}/segments */
  segments: (domainId: number) => client.get(AI_ROUTES.segments(domainId)),

  /** GET /ai/{domainId}/suggestions */
  suggestions: (domainId: number) => client.get(AI_ROUTES.suggestions(domainId)),

  /** POST /ai/{domainId}/analyze → 202 { message, used, limit } */
  analyze: (domainId: number) => client.post(AI_ROUTES.analyze(domainId)),

  /** GET /ai/{domainId}/quota → { used, limit, last_analyzed_at } */
  quota: (domainId: number) => client.get(AI_ROUTES.quota(domainId)),

  /** PATCH /ai/suggestions/{id}/dismiss */
  dismissSuggestion: (id: number) => client.patch(AI_ROUTES.dismissSuggestion(id)),

  /** POST /ai/{domainId}/chat  (Phase-2 stub → always 503) */
  chat: (domainId: number, message: string) =>
    client.post(AI_ROUTES.chat(domainId), { message }),
};
