"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { CreditCard, Key, CheckCircle2, XCircle, Loader2, FlaskConical, Rocket } from "lucide-react";

type Field = { key: string; label: string; placeholder: string; secret?: boolean };

type PaymentMethod = {
  id: number;
  name: string;
  name_ar?: string;
  type: string;
  config?: Record<string, any>;
  is_active: boolean;
};

// ── Bank transfer (generic) ────────────────────────────────────────────────
const BANK_FIELDS: Field[] = [
  { key: "bank_name", label: "Bank Name", placeholder: "Example Bank" },
  { key: "account_name", label: "Account Name", placeholder: "EYE Analytics LLC" },
  { key: "account_number", label: "Account Number", placeholder: "0000000000" },
  { key: "iban", label: "IBAN", placeholder: "IBANXXXXXXXXXXXX" },
  { key: "swift", label: "SWIFT", placeholder: "ABCDEF12" },
];

// ── Paymob credentials (per environment) ────────────────────────────────────
const PAYMOB_FIELDS: Field[] = [
  { key: "api_key", label: "API Key", placeholder: "ZXlKaGJHY...", secret: true },
  { key: "secret_key", label: "Secret Key", placeholder: "egy_sk_...", secret: true },
  { key: "public_key", label: "Public Key", placeholder: "egy_pk_..." },
  { key: "integration_id", label: "Integration ID", placeholder: "123456" },
  { key: "iframe_id", label: "iFrame ID", placeholder: "654321" },
  { key: "hmac_secret", label: "HMAC Secret", placeholder: "DC724CB5...", secret: true },
];

