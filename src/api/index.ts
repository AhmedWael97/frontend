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
export { replayApi } from "./replay";
export { aiApi } from "./ai";
export { notificationsApi, notificationPrefsApi } from "./notifications";
export { billingApi } from "./billing";
export { exportsApi } from "./exports";
export { reportsApi } from "./reports";
export { gdprApi } from "./gdpr";
export { adminApi } from "./admin";
export { themeApi } from "./theme";
