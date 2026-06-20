"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyticsApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { CodeEditor } from "./CodeEditor";
import { Plus, Trash2, FlaskConical, GitBranch, Scale } from "lucide-react";

export type ExpVariation = {
  vkey?: string; name: string; weight: number;
  js_code?: string | null; css_code?: string | null; redirect_url?: string | null; is_control?: boolean;
};
export type ExpFull = {
  id: number; name: string; type: "ab" | "split_url";
  target_url: string | null; goal_type: "purchase" | "event" | "url"; goal_value: string | null;
  status: string; variations: ExpVariation[];
};

type V = { name: string; weight: number; js_code: string; css_code: string; redirect_url: string };

const blank = (name: string, weight: number): V => ({ name, weight, js_code: "", css_code: "", redirect_url: "" });

export function ExperimentBuilder({ domainId, experiment, onClose }: { domainId: number; experiment?: ExpFull | null; onClose: () => void }) {
  const qc = useQueryClient();
  const editing = !!experiment;

  const [name, setName] = useState(experiment?.name ?? "");
  const [type, setType] = useState<"ab" | "split_url">(experiment?.type ?? "ab");
  const [targetUrl, setTargetUrl] = useState(experiment?.target_url ?? "");
  const [goalType, setGoalType] = useState<"purchase" | "event" | "url">(experiment?.goal_type ?? "purchase");
  const [goalValue, setGoalValue] = useState(experiment?.goal_value ?? "");
  const [vars, setVars] = useState<V[]>(
    experiment?.variations?.length
      ? experiment.variations.map((v) => ({ name: v.name, weight: v.weight, js_code: v.js_code ?? "", css_code: v.css_code ?? "", redirect_url: v.redirect_url ?? "" }))
      : [blank("Original", 50), blank("Variation 1", 50)]
  );

  const setVar = (i: number, patch: Partial<V>) => setVars((arr) => arr.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const addVar = () => setVars((arr) => [...arr, blank(`Variation ${arr.length}`, 0)]);
  const removeVar = (i: number) => setVars((arr) => arr.filter((_, j) => j !== i));
  const evenSplit = () => setVars((arr) => { const w = Math.floor(100 / arr.length); return arr.map((v, i) => ({ ...v, weight: i === arr.length - 1 ? 100 - w * (arr.length - 1) : w })); });

  const totalWeight = vars.reduce((s, v) => s + (Number(v.weight) || 0), 0);

  const payload = () => ({
    name: name.trim(), type, target_url: targetUrl.trim(),
    goal_type: goalType, goal_value: goalType === "purchase" ? null : goalValue.trim(),
    variations: vars.map((v) => ({ name: v.name.trim() || "Variation", weight: Number(v.weight) || 0, js_code: v.js_code, css_code: v.css_code, redirect_url: v.redirect_url.trim() })),
  });

  const saveMut = useMutation({
    mutationFn: () => editing
      ? analyticsApi.experimentsUpdate(domainId, experiment!.id, payload())
      : analyticsApi.experimentsCreate(domainId, payload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments", domainId] });
      toast.success(editing ? "Experiment updated." : "Experiment created (draft). Press Start to run it.");
      onClose();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save experiment."),
  });

  const canSave = name.trim() && targetUrl.trim() && vars.length >= 2 && (goalType === "purchase" || goalValue.trim());

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">{editing ? "Edit experiment" : "New experiment"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            { v: "ab", label: "A/B test", icon: FlaskConical, hint: "Same page — inject JS/CSS per variation" },
            { v: "split_url", label: "Split URL", icon: GitBranch, hint: "Send variations to different page URLs" },
          ] as const).map(({ v, label, icon: Icon, hint }) => (
            <button key={v} type="button" onClick={() => setType(v)}
              className={`text-left p-3 rounded-xl border transition-colors ${type === v ? "border-primary bg-primary/10" : "border-outline-variant/30 hover:bg-surface-container"}`}>
              <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5"><Icon className="w-4 h-4" /> {label}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{hint}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs text-on-surface-variant">Experiment name
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Homepage CTA test" className="mt-1" />
          </label>
          <label className="text-xs text-on-surface-variant">Page URL (the control)
            <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://yoursite.com/landing" className="mt-1 font-mono" />
          </label>
        </div>

        {/* Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs text-on-surface-variant">Goal
            <select value={goalType} onChange={(e) => setGoalType(e.target.value as any)} className="mt-1 w-full h-9 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface">
              <option value="purchase">Purchase (any sale)</option>
              <option value="event">Custom event</option>
              <option value="url">Reached a URL</option>
            </select>
          </label>
          {goalType !== "purchase" && (
            <label className="text-xs text-on-surface-variant">{goalType === "event" ? "Event name" : "URL contains"}
              <Input value={goalValue} onChange={(e) => setGoalValue(e.target.value)} placeholder={goalType === "event" ? "signup_complete" : "/thank-you"} className="mt-1 font-mono" />
            </label>
          )}
        </div>

        {/* Variations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Variations</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${totalWeight === 100 ? "text-emerald-400" : "text-amber-400"}`}>Total: {totalWeight}%</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={evenSplit}><Scale className="w-3 h-3 mr-1" /> Even split</Button>
            </div>
          </div>

          {vars.map((v, i) => (
            <div key={i} className="rounded-xl border border-outline-variant/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={v.name} onChange={(e) => setVar(i, { name: e.target.value })} className="h-9 flex-1" placeholder={i === 0 ? "Original" : `Variation ${i}`} />
                <div className="flex items-center gap-1">
                  <Input type="number" min={0} max={100} value={v.weight} onChange={(e) => setVar(i, { weight: Number(e.target.value) })} className="h-9 w-20 text-right" />
                  <span className="text-sm text-on-surface-variant">%</span>
                </div>
                {i === 0
                  ? <span className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant px-2">control</span>
                  : <button onClick={() => removeVar(i)} className="text-on-surface-variant hover:text-rose-400 px-1"><Trash2 className="w-4 h-4" /></button>}
              </div>

              {/* The control is the page as-is — no code/redirect. */}
              {i > 0 && type === "split_url" && (
                <Input value={v.redirect_url} onChange={(e) => setVar(i, { redirect_url: e.target.value })} placeholder="https://yoursite.com/landing-b" className="font-mono h-9" />
              )}
              {i > 0 && type === "ab" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-on-surface-variant mb-1">CSS</p>
                    <CodeEditor value={v.css_code} language="css" onChange={(val) => setVar(i, { css_code: val })} placeholder=".cta{background:#16a34a}" />
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant mb-1">JavaScript</p>
                    <CodeEditor value={v.js_code} language="js" onChange={(val) => setVar(i, { js_code: val })} placeholder="document.querySelector('.cta').innerText = 'Buy now'" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {vars.length < 10 && (
            <Button size="sm" variant="ghost" className="text-xs h-8" onClick={addVar}><Plus className="w-3 h-3 mr-1" /> Add variation</Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => saveMut.mutate()} disabled={!canSave || saveMut.isPending}>{editing ? "Save changes" : "Create experiment"}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {totalWeight !== 100 && <span className="text-xs text-amber-400 self-center">Weights should add up to 100%.</span>}
        </div>
      </CardContent>
    </Card>
  );
}
