/**
 * Notifications API
 * Routes: /notifications/*, /notification-preferences
 * Docs: api-contract.json → endpoints.notifications + endpoints.notification_preferences
 */
import client from "./client";
import { NOTIFICATION_ROUTES, NOTIFICATION_PREF_ROUTES } from "./routes";

export const notificationsApi = {
  /** GET /notifications */
  list: (params?: { channel?: string }) =>
    client.get(NOTIFICATION_ROUTES.list, { params }),

  /** PATCH /notifications/{id}/read */
  markRead: (id: string) => client.patch(NOTIFICATION_ROUTES.markRead(id)),

  /** PATCH /notifications/read-all */
  markAllRead: () => client.patch(NOTIFICATION_ROUTES.markAllRead),

  /** DELETE /notifications/{id} */
  delete: (id: string) => client.delete(NOTIFICATION_ROUTES.delete(id)),

  /** DELETE /notifications  (clears all read notifications) */
  clearRead: () => client.delete(NOTIFICATION_ROUTES.clearRead),
};

export const notificationPrefsApi = {
  /** GET /notification-preferences */
  list: () => client.get(NOTIFICATION_PREF_ROUTES.list),

  /** PATCH /notification-preferences */
  update: (data: Array<{ type: string; in_app: boolean; email: boolean }>) =>
    client.patch(NOTIFICATION_PREF_ROUTES.update, data),
};
