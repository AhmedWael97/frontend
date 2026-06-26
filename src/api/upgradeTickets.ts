/**
 * Plan-upgrade tickets API (user + admin).
 * Attachments are sent as multipart FormData; the base client strips the JSON
 * Content-Type for FormData automatically.
 */
import client from "./client";
import { UPGRADE_TICKET_ROUTES } from "./routes";

export type TicketMessage = {
  id: number;
  is_admin: boolean;
  is_system: boolean;
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_mime: string | null;
  sender?: { id: number; name: string } | null;
  created_at: string;
};

export type UpgradeTicket = {
  id: number;
  user_id: number;
  requested_plan_id: number | null;
  subject: string;
  status: "open" | "pending_user" | "resolved" | "closed";
  last_message_at: string | null;
  resolved_at: string | null;
  created_at: string;
  requested_plan?: { id: number; name: string; slug: string } | null;
  user?: { id: number; name: string; email: string } | null;
  messages?: TicketMessage[];
};

export const upgradeTicketsApi = {
  // ── user ──
  list: () => client.get(UPGRADE_TICKET_ROUTES.index),
  create: (form: FormData) => client.post(UPGRADE_TICKET_ROUTES.store, form),
  show: (id: number) => client.get(UPGRADE_TICKET_ROUTES.show(id)),
  reply: (id: number, form: FormData) => client.post(UPGRADE_TICKET_ROUTES.reply(id), form),

  // ── admin ──
  adminList: (status?: string) =>
    client.get(UPGRADE_TICKET_ROUTES.adminIndex, { params: status ? { status } : {} }),
  adminShow: (id: number) => client.get(UPGRADE_TICKET_ROUTES.adminShow(id)),
  adminReply: (id: number, form: FormData) => client.post(UPGRADE_TICKET_ROUTES.adminReply(id), form),
  adminResolve: (id: number, planId: number, durationDays?: number) =>
    client.post(UPGRADE_TICKET_ROUTES.adminResolve(id), { plan_id: planId, duration_days: durationDays }),
};
