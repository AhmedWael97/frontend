/**
 * Blog CMS API — admin CRUD (superadmin) + public read.
 */
import client from "./client";

export const blogApi = {
  // ── Admin (superadmin) ──
  adminList: () => client.get("/admin/blog"),
  adminGet: (id: number) => client.get(`/admin/blog/${id}`),
  adminCreate: (form: FormData) => client.post("/admin/blog", form),
  // update via POST (multipart with optional image file)
  adminUpdate: (id: number, form: FormData) => client.post(`/admin/blog/${id}`, form),
  adminDelete: (id: number) => client.delete(`/admin/blog/${id}`),

  // ── Public ──
  list: () => client.get("/blog"),
  get: (slug: string) => client.get(`/blog/${slug}`),
};