function SecretInput({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
        <Key className="w-3 h-3" /> {field.label}
      </label>
      <div className="relative">
        <Input
          type={field.secret && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="font-mono text-xs ltr:pr-16 rtl:pl-16"
        />
        {field.secret && (
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface">
            {show ? "hide" : "show"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Paymob card with Test/Production environments ───────────────────────────
function PaymobCard({ method }: { method?: PaymentMethod }) {
  const client = useQueryClient();
  const cfg = method?.config ?? {};
  // Legacy flat config (api_key at top level) is treated as the Test set.
  const legacyFlat: Record<string, string> = cfg.api_key
    ? { api_key: cfg.api_key, integration_id: cfg.integration_id, iframe_id: cfg.iframe_id, hmac_secret: cfg.hmac_secret }
    : {};

  const initSet = (m: Record<string, any> | undefined): Record<string, string> =>
    Object.fromEntries(PAYMOB_FIELDS.map((f) => [f.key, String(m?.[f.key] ?? "")]));

  const [mode, setMode] = useState<"test" | "production">(cfg.mode === "production" ? "production" : "test");
  const [test, setTest] = useState<Record<string, string>>(initSet(cfg.test ?? legacyFlat));
  const [prod, setProd] = useState<Record<string, string>>(initSet(cfg.production));

  const isEnabled = method?.is_active ?? false;
  const active = mode === "test" ? test : prod;
  const setActive = mode === "test" ? setTest : setProd;

  const buildConfig = () => ({ mode, test, production: prod });

  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Verifies the SAVED active-mode creds against Paymob and shows the result.
  const testMutation = useMutation({
    mutationFn: () => adminApi.testPaymob().then((r) => (r.data?.data ?? r.data) as { ok: boolean; message: string }),
    onSuccess: (d) => setTestResult({ ok: !!d?.ok, message: d?.message ?? "" }),
    onError: () => setTestResult({ ok: false, message: "Test request failed — try again." }),
  });

  const saveMutation = useMutation({
    // Saving always enables Paymob (auto-activate) so checkout works immediately.
    mutationFn: async () =>
      method
        ? adminApi.updatePaymentMethod(method.id, { config: buildConfig(), name: method.name, is_active: true })
        : adminApi.createPaymentMethod({ name: "Paymob", type: "paymob", config: buildConfig(), is_active: true }),
    onSuccess: () => {
      toast.success("Paymob settings saved.");
      client.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      setTestResult(null);
      // Auto-verify against Paymob right after saving.
      setTimeout(() => testMutation.mutate(), 400);
    },
    onError: () => toast.error("Could not save Paymob settings."),
  });

  const toggleMutation = useMutation({
    mutationFn: async () =>
      method
        ? adminApi.updatePaymentMethod(method.id, { is_active: !isEnabled })
        : adminApi.createPaymentMethod({ name: "Paymob", type: "paymob", config: buildConfig(), is_active: true }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-payment-methods"] }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💰</span> Paymob
          </CardTitle>
          <div className="flex items-center gap-2">
            {isEnabled
              ? <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</Badge>
              : <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Disabled</Badge>}
            <Button size="sm" variant={isEnabled ? "outline" : "default"} onClick={() => toggleMutation.mutate()} disabled={toggleMutation.isPending}>
              {toggleMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : isEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment toggle */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Environment</p>
          <div className="flex gap-2">
            {([
              { v: "test", label: "Test", icon: FlaskConical },
              { v: "production", label: "Production", icon: Rocket },
            ] as const).map(({ v, label, icon: Icon }) => (
              <button key={v} type="button" onClick={() => setMode(v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  mode === v
                    ? v === "production"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-500"
                    : "border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            Editing the <strong>{mode}</strong> keys. The active environment (what live checkout uses) is whatever is selected here when you save — currently <strong>{mode}</strong>. Enter keys under the same environment you intend to go live with.
          </p>
        </div>

        {/* Active environment keys */}
        <div className="space-y-3 rounded-xl border border-outline-variant/20 p-3">
          {PAYMOB_FIELDS.map((f) => (
            <SecretInput key={f.key} field={f} value={active[f.key] ?? ""} onChange={(val) => setActive((s) => ({ ...s, [f.key]: val }))} />
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1">
            {saveMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin ltr:mr-2 rtl:ml-2" /> Saving…</> : <>Save &amp; activate</>}
          </Button>
          <Button size="sm" variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
            {testMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test connection"}
          </Button>
        </div>

        {testResult && (
          <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${testResult.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <p className="text-xs text-on-surface-variant text-center">
          Add the webhook URL <code className="font-mono">/api/v1/billing/paymob/webhook</code> in your Paymob dashboard. Keys here override <code className="font-mono">PAYMOB_*</code> env vars.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Generic card (bank transfer) ─────────────────────────────────────────────
function GatewayCard({ method }: { method?: PaymentMethod }) {
  const client = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(BANK_FIELDS.map((f) => [f.key, String(method?.config?.[f.key] ?? "")]))
  );
  const isEnabled = method?.is_active ?? false;

  const saveMutation = useMutation({
    mutationFn: async () =>
      method
        ? adminApi.updatePaymentMethod(method.id, { config: values, name: method.name })
        : adminApi.createPaymentMethod({ name: "Bank Transfer", type: "bank_transfer", config: values, is_active: true }),
    onSuccess: () => {
      toast.success("Bank transfer details saved.");
      client.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async () =>
      method
        ? adminApi.updatePaymentMethod(method.id, { is_active: !isEnabled })
        : adminApi.createPaymentMethod({ name: "Bank Transfer", type: "bank_transfer", config: values, is_active: true }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-payment-methods"] }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><span className="text-xl">🏦</span> Bank Transfer</CardTitle>
          <div className="flex items-center gap-2">
            {isEnabled
              ? <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</Badge>
              : <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Disabled</Badge>}
            <Button size="sm" variant={isEnabled ? "outline" : "default"} onClick={() => toggleMutation.mutate()} disabled={toggleMutation.isPending}>
              {toggleMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : isEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {BANK_FIELDS.map((f) => (
          <SecretInput key={f.key} field={f} value={values[f.key] ?? ""} onChange={(val) => setValues((s) => ({ ...s, [f.key]: val }))} />
        ))}
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
          {saveMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin ltr:mr-2 rtl:ml-2" /> Saving…</> : <>Save bank details</>}
        </Button>
        <p className="text-xs text-on-surface-variant text-center">These details are shown to users on the Billing page.</p>
      </CardContent>
    </Card>
  );
}

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payment-methods"],
    queryFn: async () => {
      const res = await adminApi.listPaymentMethods();
      return (res.data ?? []) as PaymentMethod[];
    },
  });

  const methods = Array.isArray(data) ? data : [];
  const findByType = (type: string) => methods.find((m) => m.type === type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" /> Payment Methods
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          EYE accepts <strong>Paymob</strong> (cards, wallets, Fawry) and <strong>Bank Transfer</strong>.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}><CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((j) => <div key={j} className="h-10 bg-surface-container-high rounded-lg animate-pulse" />)}
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymobCard method={findByType("paymob")} />
          <GatewayCard method={findByType("bank_transfer")} />
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentMethodsPage() {
  return <Content />;
}
