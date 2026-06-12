"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyticsApi } from "@/lib/api";
import { DollarSign, Upload, Trash2, Plus } from "lucide-react";

type SpendRow = {
  id: number;
  date: string;
  source: string;
  campaign: string;
  medium: string | null;
  spend: string | number;
  currency: string;
};

const CSV_TEMPLATE = "date,source,campaign,spend,currency,clicks,impressions\n2026-06-01,Facebook,summer_sale,250.00,USD,1200,45000";

export function AdSpendDialog({
  domainId,
  start,
  end,
  defaultCurrency,
}: {
  domainId: number;
  start: string;
  end: string;
  defaultCurrency?: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"add" | "import">("add");
  const [error, setError] = useState("");

  // Single-row form
  const [form, setForm] = useState({
    date: end,
    source: "",
    campaign: "",
    spend: "",
    currency: defaultCurrency || "USD",
  });
  const [csv, setCsv] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["ad-spend", domainId, start, end],
    queryFn: () => analyticsApi.adSpendList(domainId, { start, end }).then((r) => r.data?.data ?? r.data),
    enabled: open && !!domainId,
  });
  const rows: SpendRow[] = data?.rows ?? [];
  const totalSpend: number = Number(data?.total_spend ?? 0);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["ad-spend", domainId] });
    qc.invalidateQueries({ queryKey: ["campaigns", domainId] });
  }

  const addMut = useMutation({
    mutationFn: () =>
      analyticsApi.adSpendStore(domainId, {
        date: form.date,
        source: form.source.trim(),
        campaign: form.campaign.trim() || undefined,
        spend: Number(form.spend),
        currency: form.currency.trim() || "USD",
      }),
    onSuccess: () => {
      setForm((f) => ({ ...f, source: "", campaign: "", spend: "" }));
      setError("");
      invalidate();
    },
    onError: () => setError("Could not save. Check the values and try again."),
  });

  const importMut = useMutation({
    mutationFn: () => analyticsApi.adSpendImport(domainId, csv),
    onSuccess: (r) => {
      const d = r.data?.data ?? r.data;
      setError("");
      setCsv("");
      invalidate();
      setTab("add");
      window.alert(`Imported ${d?.imported ?? 0} rows${d?.skipped ? `, skipped ${d.skipped}` : ""}.`);
    },
    onError: () => setError("Import failed. Check the CSV format."),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => analyticsApi.adSpendDelete(domainId, id),
    onSuccess: invalidate,
  });

  const canAdd = form.source.trim() !== "" && form.spend !== "" && !isNaN(Number(form.spend));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors">
          <DollarSign className="w-3.5 h-3.5" />
          Ad Spend
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ad Spend</DialogTitle>
          <DialogDescription>
            Enter what you spend per campaign so EYE can compute ROAS and CPA. Match the
            Source and Campaign to your UTM tags (e.g. Facebook / summer_sale).
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1.5">
            {(["add", "import"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t === "add" ? "Add entry" : "Import CSV"}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          {tab === "add" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label className="text-xs text-on-surface-variant col-span-1">
                Date
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 h-9" />
              </label>
              <label className="text-xs text-on-surface-variant col-span-1">
                Source
                <Input placeholder="Facebook" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="mt-1 h-9" />
              </label>
              <label className="text-xs text-on-surface-variant col-span-1">
                Campaign
                <Input placeholder="summer_sale" value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} className="mt-1 h-9" />
              </label>
              <label className="text-xs text-on-surface-variant col-span-1">
                Spend
                <Input type="number" min="0" step="0.01" placeholder="250.00" value={form.spend} onChange={(e) => setForm({ ...form, spend: e.target.value })} className="mt-1 h-9" />
              </label>
              <label className="text-xs text-on-surface-variant col-span-1">
                Currency
                <Input placeholder="USD" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1 h-9" />
              </label>
              <div className="flex items-end">
                <Button onClick={() => addMut.mutate()} disabled={!canAdd || addMut.isPending} className="w-full h-9 gap-1.5">
                  <Plus className="w-4 h-4" />
                  {addMut.isPending ? "Saving…" : "Add"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-on-surface-variant">
                Paste CSV with a header row. Required columns: <code>date, source, spend</code>. Optional: <code>campaign, currency, clicks, impressions</code>.
              </p>
              <textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                rows={6}
                placeholder={CSV_TEMPLATE}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface p-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button onClick={() => importMut.mutate()} disabled={!csv.trim() || importMut.isPending} className="gap-1.5">
                <Upload className="w-4 h-4" />
                {importMut.isPending ? "Importing…" : "Import"}
              </Button>
            </div>
          )}

          {/* Existing entries */}
          <div className="border-t border-outline-variant/20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                Spend in range
              </p>
              <span className="text-sm font-semibold text-on-surface tabular-nums">
                {totalSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })} total
              </span>
            </div>
            {isLoading ? (
              <div className="h-20 bg-surface-container rounded animate-pulse" />
            ) : rows.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">No spend recorded for this period.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-outline-variant/10">
                        <td className="py-1.5 text-on-surface-variant text-xs tabular-nums">{r.date}</td>
                        <td className="py-1.5 font-medium text-on-surface">{r.source}</td>
                        <td className="py-1.5 text-on-surface-variant">{r.campaign === "(none)" ? "—" : r.campaign}</td>
                        <td className="py-1.5 text-right tabular-nums text-on-surface">
                          {Number(r.spend).toLocaleString()} {r.currency}
                        </td>
                        <td className="py-1.5 text-right w-8">
                          <button
                            onClick={() => delMut.mutate(r.id)}
                            className="text-on-surface-variant hover:text-rose-400 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
