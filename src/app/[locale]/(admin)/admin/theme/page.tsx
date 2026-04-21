"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { themeApi } from "@/lib/api";
import { Palette, Check, Loader2 } from "lucide-react";

const DEFAULT_COLORS = {
  primary: "#c0c1ff",
  secondary: "#d0bcff",
  background: "#0b1326",
  surface: "#171f33",
};

function Content() {
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [logo, setLogo] = useState("");
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data: any) => themeApi.adminUpdate(data),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Theme</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Customize the platform appearance for all users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><Palette className="w-4 h-4" /> Brand Colors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={value} onChange={(e) => setColors(c => ({ ...c, [key]: e.target.value }))} className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{key.replace(/_/g, " ")}</label>
                  <Input value={value} onChange={(e) => setColors(c => ({ ...c, [key]: e.target.value }))} className="mt-1 font-mono text-xs h-8" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Logo URL</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://your-cdn.com/logo.svg" />
              {logo && <img src={logo} alt="logo preview" className="h-10 object-contain" />}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Color Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ background: value }} />
                    <span className="text-xs text-on-surface-variant capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate({ colors, logo_url: logo })} disabled={saveMutation.isPending} className="min-w-36">
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Theme"}
      </Button>
    </div>
  );
}

export default function AdminThemePage() {
  return <Content />;
}
