"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { User, Key, Copy, Check, RefreshCw } from "lucide-react";

const qc = new QueryClient();

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  timezone: z.string().optional(),
});

function Content() {
  const { user, setUser } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState(user?.api_key || "");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", email: user?.email || "", timezone: user?.timezone || "" },
  });

  const profileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (res) => setUser(res.data.user || res.data),
  });

  const rotateKeyMutation = useMutation({
    mutationFn: () => authApi.rotateApiKey(),
    onSuccess: (res) => { setApiKey(res.data.api_key); if (user) setUser({ ...user, api_key: res.data.api_key }); },
  });

  const copyKey = () => { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Profile</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile form */}
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><User className="w-4 h-4" /> Account Info</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                <Input {...register("name")} placeholder="Your Name" />
                {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Email</label>
                <Input {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Timezone</label>
                <Input {...register("timezone")} placeholder="UTC" />
              </div>
              {profileMutation.isSuccess && <p className="text-xs text-green-700 dark:text-green-400">Profile updated!</p>}
              {profileMutation.isError && <p className="text-xs text-error">Failed to update profile</p>}
              <Button type="submit" disabled={profileMutation.isPending} className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><Key className="w-4 h-4" /> API Key</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-on-surface-variant">Use this key to access the EYE API from your own applications.</p>
            <div className="relative">
              <Input value={apiKey ? `${apiKey.slice(0, 8)}${"•".repeat(24)}` : "No API key yet"} readOnly className="font-mono text-xs pr-20" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={copyKey} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <Button variant="outline" onClick={() => rotateKeyMutation.mutate()} disabled={rotateKeyMutation.isPending} className="w-full">
              <RefreshCw className="w-4 h-4" /> Rotate API Key
            </Button>
            <p className="text-xs text-on-surface-variant">Rotating the key will invalidate the old one immediately.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
