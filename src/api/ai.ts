/**
 * AI API
 * Routes: /ai/{domainId}/*  +  /ai/tokens/*
 */
import client from "./client";
import { AI_ROUTES } from "./routes";

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

  /** POST /ai/{domainId}/analyze → 202 */
  analyze: (domainId: number) =>
    client.post(AI_ROUTES.analyze(domainId)),

  /**
   * GET /ai/{domainId}/quota
   * Returns: { ai_tokens, ai_free_used, is_free_plan, visitor_count,
   *            min_visitors, can_run_free, last_analyzed_at, token_packs }
   */
  quota: (domainId: number) =>
    client.get(AI_ROUTES.quota(domainId)),

  /** PATCH /ai/suggestions/{id}/dismiss */
  dismissSuggestion: (id: number) =>
    client.patch(AI_ROUTES.dismissSuggestion(id)),

  /** GET /ai/token-packs — available purchase packs */
  tokenPacks: () =>
    client.get(AI_ROUTES.tokenPacks),

  /**
   * POST /ai/tokens/purchase
   * Body: { pack: 'starter' | 'growth' | 'pro' }
   */
  purchaseTokens: (pack: "starter" | "growth" | "pro") =>
    client.post(AI_ROUTES.purchaseTokens, { pack }),
};
