"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Users, Activity, Clock, TrendingDown, Flame, Globe, MousePointerClick, ArrowRight, Sparkles } from "lucide-react";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";

const CHART = [
  { date: "Jun 8", visitors: 142, sessions: 188 }, { date: "Jun 9", visitors: 168, sessions: 210 },
  { date: "Jun 10", visitors: 195, sessions: 244 }, { date: "Jun 11", visitors: 181, sessions: 233 },
  { date: "Jun 12", visitors: 224, sessions: 281 }, { date: "Jun 13", visitors: 268, sessions: 332 },
  { date: "Jun 14", visitors: 312, sessions: 388 }, { date: "Jun 15", visitors: 289, sessions: 361 },
  { date: "Jun 16", visitors: 305, sessions: 379 }, { date: "Jun 17", visitors: 341, sessions: 420 },
  { date: "Jun 18", visitors: 368, sessions: 451 }, { date: "Jun 19", visitors: 352, sessions: 438 },
  { date: "Jun 20", visitors: 397, sessions: 488 }, { date: "Jun 21", visitors: 415, sessions: 512 },
];
const TOP_PAGES = [
  { url: "/", views: 1840 }, { url: "/pricing", views: 962 }, { url: "/blog/getting-started", views: 631 },
  { url: "/features", views: 588 }, { url: "/checkout", views: 412 }, { url: "/contact", views: 287 },
];
const DEVICES = [
  { label: "Desktop", pct: 58, color: "bg-primary" },
  { label: "Mobile", pct: 36, color: "bg-secondary" },
  { label: "Tablet", pct: 6, color: "bg-tertiary" },
];
const COUNTRIES = [
  { flag: "🇪🇬", name: "Egypt", pct: 41 }, { flag: "🇸🇦", name: "Saudi Arabia", pct: 23 },
  { flag: "🇦🇪", name: "United Arab Emirates", pct: 14 }, { flag: "🇺🇸", name: "United States", pct: 12 },
  { flag: "🇬🇧", name: "United Kingdom", pct: 10 },
];
const DOTS: [number, number, number][] = [
  [50, 18, 1], [48, 19, 0.9], [52, 17, 0.8], [30, 42, 0.6], [70, 44, 0.7], [50, 64, 0.95],
  [49, 65, 0.85], [22, 30, 0.4], [78, 31, 0.5], [50, 84, 0.7], [40, 50, 0.5], [60, 51, 0.55],
];

