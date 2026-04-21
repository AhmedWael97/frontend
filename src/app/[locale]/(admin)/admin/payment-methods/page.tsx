"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { CreditCard, Key, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const GATEWAYS = [
  {
    id: "stripe",
    name: "Stripe",
    icon: "💳",
    fields: [
      { key: "public_key", label: "Publishable Key", placeholder: "pk_live_..." },
      { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", secret: true },
      { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", secret: true },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "🅿️",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "AX..." },
      { key: "client_secret", label: "Client Secret", placeholder: "EG...", secret: true },
      { key: "mode", label: "Mode", placeholder: "sandbox | live" },
    ],
  },
];

interface GatewayCardProps {
  gateway: typeof GATEWAYS[0];
  savedData?: Record<string, string> & { enabled?: boolean };
}

function GatewayCard({ gateway, savedData }: GatewayCardProps) {
  const client = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(gateway.fields.map((f) => [f.key, savedData?.[f.key] ?? ""]))
  );
  const [show, setShow] = useState<Record<string, boolean>>({});

  const saveMutation = useMutation({
    mutationFn: () => adminApi.updatePaymentMethod(gateway.id, values),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-payment-methods"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: () => adminApi.updatePaymentMethod(gateway.id, { is_active: !isEnabled }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-payment-methods"] }),
  });

  const isEnabled = savedData?.enabled ?? false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">{gateway.icon}</span>
            {gateway.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Disabled
              </Badge>
            )}
            <Button
              size="sm"
              variant={isEnabled ? "outline" : "default"}
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
            >
              {toggleMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {gateway.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Key className="w-3 h-3" />
              {field.label}
            </label>
            <div className="relative">
              <Input
                type={field.secret && !show[field.key] ? "password" : "text"}
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="font-mono text-xs pr-16"
              />
              {field.secret && (
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, [field.key]: !s[field.key] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface"
                >
                  {show[field.key] ? "hide" : "show"}
                </button>
              )}
            </div>
          </div>
        ))}
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Saving…</>
          ) : (
            <>Save {gateway.name} Credentials</>
          )}
        </Button>
        {saveMutation.isSuccess && (
          <p className="text-xs text-green-500 text-center">Saved successfully</p>
        )}
      </CardContent>
    </Card>
  );
}

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payment-methods"],
    queryFn: () =>
      adminApi.listPaymentMethods().then((r) => r.data).catch(() => ({})),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payment Methods
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Configure payment gateways and credentials
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-surface-container-high rounded-lg animate-pulse" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GATEWAYS.map((gateway) => (
            <GatewayCard key={gateway.id} gateway={gateway} savedData={data?.[gateway.id]} />
          ))}
        </div>
      )}

      <Card className="border-dashed border-outline-variant/40">
        <CardContent className="p-6 text-center text-on-surface-variant text-sm">
          <p className="font-semibold">Need another payment gateway?</p>
          <p className="text-xs mt-1 opacity-60">Contact support or add a custom gateway via the API</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPaymentMethodsPage() {
  return <Content />;
}
