/**
 * UX Intelligence API
 * Routes: /ux/{domainId}/*
 * Docs: api-contract.json → endpoints.ux_intelligence
 */
import client from "./client";
import { UX_ROUTES } from "./routes";

type DateParams = { from?: string; to?: string };

export const uxApi = {
  /** GET /ux/{domainId}/score → { score, breakdown, calculated_at } */
  score: (domainId: number) => client.get(UX_ROUTES.score(domainId)),

  /** GET /ux/{domainId}/issues */
  issues: (
    domainId: number,
    params?: DateParams & { type?: string; url?: string; page?: number }
  ) => client.get(UX_ROUTES.issues(domainId), { params }),

  /** GET /ux/{domainId}/heatmap  (url is required) */
  heatmap: (domainId: number, params: DateParams & { url: string }) =>
    client.get(UX_ROUTES.heatmap(domainId), { params }),

  /** GET /ux/{domainId}/errors */
  errors: (domainId: number, params?: DateParams) =>
    client.get(UX_ROUTES.errors(domainId), { params }),

  /** GET /ux/{domainId}/scroll-depth */
  scrollDepth: (domainId: number, params?: DateParams) =>
    client.get(UX_ROUTES.scrollDepth(domainId), { params }),

  /** GET /ux/{domainId}/web-vitals */
  webVitals: (domainId: number, params?: DateParams) =>
    client.get(UX_ROUTES.webVitals(domainId), { params }),
};
