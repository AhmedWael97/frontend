/**
 * AI API
 * Routes: /ai/{domainId}/*  +  /ai/tokens/*
 */
import client from "./client";
import { AI_ROUTES } from "./routes";

/** PHP associative arrays serialize as JSON objects — convert to a typed array. */
function normalizeTokenPacks(raw: unknown) {
  if (!raw || Array.isArray(raw)) return raw as any[];
  return Object.entries(raw as Record<string, any>).map(([id, pack]) => ({
    id,
    label:       pack.label       ?? id,
    tokens:      pack.tokens      ?? 0,
    price:       pack.price_usd   ?? pack.price ?? 0,
    description: pack.description ?? `${pack.tokens ?? 0} AI analysis tokens`,
  }));
}

export const aiApi = {
  /** GET /ai/{domainId}/segments */
  segments: (domainId: number) =>
    client.get(AI_ROUTES.segments(domainId)),

  /** GET /ai/{domainId}/suggestions */
  suggestions: (domainId: number) =>
    client.get(AI_ROUTES.suggestions(domainId)),

  /** GET /ai/{domainId}/report — full latest AI report content */
  report: (domainId: number) =>
    client.get(AI_ROUTES.report(domainId)),

  /** GET /ai/{domainId}/reports — list of past AI reports (id, type, status, created_at) */
  reports: (domainId: number) =>
    client.get(AI_ROUTES.reports(domainId)),

  /** POST /ai/{domainId}/analyze → 202 */
  analyze: (domainId: number) =>
    client.post(AI_ROUTES.analyze(domainId)),

  /**
   * GET /ai/{domainId}/quota
   * Normalises token_packs from PHP assoc-array object to JS array.
   */
  quota: (domainId: number) =>
    client.get(AI_ROUTES.quota(domainId)).then((r) => {
      if (r.data?.token_packs) {
        r.data.token_packs = normalizeTokenPacks(r.data.token_packs);
      }
      return r;
    }),

  /** PATCH /ai/suggestions/{id}/dismiss */
  dismissSuggestion: (id: number) =>
    client.patch(AI_ROUTES.dismissSuggestion(id)),

  /** GET /ai/token-packs — normalises PHP assoc-array object to JS array */
  tokenPacks: () =>
    client.get(AI_ROUTES.tokenPacks).then((r) => {
      r.data = normalizeTokenPacks(r.data);
      return r;
    }),

  /**
   * POST /ai/tokens/purchase
   * Body: { pack: 'starter' | 'growth' | 'pro' }
   */
  purchaseTokens: (pack: "starter" | "growth" | "pro") =>
    client.post(AI_ROUTES.purchaseTokens, { pack }),
};
