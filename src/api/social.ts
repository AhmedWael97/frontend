/**
 * Social manager API — unified inbox from the Chrome extension + AI composer.
 * Docs: SOCIAL_ROUTES in ./routes.ts
 */
import client from "./client";
import { SOCIAL_ROUTES } from "./routes";

export const socialApi = {
  inbox: (params?: { platform?: string; status?: string }) =>
    client.get(SOCIAL_ROUTES.inbox, { params }),
  inboxSummary: () => client.get(SOCIAL_ROUTES.inboxSummary),
  inboxDraft: (id: number) => client.post(SOCIAL_ROUTES.inboxDraft(id)),
  inboxStatus: (id: number, status: "read" | "replied" | "dismissed") =>
    client.post(SOCIAL_ROUTES.inboxStatus(id), { status }),

  settingsShow: () => client.get(SOCIAL_ROUTES.settings),
  settingsUpdate: (openai_api_key: string | null) =>
    client.post(SOCIAL_ROUTES.settings, { openai_api_key }),

  posts: () => client.get(SOCIAL_ROUTES.posts),
  generateText: (data: { platform: string; language: string; prompt: string }) =>
    client.post(SOCIAL_ROUTES.postsGenerateText, data),
  generateImage: (prompt: string) =>
    client.post(SOCIAL_ROUTES.postsGenerateImage, { prompt }),
  createPost: (data: {
    platform: string;
    language: string;
    prompt?: string;
    content: string;
    image_url?: string | null;
    scheduled_at: string;
  }) => client.post(SOCIAL_ROUTES.posts, data),
  updatePost: (id: number, data: Record<string, unknown>) =>
    client.put(SOCIAL_ROUTES.post(id), data),
  deletePost: (id: number) => client.delete(SOCIAL_ROUTES.post(id)),
  setPostStatus: (id: number, status: "filled" | "posted" | "cancelled") =>
    client.post(SOCIAL_ROUTES.postStatus(id), { status }),
};
