/**
 * Growth API — leads CRM + compliant AI outreach.
 * Routes: /leads/*, /outreach/*
 */
import client from "./client";
import { GROWTH_ROUTES } from "./routes";

export const growthApi = {
  leads: (params?: { status?: string; source?: string; q?: string }) =>
    client.get(GROWTH_ROUTES.leads, { params }),
  createLead: (data: { company?: string; website?: string; contact_name?: string; email?: string; notes?: string }) =>
    client.post(GROWTH_ROUTES.leads, data),
  updateLead: (id: number, data: Record<string, unknown>) =>
    client.put(GROWTH_ROUTES.lead(id), data),
  deleteLead: (id: number) => client.delete(GROWTH_ROUTES.lead(id)),
  importLeads: (csv: string) => client.post(GROWTH_ROUTES.leadsImport, { csv }),
  warmLeads: () => client.post(GROWTH_ROUTES.leadsWarm, {}),
  draft: (leadId: number) => client.post(GROWTH_ROUTES.outreachDraft, { lead_id: leadId }),
  send: (leadId: number, subject: string, body: string) =>
    client.post(GROWTH_ROUTES.outreachSend, { lead_id: leadId, subject, body }),
};
