/**
 * @deprecated Import from "@/api" instead.
 *
 * This file is kept for backwards-compatibility only.
 * All API logic has moved to src/api/ (one file per resource).
 * Existing "@/lib/api" imports continue to work unchanged.
 */
export {
  client as default,
  authApi,
  profileApi,
  onboardingApi,
  domainsApi,
  exclusionsApi,
  webhooksApi,
  alertRulesApi,
  pipelinesApi,
  savedViewsApi,
  analyticsApi,
  uxApi,
  replayApi,
  aiApi,
  chatbotApi,
  notificationsApi,
  notificationPrefsApi,
  billingApi,
  exportsApi,
  sitemapApi,
  gdprApi,
  adminApi,
  themeApi,
} from "@/api";

// Legacy name kept by some components
export { reportsApi as sharedReportsApi, reportsApi } from "@/api";

// Named "api" instance used by a few older imports
export { client as api } from "@/api";
