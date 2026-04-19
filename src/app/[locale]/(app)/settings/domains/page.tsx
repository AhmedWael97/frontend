"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { domainsApi } from "@/lib/api";
import { Plus, Copy, Check, RefreshCw, Globe, Trash2 } from "lucide-react";

function ScriptSnippet({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com").replace(/\/$/, "");
  // data-api points to the frontend proxy — absolute URL so the tracker resolves against the frontend origin, not the script source
  const snippet = `<script src="${appUrl}/tracker/eye.js" data-token="${token}" data-api="${appUrl}/api/collect" async></script>`;
  return (
    <div className="relative">
      <pre className="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono">{snippet}</pre>
      <button onClick={() => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-2 right-2 p-1.5 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function Content() {
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [createError, setCreateError] = useState("");

  const { data: domains, isLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: () => domainsApi.list().then((r) => r.data?.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => domainsApi.create(name),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["domains"] }); setNewDomain(""); setAdding(false); setCreateError(""); },
    onError: (e: any) => { setCreateError(e.response?.data?.message || "Failed to add domain."); },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Domains</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Manage tracked websites and tracking scripts</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add Domain</Button>
      </div>

      {adding && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-3">
              <Input value={newDomain} onChange={(e) => { setNewDomain(e.target.value); setCreateError(""); }} placeholder="example.com" className="max-w-sm" autoFocus />
              <Button onClick={() => createMutation.mutate(newDomain)} disabled={!newDomain || createMutation.isPending}>Add</Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setCreateError(""); }}>Cancel</Button>
            </div>
            {createError && <p className="text-sm text-error">{createError}</p>}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 bg-surface-container rounded-xl animate-pulse" />)
      ) : (domains || []).map((d: any) => (
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
      {!isLoading && !domains?.length && (
        <div className="text-center py-12 text-on-surface-variant text-sm">No domains yet. Add your first website above.</div>
      )}
    </div>
  );
}

export default function DomainsPage() {
  return <Content />;
}
