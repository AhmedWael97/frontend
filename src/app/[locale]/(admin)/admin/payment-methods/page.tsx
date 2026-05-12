"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { CreditCard, Key, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type MethodTemplate = {
  id: "stripe" | "paypal" | "bank_transfer" | "paymob";
  name: string;
  icon: string;
  fields: Array<{ key: string; label: string; placeholder: string; secret?: boolean }>;
};

type PaymentMethod = {
  id: number;
  name: string;
  name_ar?: string;
  type: string;
  config?: Record<string, string>;
  is_active: boolean;
};

const GATEWAYS: MethodTemplate[] = [
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
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: "🏦",
    fields: [
      { key: "bank_name", label: "Bank Name", placeholder: "Example Bank" },
      { key: "account_name", label: "Account Name", placeholder: "EYE Analytics LLC" },
      { key: "account_number", label: "Account Number", placeholder: "0000000000" },
      { key: "iban", label: "IBAN", placeholder: "IBANXXXXXXXXXXXX" },
      { key: "swift", label: "SWIFT", placeholder: "ABCDEF12" },
    ],
  },
  {
    id: "paymob",
    name: "Paymob",
    icon: "💰",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "ZXlKaGJHY...", secret: true },
      { key: "integration_id", label: "Integration ID", placeholder: "123456" },
      { key: "iframe_id", label: "iFrame ID", placeholder: "654321" },
      { key: "hmac_secret", label: "HMAC Secret", placeholder: "abc123...", secret: true },
    ],
  },
];

interface GatewayCardProps {
  gateway: MethodTemplate;
  method?: PaymentMethod;
}

function GatewayCard({ gateway, method }: GatewayCardProps) {
  const client = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(gateway.fields.map((f) => [f.key, method?.config?.[f.key] ?? ""]))
  );
  const [show, setShow] = useState<Record<string, boolean>>({});

  const isEnabled = method?.is_active ?? false;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (method) {
        return adminApi.updatePaymentMethod(method.id, {
          config: values,
          name: method.name,
          name_ar: method.name_ar,
        });
      }

      return adminApi.createPaymentMethod({
        name: gateway.name,
        type: gateway.id,
        config: values,
        is_active: true,
      });
    },
    onSuccess: () => {
      toast.success(`${gateway.name} settings saved.`);
      client.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (method) {
        return adminApi.updatePaymentMethod(method.id, { is_active: !isEnabled });
      }

      return adminApi.createPaymentMethod({
        name: gateway.name,
        type: gateway.id,
        config: values,
        is_active: true,
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    },
  });

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

        {gateway.id === "bank_transfer" && (
          <p className="text-xs text-on-surface-variant text-center">
            These bank transfer details are shown to users on the Billing page.
          </p>
        )}

        {gateway.id === "paymob" && (
          <p className="text-xs text-on-surface-variant text-center">
            Credentials are also read from{" "}
            <code className="font-mono">PAYMOB_*</code> env vars at runtime.
            Saving here stores them in the database for display purposes.
          </p>
        )}
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
          <CreditCard className="w-6 h-6 text-primary" />
          Payment Methods
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Configure payment gateways and bank transfer details
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
            <GatewayCard key={gateway.id} gateway={gateway} method={findByType(gateway.id)} />
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
