/**
 * Live customer-service chat.
 * User: /support/chat  ·  Superadmin: /admin/support-chats
 */
import client from "./client";

export interface SupportMessage {
  id: number;
  is_admin: boolean;
  body: string;
  created_at: string;
}

export interface SupportChat {
  id: number;
  status: "open" | "closed";
  unread_for_user?: number;
  unread_for_admin?: number;
  user_name?: string;
  user_email?: string;
  last_message_at?: string | null;
  messages?: SupportMessage[];
}

export const supportApi = {
  /** GET /support/chat — pass read=true only when the user actually opens it */
  myChat: (read = false) =>
    client.get("/support/chat", { params: read ? { read: 1 } : undefined }),

  /** POST /support/chat/messages */
  send: (body: string) => client.post("/support/chat/messages", { body }),

  /** GET /admin/support-chats */
  adminList: (status?: string) =>
    client.get("/admin/support-chats", { params: status ? { status } : undefined }),

  /** GET /admin/support-chats/{id} */
  adminShow: (id: number) => client.get(`/admin/support-chats/${id}`),

  /** POST /admin/support-chats/{id}/messages */
  adminReply: (id: number, body: string) =>
    client.post(`/admin/support-chats/${id}/messages`, { body }),

  /** POST /admin/support-chats/{id}/close */
  adminClose: (id: number) => client.post(`/admin/support-chats/${id}/close`),
};
