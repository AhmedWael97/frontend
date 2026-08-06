/**
 * Onboarding API
 * Routes: /onboarding/*
 * Docs: api-contract.json → endpoints.onboarding
 */
import client from "./client";
import { ONBOARDING_ROUTES } from "./routes";

type OnboardingStep =
  | "domain_added"
  | "script_installed"
  | "first_event_received"
  | "funnel_created";

export type QuizDomain = {
  domain: string;
  seo_score?: number | null;
  speed_score?: number | null;
  pages_found?: number | null;
};

export type QuizPayload = {
  role: "site_owner" | "marketer";
  sites_managed: number;
  languages: string[];
  features: string[];
  domains: QuizDomain[];
  email?: string;
  name?: string;
};

export const onboardingApi = {
  /** GET /onboarding → { domain_added, script_installed, first_event_received, funnel_created } */
  show: () => client.get(ONBOARDING_ROUTES.show),

  /** PATCH /onboarding/{step} */
  markStep: (step: OnboardingStep) =>
    client.patch(ONBOARDING_ROUTES.markStep(step)),

  /** POST /onboarding/quiz — "get started" questionnaire finalize step. */
  submitQuiz: (payload: QuizPayload) => client.post("/onboarding/quiz", payload),
};
