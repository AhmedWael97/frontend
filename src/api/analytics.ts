/**
 * Analytics API
 * Routes:
 *   /domains/{domain}/analytics/*   — stats, pages, referrers, devices, geo, custom-events, funnel, realtime
 *   /analytics/{domainId}/*         — overview, visitors, identities, companies
 * Docs: api-contract.json → endpoints.analytics
 */
import client from "./client";
import { ANALYTICS_ROUTES } from "./routes";

type DateParams = {
  start?: string;
  end?: string;
  granularity?: "hour" | "day" | "week" | "month";
  limit?: number;
};

export const analyticsApi = {
  // ── /domains/{domain}/analytics/* ──────────────────────────────────────────

  /** GET /domains/{domain}/analytics/stats */
  stats: (domain: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.stats(domain), { params }),

  /** GET /domains/{domain}/analytics/pages */
  pages: (domain: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.pages(domain), { params }),

  /** GET /domains/{domain}/analytics/referrers */
  referrers: (domain: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.referrers(domain), { params }),

  /** GET /domains/{domain}/analytics/devices */
  devices: (domain: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.devices(domain), { params }),

  /** GET /domains/{domain}/analytics/geo */
  geo: (domain: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.geo(domain), { params }),

  /** GET /domains/{domain}/analytics/custom-events */
  customEvents: (domain: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.customEvents(domain), { params }),

  /** GET /domains/{domain}/analytics/pipelines/{pipeline}/funnel */
  funnel: (domain: number | string, pipeline: number | string, params?: DateParams) =>
    client.get(ANALYTICS_ROUTES.funnel(domain, pipeline), { params }),

  /** GET /domains/{domain}/analytics/realtime → { active_visitors, ts } */
  realtime: (domain: number | string) =>
    client.get(ANALYTICS_ROUTES.realtime(domain)),

  // ── /analytics/{domainId}/* ─────────────────────────────────────────────────

  /** GET /analytics/{domainId}/overview */
  overview: (domainId: number) =>
    client.get(ANALYTICS_ROUTES.overview(domainId)),

  /** GET /analytics/{domainId}/visitors */
  visitorsList: (domainId: number, params?: { page?: number; per_page?: number }) =>
    client.get(ANALYTICS_ROUTES.visitorsList(domainId), { params }),

  /** GET /analytics/{domainId}/visitors/{visitorId} */
  visitorsShow: (domainId: number, visitorId: string) =>
    client.get(ANALYTICS_ROUTES.visitorsShow(domainId, visitorId)),

  /** GET /analytics/{domainId}/identities */
  identitiesList: (domainId: number, params?: Record<string, unknown>) =>
    client.get(ANALYTICS_ROUTES.identitiesList(domainId), { params }),

  /** GET /analytics/{domainId}/identities/{externalId} */
  identitiesShow: (domainId: number, externalId: string) =>
    client.get(ANALYTICS_ROUTES.identitiesShow(domainId, externalId)),

  /** GET /analytics/{domainId}/companies  (Pro plan required) */
  companiesList: (domainId: number, params?: Record<string, unknown>) =>
    client.get(ANALYTICS_ROUTES.companiesList(domainId), { params }),

  /** GET /analytics/{domainId}/companies/{companyDomain}  (Pro plan required) */
  companiesShow: (domainId: number, companyDomain: string) =>
    client.get(ANALYTICS_ROUTES.companiesShow(domainId, companyDomain)),
};
