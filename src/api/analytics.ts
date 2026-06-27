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
  compare?: boolean;
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

  /** POST /domains/{domain}/analytics/custom-events/store */
  customEventsStore: (
    domain: number | string,
    data: { name: string; props?: Record<string, unknown>; url?: string }
  ) => client.post(ANALYTICS_ROUTES.customEventsStore(domain), data),

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

  /** GET /analytics/{domainId}/campaigns */
  campaigns: (domainId: number, params?: Record<string, unknown>) =>
    client.get(ANALYTICS_ROUTES.campaigns(domainId), { params }),

  /** GET /analytics/{domainId}/ltv — lifetime value by acquisition source */
  ltv: (domainId: number, params?: { days?: number }) =>
    client.get(ANALYTICS_ROUTES.ltv(domainId), { params }),

  /** SEO rank tracking */
  seoRank: (domainId: number) => client.get(ANALYTICS_ROUTES.seoRank(domainId)),
  seoRankAddKeyword: (domainId: number, keyword: string) =>
    client.post(ANALYTICS_ROUTES.seoRankKeywords(domainId), { keyword }),
  seoRankImport: (domainId: number, csv: string) =>
    client.post(ANALYTICS_ROUTES.seoRankImport(domainId), { csv }),
  seoRankDeleteKeyword: (domainId: number, id: number) =>
    client.delete(ANALYTICS_ROUTES.seoRankKeywordDelete(domainId, id)),

  /** GET /portfolio/overview — cross-site KPI table */
  portfolioOverview: (params?: { days?: number }) =>
    client.get(ANALYTICS_ROUTES.portfolioOverview(), { params }),

  /** GET /portfolio/triage — ranked cross-site issues */
  portfolioTriage: (params?: { days?: number }) =>
    client.get(ANALYTICS_ROUTES.portfolioTriage(), { params }),

  /** GET /analytics/{domainId}/retention */
  retention: (domainId: number, params?: { period?: "week" | "month"; cohorts?: number }) =>
    client.get(ANALYTICS_ROUTES.retention(domainId), { params }),

  /** GET /analytics/{domainId}/experiments */
  experimentsList: (domainId: number) =>
    client.get(ANALYTICS_ROUTES.experiments(domainId)),

  /** POST /analytics/{domainId}/experiments */
  experimentsCreate: (domainId: number, data: Record<string, unknown>) =>
    client.post(ANALYTICS_ROUTES.experiments(domainId), data),

  /** PUT /analytics/{domainId}/experiments/{id} */
  experimentsUpdate: (domainId: number, id: number, data: Record<string, unknown>) =>
    client.put(ANALYTICS_ROUTES.experimentUpdate(domainId, id), data),

  /** GET /analytics/{domainId}/experiments/{id}/results */
  experimentResults: (domainId: number, id: number) =>
    client.get(ANALYTICS_ROUTES.experimentResults(domainId, id)),

  /** DELETE /analytics/{domainId}/experiments/{id} */
  experimentsDelete: (domainId: number, id: number) =>
    client.delete(ANALYTICS_ROUTES.experimentDelete(domainId, id)),

  /** GET /analytics/{domainId}/experiments/growthbook/status */
  gbStatus: (domainId: number) => client.get(ANALYTICS_ROUTES.gbStatus(domainId)),

  /** GET /analytics/{domainId}/experiments/growthbook */
  gbList: (domainId: number) => client.get(ANALYTICS_ROUTES.gbList(domainId)),

  /** GET /analytics/{domainId}/experiments/growthbook/{id}/results */
  gbResults: (domainId: number, id: string) =>
    client.get(ANALYTICS_ROUTES.gbResults(domainId, id)),

  /** Convert.com experiments */
  convertStatus: (domainId: number) => client.get(ANALYTICS_ROUTES.convertStatus(domainId)),
  convertList: (domainId: number) => client.get(ANALYTICS_ROUTES.convertList(domainId)),
  convertResults: (domainId: number, id: string) =>
    client.get(ANALYTICS_ROUTES.convertResults(domainId, id)),

  /** GET /analytics/{domainId}/ad-spend */
  adSpendList: (domainId: number, params?: { start?: string; end?: string }) =>
    client.get(ANALYTICS_ROUTES.adSpend(domainId), { params }),

  /** POST /analytics/{domainId}/ad-spend */
  adSpendStore: (
    domainId: number,
    data: {
      date: string;
      source: string;
      campaign?: string;
      medium?: string;
      spend: number;
      currency?: string;
      clicks?: number;
      impressions?: number;
    }
  ) => client.post(ANALYTICS_ROUTES.adSpend(domainId), data),

  /** POST /analytics/{domainId}/ad-spend/import */
  adSpendImport: (domainId: number, csv: string) =>
    client.post(ANALYTICS_ROUTES.adSpendImport(domainId), { csv }),

  /** DELETE /analytics/{domainId}/ad-spend/{id} */
  adSpendDelete: (domainId: number, id: number) =>
    client.delete(ANALYTICS_ROUTES.adSpendDelete(domainId, id)),

  /** GET /analytics/{domainId}/engaged-visitors */
  engagedVisitors: (domainId: number, params?: Record<string, unknown>) =>
    client.get(ANALYTICS_ROUTES.engagedVisitors(domainId), { params }),

  /** GET /analytics/{domainId}/summary */
  summary: (domainId: number, params?: Record<string, unknown>) =>
    client.get(ANALYTICS_ROUTES.summary(domainId), { params }),

  /** GET /analytics/{domainId}/bot-stats */
  botStats: (domainId: number) =>
    client.get(ANALYTICS_ROUTES.botStats(domainId)),

  /** GET /analytics/{domainId}/usage — monthly events vs plan limit (upsell) */
  usage: (domainId: number) =>
    client.get(ANALYTICS_ROUTES.usage(domainId)),
};
