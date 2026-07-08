/**
 * Contact form API
 * Public submit + superadmin inbox.
 */
import client from "./client";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  body: string;
  status: "new" | "read";
  ip: string | null;
  created_at: string;
}

export const contactApi = {
  /** POST /contact — public */
  submit: (data: { name: string; email: string; phone?: string; subject: string; body: string }) =>
    client.post("/contact", data),

  /** GET /admin/contact-messages */
  adminList: () => client.get("/admin/contact-messages"),

  /** POST /admin/contact-messages/{id}/read */
  adminMarkRead: (id: number) => client.post(`/admin/contact-messages/${id}/read`),

  /** DELETE /admin/contact-messages/{id} */
  adminDelete: (id: number) => client.delete(`/admin/contact-messages/${id}`),
};
