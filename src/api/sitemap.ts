/**
 * Sitemap Creator API
 * Routes: /tools/sitemap/*
 */
import client from "./client";
import { SITEMAP_ROUTES } from "./routes";

export type SitemapJobStatus =
  | "pending"
  | "crawling"
  | "enriching"
  | "analyzing"
  | "completed"
  | "failed";

export type TrafficLabel =
  | "high_traffic"
  | "medium_traffic"
  | "low_traffic"
  | "zero_traffic"
  | "analytics_only"
  | "crawl_only";

export interface SitemapGenerateParams {
  url: string;
  max_pages?: number;
  date_range_days?: 30 | 60 | 90;
  include_zero_traffic?: boolean;
  include_analytics_only?: boolean;
  domain_id?: number;
}

export interface SitemapUrlEntry {
  url: string;
  priority: number;
  changefreq: string;
  lastmod: string | null;
  title: string | null;
  canonical: string | null;
  depth: number | null;
  status_code: number | null;
  traffic_label: TrafficLabel;
  pageviews: number;
  unique_visitors: number;
  entry_count: number;
  avg_depth: number | null;
  source: "crawl" | "analytics";
}

export interface SitemapJobSummary {
  total_urls: number;
  high_traffic: number;
  medium_traffic: number;
  low_traffic: number;
  zero_traffic: number;
  analytics_only: number;
  crawl_only: number;
}

export interface SitemapAiAnalysis {
  site_type: "ecommerce" | "blog" | "saas" | "portfolio" | "news" | "docs" | "other";
  site_type_confidence: number;
  strategy: string;
  priority_rules: Record<string, number>;
  changefreq_rules: Record<string, string>;
  recommendations: string[];
}

export interface SitemapJobResponse {
  id: number;
  status: SitemapJobStatus;
  pages_crawled: number;
  start_url: string;
  domain_id: number | null;
  analytics_mode: boolean;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  summary?: SitemapJobSummary;
  ai_analysis?: SitemapAiAnalysis;
  sitemap_result?: SitemapUrlEntry[];
}

export interface SitemapHistoryItem {
  id: number;
  start_url: string;
  status: SitemapJobStatus;
  pages_crawled: number;
  domain_id: number | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  config: Record<string, unknown>;
}

export const sitemapApi = {
  /** POST /tools/sitemap/generate — start a new sitemap job (202) */
  generate: (params: SitemapGenerateParams) =>
    client.post<{ job_id: number; status: string; max_pages: number; analytics_mode: boolean }>(
      SITEMAP_ROUTES.generate,
      params
    ),

  /** GET /tools/sitemap/history — list user's past jobs */
  history: () =>
    client.get<{ jobs: SitemapHistoryItem[] }>(SITEMAP_ROUTES.history),

  /** GET /tools/sitemap/{jobId} — poll job status */
  status: (jobId: number) =>
    client.get<SitemapJobResponse>(SITEMAP_ROUTES.status(jobId)),

  /** GET /tools/sitemap/{jobId}/download?format=xml|json|csv — file download */
  download: (jobId: number, format: "xml" | "json" | "csv") =>
    client.get(SITEMAP_ROUTES.download(jobId, format), { responseType: "blob" }),
};
