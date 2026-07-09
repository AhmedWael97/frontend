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
  guest_token?: string;
  is_guest?: boolean;
  unread_for_user?: number;
  unread_for_admin?: number;
  user_name?: string;
  user_email?: string;
  last_message_at?: string | null;
  messages?: SupportMessage[];
}

export const supportApi = {
  /** POST /support/guest/chat — start a thread as a logged-out visitor */
  guestStart: (data: { name: string; email: string; body: string }) =>
    client.post("/support/guest/chat", data),

  /** GET /support/guest/chat/{token} */
  guestChat: (token: string, read = false) =>
    client.get(`/support/guest/chat/${token}`, { params: read ? { read: 1 } : undefined }),

  /** POST /support/guest/chat/{token}/messages */
  guestSend: (token: string, body: string) =>
    client.post(`/support/guest/chat/${token}/messages`, { body }),

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
