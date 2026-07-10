"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notificationPrefsApi } from "@/lib/api";
import { Bell, Check, Loader2 } from "lucide-react";

// Keys must match the backend notification_preferences.type CHECK constraint exactly.
const PREFERENCES = [
  { key: "alert", label: "Alert Rules", description: "Email when a metric threshold is crossed", channel: "email" as const },
  { key: "weekly_digest", label: "Weekly Report", description: "Summary of your analytics every Monday, on by default", channel: "email" as const },
  { key: "daily_digest", label: "Daily Report", description: "Same summary, every morning instead of once a week", channel: "email" as const },
  { key: "export_ready", label: "Export Ready", description: "Email when your export is ready to download", channel: "email" as const },
  { key: "subscription_changed", label: "Billing", description: "Receipts and plan change confirmations", channel: "email" as const },
];

const DEFAULT_ON = new Set(["alert", "weekly_digest", "export_ready", "subscription_changed"]);

function Content() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFERENCES.map((p) => [p.key, DEFAULT_ON.has(p.key)]))
  );
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => notificationPrefsApi.list().then((r) => r.data?.data ?? r.data),
  });

  // Overlay actually-saved rows on top of the defaults once loaded.
  useEffect(() => {
    const rows: Array<{ type: string; email: boolean }> = data ?? [];
    if (!rows.length) return;
    setPrefs((p) => {
      const next = { ...p };
      for (const row of rows) next[row.type] = row.email;
      return next;
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Array<{ type: string; in_app: boolean; email: boolean }>) => notificationPrefsApi.update(payload),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Notifications</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Choose how and when EYE contacts you</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-0.5">
          {PREFERENCES.map((p, i) => (
            <div key={p.key} className={`flex items-center gap-4 py-4 ${i < PREFERENCES.length - 1 ? "border-b border-outline-variant/10" : ""}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{p.label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{p.description}</p>
              </div>
              <button onClick={() => toggle(p.key)} className={`relative w-10 h-6 rounded-full transition-colors ${prefs[p.key] ? "bg-primary" : "bg-outline-variant/40"}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs[p.key] ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={() => saveMutation.mutate(
          PREFERENCES.map((p) => ({ type: p.key, in_app: true, email: prefs[p.key] }))
        )}
        disabled={saveMutation.isPending}
        className="min-w-32"
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Preferences"}
      </Button>
    </div>
  );
}

export default function NotificationsPage() {
  return <Content />;
}