function Kpi({ label, value, icon: Icon, hint }: { label: string; value: string; icon: React.ElementType; hint?: string }) {
  return (
    <Card><CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
          <p className="text-3xl font-black text-on-surface tracking-tight">{value}</p>
          {hint && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ltr:ml-3 rtl:mr-3"><Icon className="w-5 h-5 text-primary" /></div>
      </div>
    </CardContent></Card>
  );
}

export default function LiveDemoPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const reg = `/${locale}/auth/register`;

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="relative isolate overflow-hidden text-center mb-2 pb-6">
          <GradientBlobs variant="compact" />
          <div className="relative">
            <Reveal><h1 className="text-3xl sm:text-4xl font-black tracking-tight">{ar ? "جرّب اللوحة الآن — بدون تسجيل" : "Play with the dashboard — no signup"}</h1></Reveal>
            <Reveal delay={0.08}><p className="text-on-surface-variant mt-2">{ar ? "هذه بيانات تجريبية. أنشئ حسابك المجاني لترى بيانات موقعك الحقيقية." : "This is sample data. Create a free account to see your own site's real data."}</p></Reveal>
          </div>
        </div>

        <Reveal className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-on-surface">{ar ? "عرض تجريبي حيّ ببيانات نموذجية" : "Live demo with sample data"}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{ar ? "ابدأ مجانًا لترى زوّارك وخرائطك الحرارية ورؤاك خلال دقيقتين." : "Start free to see your visitors, heatmaps and insights — in ~2 minutes."}</p>
            </div>
          </div>
          <Link href={reg} className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold shrink-0 hover:opacity-90">{ar ? "ابدأ مجانًا" : "Start free"} <ArrowRight className="w-4 h-4 rtl:rotate-180" /></Link>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <RevealItem><Kpi label={ar ? "الزوّار" : "Visitors"} value="2,847" icon={Users} /></RevealItem>
          <RevealItem><Kpi label={ar ? "الجلسات" : "Sessions"} value="3,912" icon={Activity} /></RevealItem>
          <RevealItem><Kpi label={ar ? "متوسط الوقت" : "Avg. time"} value="2m 14s" icon={Clock} /></RevealItem>
          <RevealItem><Kpi label={ar ? "معدل الارتداد" : "Bounce rate"} value="38.2%" icon={TrendingDown} hint={ar ? "جيد — أقل من 50%" : "Healthy — below 50%"} /></RevealItem>
          <RevealItem><Kpi label={ar ? "عملاء محتملون" : "Hot leads"} value="64" icon={Flame} hint={ar ? "الأكثر احتمالًا للتحويل" : "Most likely to convert"} /></RevealItem>
        </RevealGroup>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{ar ? "الزوّار والجلسات (آخر 14 يومًا)" : "Visitors & sessions (last 14 days)"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CHART}>
                <defs>
                  <linearGradient id="ld-v" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} /></linearGradient>
                  <linearGradient id="ld-s" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d0bcff" stopOpacity={0.2} /><stop offset="95%" stopColor="#d0bcff" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" }} />
                <Area type="monotone" dataKey="visitors" stroke="#c0c1ff" strokeWidth={2} fill="url(#ld-v)" />
                <Area type="monotone" dataKey="sessions" stroke="#d0bcff" strokeWidth={2} fill="url(#ld-s)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Reveal className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-primary" /> {ar ? "أهم الصفحات" : "Top pages"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {TOP_PAGES.map((p) => (
                <div key={p.url} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
                  <span className="text-sm text-on-surface truncate max-w-[70%]">{p.url}</span>
                  <span className="text-xs font-semibold text-primary">{p.views.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{ar ? "الأجهزة" : "Devices"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {DEVICES.map((d) => (
                <div key={d.label} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-on-surface-variant">{d.label}</span><span className="text-on-surface font-semibold">{d.pct}%</span></div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden"><div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{ar ? "خريطة النقر الحرارية" : "Click heatmap"}</CardTitle></CardHeader>
            <CardContent>
              <div className="relative w-full aspect-[16/10] rounded-lg bg-surface-container-lowest border border-outline-variant/20 overflow-hidden">
                <div className="absolute inset-x-6 top-5 h-3 rounded bg-on-surface/10" />
                <div className="absolute inset-x-6 top-12 h-8 rounded bg-on-surface/5" />
                <div className="absolute left-1/2 -translate-x-1/2 top-[60%] h-7 w-32 rounded-full bg-primary/20" />
                {DOTS.map(([x, y, i], idx) => (
                  <span key={idx} className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: 26, height: 26, transform: "translate(-50%,-50%)", background: `radial-gradient(circle, rgba(239,68,68,${i}) 0%, rgba(239,68,68,0) 70%)` }} />
                ))}
              </div>
              <p className="text-xs text-on-surface-variant mt-2">{ar ? "أين ينقر الزوّار فعلًا — الأماكن الأكثر سطوعًا تحظى بأكبر انتباه." : "Where visitors actually click — the brightest spots get the most attention."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><Globe className="w-4 h-4 text-sky-400" /> {ar ? "أهم الدول" : "Top countries"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {COUNTRIES.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-on-surface">{c.flag} {c.name}</span><span className="text-on-surface-variant">{c.pct}%</span></div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${c.pct}%` }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
          <p className="text-xl font-black text-on-surface">{ar ? "جاهز لرؤية بيانات موقعك؟" : "Ready to see your own data?"}</p>
          <p className="text-sm text-on-surface-variant">{ar ? "أضف موقعك وابدأ تتبّع الزوّار الحقيقيين خلال دقائق." : "Add your website and start tracking real visitors in minutes."}</p>
          <Link href={reg} className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-6 py-3 text-sm font-bold hover:opacity-90">{ar ? "ابدأ مجانًا — بدون بطاقة" : "Start free — no card"} <ArrowRight className="w-4 h-4 rtl:rotate-180" /></Link>
        </Reveal>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
