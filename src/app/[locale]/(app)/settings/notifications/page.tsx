"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notificationPrefsApi } from "@/lib/api";
import { Bell, Check, Loader2 } from "lucide-react";

const qc = new QueryClient();

const PREFERENCES = [
  { key: "email_alerts", label: "Alert Rules", description: "Email when a metric threshold is crossed" },
  { key: "email_weekly_report", label: "Weekly Report", description: "Summary of your analytics every Monday" },
  { key: "email_exports", label: "Export Ready", description: "Email when your export is ready to download" },
  { key: "email_billing", label: "Billing", description: "Receipts and plan change confirmations" },
  { key: "email_security", label: "Security", description: "Login from new device, password changes" },
  { key: "push_alerts", label: "Push Alerts", description: "Browser push for real-time alert triggers" },
];

function Content() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email_alerts: true,
    email_weekly_report: true,
    email_exports: true,
    email_billing: true,
    email_security: true,
    push_alerts: false,
  });
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data: any) => notificationPrefsApi.update(data),
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

      <Button onClick={() => saveMutation.mutate(prefs)} disabled={saveMutation.isPending} className="min-w-32">
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Preferences"}
      </Button>
    </div>
  );
}

export default function NotificationsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
