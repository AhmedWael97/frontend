/**
 * Domains API
 * Covers: domains, exclusions, webhooks, alert-rules, pipelines, saved-views
 * Docs: api-contract.json → endpoints.domains
 */
import client from "./client";
import { DOMAIN_ROUTES } from "./routes";

// ── Core Domain CRUD ──────────────────────────────────────────────────────────
export const domainsApi = {
  /** GET /domains */
  list: () => client.get(DOMAIN_ROUTES.list),

  /** POST /domains */
  create: (data: { domain: string; settings?: Record<string, unknown>; timezone?: string }) =>
    client.post(DOMAIN_ROUTES.create, data),

  /** GET /domains/{domain} */
  show: (domain: number | string) => client.get(DOMAIN_ROUTES.show(domain)),

  /** PATCH /domains/{domain} */
  update: (
    domain: number | string,
    data: { active?: boolean; settings?: Record<string, unknown> }
  ) => client.patch(DOMAIN_ROUTES.update(domain), data),

  /** DELETE /domains/{domain} */
  delete: (domain: number | string) => client.delete(DOMAIN_ROUTES.delete(domain)),

  /** POST /domains/{domain}/rotate-token → { message, script_token, previous_script_token, token_rotated_at } */
  rotateToken: (domain: number | string) =>
    client.post(DOMAIN_ROUTES.rotateToken(domain)),

  /** GET /domains/{domain}/verify → { verified, script_verified_at } */
  verify: (domain: number | string) => client.get(DOMAIN_ROUTES.verify(domain)),

  /** GET /domains/{domain}/snippet → text/plain HTML script tag */
  snippet: (domain: number | string) => client.get(DOMAIN_ROUTES.snippet(domain)),
};

// ── Exclusions ────────────────────────────────────────────────────────────────
export const exclusionsApi = {
  /** GET /domains/{domain}/exclusions */
  list: (domain: number | string) =>
    client.get(DOMAIN_ROUTES.exclusionsList(domain)),

  /** POST /domains/{domain}/exclusions */
  create: (
    domain: number | string,
    data: { type: "ip" | "cookie" | "user_agent" | null; value: string | null }
  ) => client.post(DOMAIN_ROUTES.exclusionsCreate(domain), data),

  /** DELETE /domains/{domain}/exclusions/{exclusion} */
  delete: (domain: number | string, exclusion: number) =>
    client.delete(DOMAIN_ROUTES.exclusionsDelete(domain, exclusion)),
};

// ── Webhooks ──────────────────────────────────────────────────────────────────
export const webhooksApi = {
  /** GET /domains/{domain}/webhooks */
  list: (domain: number | string) =>
    client.get(DOMAIN_ROUTES.webhooksList(domain)),

  /** POST /domains/{domain}/webhooks */
  create: (
    domain: number | string,
    data: { url: string; secret?: string; events: string[]; is_active?: boolean }
  ) => client.post(DOMAIN_ROUTES.webhooksCreate(domain), data),

  /** PUT /domains/{domain}/webhooks/{webhook} */
  update: (
    domain: number | string,
    webhook: number,
    data: { url?: string; secret?: string; events?: string[]; is_active?: boolean }
  ) => client.put(DOMAIN_ROUTES.webhooksUpdate(domain, webhook), data),

  /** DELETE /domains/{domain}/webhooks/{webhook} */
  delete: (domain: number | string, webhook: number) =>
    client.delete(DOMAIN_ROUTES.webhooksDelete(domain, webhook)),

  /** POST /domains/{domain}/webhooks/{webhook}/test */
  test: (domain: number | string, webhook: number) =>
    client.post(DOMAIN_ROUTES.webhooksTest(domain, webhook)),

  /** GET /domains/{domain}/webhooks/{webhook}/logs */
  logs: (domain: number | string, webhook: number) =>
    client.get(DOMAIN_ROUTES.webhooksLogs(domain, webhook)),
};

// ── Alert Rules ───────────────────────────────────────────────────────────────
export const alertRulesApi = {
  /** GET /domains/{domain}/alert-rules */
  list: (domain: number | string) =>
    client.get(DOMAIN_ROUTES.alertRulesList(domain)),

  /** POST /domains/{domain}/alert-rules */
  create: (
    domain: number | string,
    data: {
      metric: string;
      condition: string;
      threshold: number;
      channel: "email" | "in_app";
    }
  ) => client.post(DOMAIN_ROUTES.alertRulesCreate(domain), data),

  /** PUT /domains/{domain}/alert-rules/{rule} */
  update: (domain: number | string, rule: number, data: Record<string, unknown>) =>
    client.put(DOMAIN_ROUTES.alertRulesUpdate(domain, rule), data),

  /** DELETE /domains/{domain}/alert-rules/{rule} */
  delete: (domain: number | string, rule: number) =>
    client.delete(DOMAIN_ROUTES.alertRulesDelete(domain, rule)),
};

// ── Pipelines ─────────────────────────────────────────────────────────────────
export const pipelinesApi = {
  /** GET /domains/{domain}/pipelines */
  list: (domain: number | string) =>
    client.get(DOMAIN_ROUTES.pipelinesList(domain)),

  /** POST /domains/{domain}/pipelines */
  create: (
    domain: number | string,
    data: {
      name: string;
      description?: string;
      steps?: { name: string; url_pattern: string; match_type?: string; order?: number }[];
    }
  ) => client.post(DOMAIN_ROUTES.pipelinesCreate(domain), data),

  /** PUT /domains/{domain}/pipelines/{pipeline} */
  update: (
    domain: number | string,
    pipeline: number,
    data: { name?: string; description?: string }
  ) => client.put(DOMAIN_ROUTES.pipelinesUpdate(domain, pipeline), data),

  /** DELETE /domains/{domain}/pipelines/{pipeline} */
  delete: (domain: number | string, pipeline: number) =>
    client.delete(DOMAIN_ROUTES.pipelinesDelete(domain, pipeline)),

  /** POST /domains/{domain}/pipelines/{pipeline}/steps */
  addStep: (
    domain: number | string,
    pipeline: number,
    data: { name: string; url_pattern: string; match_type?: string }
  ) => client.post(DOMAIN_ROUTES.pipelineStepAdd(domain, pipeline), data),

  /** DELETE /domains/{domain}/pipelines/{pipeline}/steps/{step} */
  removeStep: (domain: number | string, pipeline: number, step: number) =>
    client.delete(DOMAIN_ROUTES.pipelineStepRemove(domain, pipeline, step)),

  /** POST /domains/{domain}/pipelines/{pipeline}/reorder */
  reorderSteps: (
    domain: number | string,
    pipeline: number,
    steps: { id: number; position: number }[]
  ) => client.post(DOMAIN_ROUTES.pipelineStepsReorder(domain, pipeline), { steps }),
};

// ── Saved Views ───────────────────────────────────────────────────────────────
export const savedViewsApi = {
  /** GET /domains/{domain}/saved-views */
  list: (domain: number | string) =>
    client.get(DOMAIN_ROUTES.savedViewsList(domain)),

  /** POST /domains/{domain}/saved-views */
  create: (
    domain: number | string,
    data: { name: string; filters: Record<string, unknown> }
  ) => client.post(DOMAIN_ROUTES.savedViewsCreate(domain), data),

  /** DELETE /domains/{domain}/saved-views/{view} */
  delete: (domain: number | string, view: number) =>
    client.delete(DOMAIN_ROUTES.savedViewsDelete(domain, view)),
};
