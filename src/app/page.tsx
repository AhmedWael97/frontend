import { redirect } from "next/navigation";

// Docker / standalone fallback — middleware should handle this normally,
// but redirect to /en as a safety net if the request somehow bypasses it.
export default function RootPage() {
  redirect("/en");
}
