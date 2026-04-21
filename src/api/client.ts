/**
 * Base Axios client
 * – Attaches Bearer token from localStorage on every request
 * – Unwraps the backend envelope: { statusCode, statusText, data } → data
 * – Normalises errors so consumers always read err.message / err.errors
 * – Redirects to /login on 401
 */
import axios from "axios";
import { toast } from "@/lib/use-toast";

const baseURL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}/api/${
  process.env.NEXT_PUBLIC_API_VERSION || "v1"
}`;

const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Public-Key": process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || "",
    "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "",
  },
});

// ── Request: attach Bearer token ─────────────────────────────────────────────
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eye_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: unwrap envelope + normalise errors ─────────────────────────────
client.interceptors.response.use(
  (res) => {
    // Backend wraps every response: { statusCode, statusText, data: <payload>, meta? }
    if (res.data && "statusCode" in res.data && "data" in res.data) {
      const envelope = res.data;
      // Preserve meta for paginated responses so consumers can access data.data + data.meta
      if (envelope.meta !== undefined) {
        res.data = { data: envelope.data, meta: envelope.meta };
      } else {
        res.data = envelope.data;
      }
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("eye_token");
      window.location.href = "/en/auth/login";
      return Promise.reject(err);
    }

    // Unwrap nested body: { statusCode, statusText, data: { message, errors } }
    const body = err.response?.data;
    const payload = body?.data ?? body;
    err.message = payload?.message || err.message || "Something went wrong.";
    (err as any).errors = payload?.errors ?? null;

    if (typeof window !== "undefined") {
      toast.error(err.message);
    }

    return Promise.reject(err);
  }
);

export default client;
