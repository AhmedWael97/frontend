/**
 * NPS ("how likely to recommend") API
 * Routes: /nps/*
 */
import client from "./client";

export const npsApi = {
  /** GET /nps/eligibility → { eligible: boolean } */
  eligibility: () => client.get("/nps/eligibility"),

  /** POST /nps  { score: 0-10, feedback?: string } */
  submit: (score: number, feedback?: string) => client.post("/nps", { score, feedback }),

  /** POST /nps/dismiss */
  dismiss: () => client.post("/nps/dismiss"),
};
