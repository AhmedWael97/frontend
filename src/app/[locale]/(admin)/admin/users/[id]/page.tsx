"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ShieldAlert, UserX, MailCheck } from "lucide-react";

const qc = new QueryClient();

function Content() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUser(Number(id)).then((r) => r.data),
  });

  const impersonateMutation = useMutation({
    mutationFn: () => adminApi.impersonateUser(Number(id)),
    onSuccess: (res) => {
      localStorage.setItem("eye-impersonate-token", res.data.token);
      router.push(`/${locale}/dashboard`);
    },
  });

  const banMutation = useMutation({
    mutationFn: () => adminApi.banUser(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user", id] }),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: () => adminApi.verifyUser(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user", id] }),
  });

  if (isLoading) return <div className="h-40 bg-surface-container rounded-xl animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">{user?.name}</h1>
          <p className="text-on-surface-variant text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {!user?.email_verified_at && (
            <Button variant="outline" onClick={() => verifyEmailMutation.mutate()} disabled={verifyEmailMutation.isPending}>
              <MailCheck className="w-4 h-4" /> Verify User
            </Button>
          )}
          <Button variant="outline" onClick={() => impersonateMutation.mutate()} disabled={impersonateMutation.isPending}>
            <ShieldAlert className="w-4 h-4" /> Impersonate
          </Button>
          <Button variant="destructive" onClick={() => banMutation.mutate()} disabled={banMutation.isPending}>
            <UserX className="w-4 h-4" /> {user?.banned_at ? "Unban" : "Ban"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Role", <Badge key="role" variant={user?.role === "admin" ? "warning" : "secondary"}>{user?.role}</Badge>],
              ["Status", <Badge key="status" variant={user?.banned_at ? "error" : "success"}>{user?.banned_at ? "Banned" : "Active"}</Badge>],
              ["Email Verified", user?.email_verified_at ? formatDate(user.email_verified_at) : "—"],
              ["2FA", user?.totp_enabled ? "Enabled" : "Disabled"],
              ["Registered", formatDate(user?.created_at)],
              ["Timezone", user?.timezone || "UTC"],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between py-2 border-b border-outline-variant/10 last:border-0">
                <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
                <span className="text-sm text-on-surface">{value as any}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Subscription</CardTitle></CardHeader>
          <CardContent>
            {user?.subscription ? (
              <div className="space-y-2">
                <p className="text-lg font-black text-on-surface">{user.subscription.plan?.name}</p>
                <Badge variant={user.subscription.status === "active" ? "success" : "secondary"}>{user.subscription.status}</Badge>
                <p className="text-xs text-on-surface-variant">Expires {user.subscription.current_period_end ? formatDate(user.subscription.current_period_end) : "—"}</p>
              </div>
            ) : <p className="text-on-surface-variant text-sm">Free tier (no active subscription)</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
