"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { domainsApi, billingApi } from "@/lib/api";
import { Plus, Copy, Check, RefreshCw, Globe, Trash2, Rocket, X } from "lucide-react";

function ScriptSnippet({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com").replace(/\/$/, "");
  // data-api points to the frontend proxy — absolute URL so the tracker resolves against the frontend origin, not the script source
  const snippet = `<script src="${appUrl}/tracker/eye.js" data-token="${token}" data-api="${appUrl}/api/collect" async></script>`;
  return (
    <div className="relative">
      <pre className="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono">{snippet}</pre>
      <button onClick={() => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-2 right-2 p-1.5 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
        {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function Content() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isWelcome = searchParams?.get("welcome") === "1";
  const [showWelcome, setShowWelcome] = useState(isWelcome);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(isWelcome); // auto-open add form for new users
  const [createError, setCreateError] = useState("");

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const r = await domainsApi.list();
      return r.data;
    },
    select: (data: any): any[] => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

  const { data: billing } = useQuery({
    queryKey: ["billing"],
    queryFn: () => billingApi.show().then((r) => r.data),
    staleTime: 60_000,
  });

  const domainLimit: number = billing?.limits?.domains ?? 1;
  const planName: string = billing?.subscription?.plan?.name ?? "Free";
    mutationFn: (name: string) => domainsApi.create({ domain: name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      setNewDomain("");
      setAdding(false);
      setCreateError("");
      setShowWelcome(false);
    },
    onError: (e: any) => {
      const fieldErrors = e.errors?.domain?.[0] || e.errors ? Object.values(e.errors || {}).flat().join(" ") : null;
      setCreateError(fieldErrors || e.message || "Failed to add domain.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => domainsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });

  const rotateMutation = useMutation({
    mutationFn: (id: number) => domainsApi.rotateToken(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });

  return (
    <div className="space-y-6">
      {/* Welcome / onboarding banner */}
      {showWelcome && (
        <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-on-surface">Welcome! Let's get your first website set up.</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Add the domain you want to track. You'll get a tracking script to paste into your website — it takes about 2 minutes.
            </p>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Domains</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Manage your tracked websites and tracking scripts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">{planName} plan</p>
            <p className="text-sm font-semibold text-on-surface">{domains.length} / {domainLimit} domain{domainLimit !== 1 ? "s" : ""}</p>
          </div>
          {!adding && (
            <Button onClick={() => setAdding(true)} disabled={domains.length >= domainLimit}>
              <Plus className="w-4 h-4" /> Add Domain
            </Button>
          )}
        </div>
      </div>
      {domains.length >= domainLimit && !adding && (
        <div className="rounded-lg border border-error/20 bg-error-container/20 px-4 py-3 text-sm text-error">
          You've reached your plan's domain limit ({domainLimit}). <a href="/settings/billing" className="font-semibold underline">Upgrade your plan</a> to add more.
        </div>
      )}

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-on-surface">Add a new domain</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-on-surface-variant">Enter your website domain without http:// — e.g. <code className="text-primary">example.com</code></p>
            <div className="flex gap-3">
              <Input value={newDomain} onChange={(e) => { setNewDomain(e.target.value); setCreateError(""); }} placeholder="example.com" className="max-w-sm" autoFocus />
              <Button onClick={() => createMutation.mutate(newDomain)} disabled={!newDomain || createMutation.isPending}>
                {createMutation.isPending ? "Adding…" : "Add"}
              </Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setCreateError(""); setShowWelcome(false); }}>Cancel</Button>
            </div>
            {createError && <p className="text-sm text-error">{createError}</p>}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 bg-surface-container rounded-xl animate-pulse" />)
      ) : domains.map((d: any) => (
        <Card key={d.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Globe className="w-5 h-5 text-primary" /></div>
                <div>
                  <CardTitle className="text-base font-bold text-on-surface">{d.domain}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={d.active ? "success" : "secondary"}>{d.active ? "Active" : "Inactive"}</Badge>
                    <span className="text-xs text-on-surface-variant font-mono">{d.script_token}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => rotateMutation.mutate(d.id)} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary" title="Rotate token">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMutation.mutate(d.id)} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Tracking Script</p>
              <ScriptSnippet token={d.script_token} />
            </div>
            {d.quota && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant font-semibold uppercase tracking-widest">Monthly Events</span>
                  <span className="text-on-surface">{d.quota.used?.toLocaleString()} / {d.quota.limit?.toLocaleString()}</span>
                </div>
                <Progress value={(d.quota.used / d.quota.limit) * 100} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {!isLoading && !domains?.length && !adding && (
        <div className="rounded-xl border border-dashed border-outline-variant/40 p-10 text-center space-y-3">
          <Globe className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
          <p className="text-on-surface-variant text-sm">No domains added yet.</p>
          <Button size="sm" onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add your first website</Button>
        </div>
      )}
    </div>
  );
}

export default function DomainsPage() {
  return <Content />;
}
