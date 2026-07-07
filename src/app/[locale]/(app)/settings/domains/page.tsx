"use client";

import { Suspense, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { domainsApi, billingApi } from "@/lib/api";
import { eyeTrack } from "@/lib/track";
import { Plus, Copy, Check, RefreshCw, Globe, Trash2, Rocket, X, Loader2, Mail, CheckCircle2, PartyPopper, MessageCircle, ArrowRight, Download } from "lucide-react";

const INSTALL_PLATFORMS = [
  { key: "html", label: "HTML", hint: "Paste this right before the closing </head> tag, on every page of your site." },
  { key: "wordpress", label: "WordPress", hint: "Easiest: download our 1-click plugin below → WordPress admin → Plugins → Add New → Upload → Activate → paste your token. (No code, no theme editing.)" },
  { key: "shopify", label: "Shopify", hint: "Online Store → Themes → ⋯ → Edit code → layout/theme.liquid → paste just before </head> → Save." },
  { key: "gtm", label: "Tag Manager", hint: "New Tag → Custom HTML → paste the snippet → Trigger: All Pages → Submit & publish." },
];

function InstallGuide({ token, domainId, domainName }: { token: string; domainId: number; domainName: string }) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com").replace(/\/$/, "");
  // data-api points to the frontend proxy — absolute URL so the tracker resolves against the frontend origin, not the script source
  const snippet = `<script src="${appUrl}/tracker/eye.js" data-token="${token}" data-api="${appUrl}/api/collect" async></script>`;
  const locale = useLocale();
  const [tab, setTab] = useState("html");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<null | boolean>(null);

  const platform = INSTALL_PLATFORMS.find((p) => p.key === tab) ?? INSTALL_PLATFORMS[0];

  const checkVerified = async (): Promise<boolean> => {
    try {
      const r = await domainsApi.verify(domainId);
      return !!(r.data?.verified ?? r.data?.data?.verified);
    } catch {
      return false;
    }
  };

  // Auto-detect the first event live — the moment their site fires, celebrate.
  // Polls quietly in the background (every 4s, up to ~10 min) so the user never
  // has to click anything; installing the snippet just "lights up".
  useEffect(() => {
    if (verified) return;
    let stop = false;
    let n = 0;
    const tick = async () => {
      if (stop || n++ > 150) return;
      if (await checkVerified()) {
        if (!stop) { setVerified(true); eyeTrack("install_verified", { domain: domainName }); }
        return;
      }
      if (!stop) setTimeout(tick, 4000);
    };
    const t = setTimeout(tick, 4000);
    return () => { stop = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  const verify = async () => {
    setVerifying(true);
    const ok = await checkVerified();
    setVerified(ok ? true : false);
    if (ok) eyeTrack("install_verified", { domain: domainName });
    setVerifying(false);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Please add this tracking snippet to ${domainName}, just before </head> on every page:\n\n${snippet}`
  )}`;

  // Celebration — first event detected.
  if (verified === true) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
          <PartyPopper className="w-6 h-6 text-emerald-500" />
        </div>
        <p className="text-lg font-black text-on-surface">You&apos;re connected! 🎉</p>
        <p className="text-sm text-on-surface-variant mt-1">EYE is now receiving data from <span className="font-semibold text-on-surface">{domainName}</span>.</p>
        <a href={`/${locale}/dashboard`} className="inline-flex items-center gap-2 mt-4 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold hover:opacity-90">
          See my visitors <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </a>
      </div>
    );
  }

  const mailto = `mailto:?subject=${encodeURIComponent(`Please install EYE tracking on ${domainName}`)}&body=${encodeURIComponent(
    `Hi,\n\nPlease add this tracking snippet to ${domainName}, just before the closing </head> tag on every page:\n\n${snippet}\n\nThanks!`
  )}`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {INSTALL_PLATFORMS.map((p) => (
          <button key={p.key} onClick={() => setTab(p.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              tab === p.key ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
            }`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-on-surface-variant">{platform.hint}</p>
      {tab === "wordpress" && (
        <a href="/downloads/eye-analytics.zip" download className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold hover:bg-primary/15">
          <Download className="w-3.5 h-3.5" /> Download WordPress plugin
        </a>
      )}
      <div className="relative">
        <pre className="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono">{snippet}</pre>
        <button onClick={() => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-2 right-2 p-1.5 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
          {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={verify} disabled={verifying} className="gap-1.5">
          {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Verify installation
        </Button>
        <a href={mailto} className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary px-2 py-1.5 rounded-lg hover:bg-surface-container">
          <Mail className="w-3.5 h-3.5" /> Email developer
        </a>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-emerald-500 px-2 py-1.5 rounded-lg hover:bg-surface-container">
          <MessageCircle className="w-3.5 h-3.5" /> Send via WhatsApp
        </a>
        {verified === false && <span className="text-xs text-amber-500">Not detected yet. Publish the change, then open your site.</span>}
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80 mt-1">
        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
        Listening for your first visit — this page updates automatically the moment EYE detects your site.
      </p>
    </div>
  );
}

function ReplaySnippet({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com").replace(/\/$/, "");
  const snippet = `<script src="${appUrl}/tracker/eye.js" data-token="${token}" data-api="${appUrl}/api/collect" data-replay="true" async></script>\n<script src="${appUrl}/tracker/eye-replay.js" async></script>`;
  return (
    <div className="relative">
      <pre className="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono whitespace-pre-wrap break-all">{snippet}</pre>
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

  const createMutation = useMutation({
    mutationFn: (name: string) => domainsApi.create({ domain: name }),
    onSuccess: (_data, name) => {
      // Dogfooding: our own activation funnel. `first` marks the very first domain.
      eyeTrack("domain_store", { domain: name, first: (domains?.length ?? 0) === 0 });
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
            <h2 className="text-base font-bold text-on-surface">Welcome! Let&apos;s get your first website set up.</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Add the domain you want to track. You&apos;ll get a tracking script to paste into your website — it takes about 2 minutes.
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
          You&apos;ve reached your plan&apos;s domain limit ({domainLimit}). <a href="/settings/billing" className="font-semibold underline">Upgrade your plan</a> to add more.
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
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Install Tracking</p>
              <InstallGuide token={d.script_token} domainId={d.id} domainName={d.domain} />
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-on-surface">Enable recording on your site</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Add{" "}
                  <code className="bg-surface px-1 py-0.5 rounded font-mono">data-replay=&quot;true&quot;</code>{" "}
                  to your tracking snippet and load{" "}
                  <code className="bg-surface px-1 py-0.5 rounded font-mono">/tracker/eye-replay.js</code>{" "}
                  after it. Recordings respect the{" "}
                  <code className="font-mono">eye-block</code> / <code className="font-mono">eye-mask</code>{" "}
                  CSS classes for privacy.
                </p>
              </div>
              <ReplaySnippet token={d.script_token} />
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
  // useSearchParams() must be inside a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
