/**
 * API barrel export
 *
 * Usage:
 *   import { authApi, domainsApi, analyticsApi } from "@/api";
 *
 * Or import the raw client for one-off requests:
 *   import client from "@/api/client";
 */

// Base client
export { default as client } from "./client";

// Route constants (useful for unit tests / mocking)
export * from "./routes";

// Resource modules
export { authApi } from "./auth";
export { profileApi } from "./profile";
export { onboardingApi } from "./onboarding";
export { feedbackApi } from "./feedback";
export { npsApi } from "./nps";
export {
  domainsApi,
  exclusionsApi,
  webhooksApi,
  alertRulesApi,
  pipelinesApi,
  savedViewsApi,
} from "./domains";
export { analyticsApi } from "./analytics";
export { uxApi } from "./ux";
export { growthApi } from "./growth";
export { socialApi } from "./social";
export { replayApi } from "./replay";
export { aiApi } from "./ai";
export { chatbotApi } from "./chatbot";
export type { ChatbotMessage, ChatbotSession, ChatbotSessionSummary } from "./chatbot";
export { notificationsApi, notificationPrefsApi } from "./notifications";
export { billingApi } from "./billing";
export { exportsApi } from "./exports";
export { sitemapApi } from "./sitemap";
export type {
  SitemapGenerateParams,
  SitemapJobResponse,
  SitemapHistoryItem,
  SitemapUrlEntry,
  SitemapAiAnalysis,
  SitemapJobSummary,
  SitemapJobStatus,
  TrafficLabel,
} from "./sitemap";
export { reportsApi } from "./reports";
export { organizationApi } from "./organization";
export type { Organization, OrgMember, OrgInvitation, OrgDomain, OrgPromoCode } from "./organization";
export { upgradeTicketsApi } from "./upgradeTickets";
export type { UpgradeTicket, TicketMessage } from "./upgradeTickets";
export { gdprApi } from "./gdpr";
export { adminApi } from "./admin";
export { themeApi } from "./theme";
export { blogApi } from "./blog";
