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
  visitor_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  password_confirmation?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  click_id?: string;
};

export type QuizProgressPayload = Partial<Omit<QuizPayload, "visitor_id">> & {
  visitor_id: string;
  step_reached: number;
};

export const onboardingApi = {
  /** GET /onboarding → { domain_added, script_installed, first_event_received, funnel_created } */
  show: () => client.get(ONBOARDING_ROUTES.show),

  /** PATCH /onboarding/{step} */
  markStep: (step: OnboardingStep) =>
    client.patch(ONBOARDING_ROUTES.markStep(step)),

  /** POST /onboarding/quiz — "get started" questionnaire finalize step. */
  submitQuiz: (payload: QuizPayload) => client.post("/onboarding/quiz", payload),

  /** POST /onboarding/quiz/progress — autosave, fired on every wizard step. */
  saveQuizProgress: (payload: QuizProgressPayload) => client.post("/onboarding/quiz/progress", payload),
};
