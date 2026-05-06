/**
 * AI Chatbot API
 * Routes: /chatbot/{domainId}/sessions/*
 */
import client from "./client";
import { CHATBOT_ROUTES } from "./routes";

export interface ChatbotMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  tokens_used: number;
  created_at: string;
}

export interface ChatbotSession {
  id: number;
  title: string;
  context_snapshot: Record<string, unknown>;
  messages: ChatbotMessage[];
}

export interface ChatbotSessionSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

export const chatbotApi = {
  /** GET /chatbot/{domainId}/sessions — sidebar list */
  sessions: (domainId: number) =>
    client.get<ChatbotSessionSummary[]>(CHATBOT_ROUTES.sessions(domainId)),

  /** POST /chatbot/{domainId}/sessions — create session + analytics snapshot */
  startSession: (domainId: number) =>
    client.post<ChatbotSession>(CHATBOT_ROUTES.sessions(domainId)),

  /** GET /chatbot/{domainId}/sessions/{sessionId} — load session + all messages */
  showSession: (domainId: number, sessionId: number) =>
    client.get<ChatbotSession>(CHATBOT_ROUTES.showSession(domainId, sessionId)),

  /** POST /chatbot/{domainId}/sessions/{sessionId}/message */
  sendMessage: (domainId: number, sessionId: number, message: string) =>
    client.post<ChatbotMessage>(CHATBOT_ROUTES.sendMessage(domainId, sessionId), { message }),

  /** DELETE /chatbot/{domainId}/sessions/{sessionId} */
  deleteSession: (domainId: number, sessionId: number) =>
    client.delete(CHATBOT_ROUTES.deleteSession(domainId, sessionId)),
};
