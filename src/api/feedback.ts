/**
 * Experience feedback API
 * Routes: /feedback/*
 */
import client from "./client";

export const feedbackApi = {
  /** GET /feedback/status → { submitted: boolean } */
  status: () => client.get("/feedback/status"),

  /** POST /feedback  { rating: 1-4, comment?: string } */
  submit: (rating: number, comment?: string) =>
    client.post("/feedback", { rating, comment }),
};
