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

export const onboardingApi = {
  /** GET /onboarding → { domain_added, script_installed, first_event_received, funnel_created } */
  show: () => client.get(ONBOARDING_ROUTES.show),

  /** PATCH /onboarding/{step} */
  markStep: (step: OnboardingStep) =>
    client.patch(ONBOARDING_ROUTES.markStep(step)),
};
