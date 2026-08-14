"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import SignupPopup from "@/components/marketing/SignupPopup";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/Reveal";
import {
  Users, Eye, Clock, TrendingDown, TrendingUp, Globe, Monitor, Smartphone, Tablet,
  Flame, Megaphone, Zap, Sunrise, ArrowUpRight, ArrowDownRight, BarChart2,
  AlertTriangle, Sparkles, Bug, Gauge, DollarSign, Bell, MousePointerClick, ArrowRight,
} from "lucide-react";

const mono = { fontFamily: "var(--font-mono-marketing)" };
const CYAN = "#00E5FF";

// ─── Sample data — clearly labeled as illustrative, deterministic (no Math.random, no hydration drift) ───

const TODAY = new Date();
const TODAY_LABEL = TODAY.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const TRAFFIC = { visitors: 2847, pageviews: 8934, sessions: 3912, avg_duration: 134, bounce_rate: 38.2, avg_pages: 2.3 };
const PREV = { visitors: 2318, pageviews: 7602, sessions: 3184, avg_duration: 118, bounce_rate: 44.6, avg_pages: 2.0 };

const TOP_ISSUES = [
  { severity: "critical", title: "3 rage-click clusters on the /pricing CTA button", detail: "34 occurrences, 19 visitors affected — the button likely looks clickable but isn't." },
  { severity: "warning", title: "Checkout bounce rate spiked to 62%", detail: "12 points above the 30-day average." },
  { severity: "good", title: "Mobile load time improved to 1.8s", detail: "Down from 2.4s last week." },
] as const;

const AI_TAKE = {
  insight: "78% of visitors who abandon the signup form quit at the email field.",
  suggestions: [
    "Add Google sign-in above the email field to cut friction",
    "Autofocus the first input on mobile to reduce taps",
  ],
};

const UX_ISSUES = [
  { type: "rage_click", label: "Rage clicks", occurrences: 34, affected: 19 },
  { type: "dead_click", label: "Dead clicks", occurrences: 12, affected: 9 },
  { type: "js_error", label: "JS errors", occurrences: 5, affected: 4 },
];

const WEB_VITALS = { rating: "good", good: 842, needs_improvement: 126, poor: 18 };
const REVENUE = { total: 4820, orders: 23, prev_total: 3980 };
const RECENT_ALERTS = [
  { title: "Traffic dropped 24% vs. last Tuesday", days_ago: 2 },
  { title: "Conversion rate below threshold on /checkout", days_ago: 4 },
];

const HOURLY = [
  0, 1, 1, 2, 4, 8, 22, 48, 74, 96, 118, 134, 142, 138, 126, 132, 148, 162, 154, 128, 96, 62, 34, 12,
].map((v, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, visitors: v, sessions: Math.round(v * 1.24) }));

const TOP_PAGES = [
  { url: "/", views: 1840 }, { url: "/pricing", views: 962 }, { url: "/blog/getting-started", views: 631 },
  { url: "/features", views: 588 }, { url: "/checkout", views: 412 }, { url: "/contact", views: 287 },
];
const TOP_COUNTRIES = [
  { flag: "🇪🇬", name: "Egypt", sessions: 1180 }, { flag: "🇸🇦", name: "Saudi Arabia", sessions: 642 },
  { flag: "🇦🇪", name: "United Arab Emirates", sessions: 388 }, { flag: "🇺🇸", name: "United States", sessions: 340 },
  { flag: "🇬🇧", name: "United Kingdom", sessions: 212 },
];
const TOP_REFERRERS = [
  { referrer: "google.com", sessions: 1204 }, { referrer: "(direct)", sessions: 892 },
  { referrer: "facebook.com", sessions: 340 }, { referrer: "tiktok.com", sessions: 218 },
];
const DEVICES = [
  { device_type: "mobile", sessions: 2270 }, { device_type: "desktop", sessions: 1402 }, { device_type: "tablet", sessions: 240 },
];
const TOP_CAMPAIGNS = [
  { source: "google / cpc", campaign: "brand-search", sessions: 520, avg_duration: 145 },
  { source: "tiktok / paid", campaign: "video-ad-1", sessions: 380, avg_duration: 88 },
  { source: "facebook / paid", campaign: "retarget-q3", sessions: 214, avg_duration: 102 },
];
const ENGAGED_COUNT = 1240;
const UX_SCORE = { score: 78, breakdown: { error_rate: 84, rage_click_rate: 86, form_abandon: 93, avg_session: 100, bounce_rate: 27 } };
const CUSTOM_EVENTS = [
  { name: "signup_click", occurrences: 340 }, { name: "checkout_start", occurrences: 180 }, { name: "form_submit", occurrences: 96 },
];

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  good: "border-green-500/30 bg-green-500/10 text-green-400",
  info: "border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]",
};

function pct(a: number, b: number): number {
  if (!b) return 0;
  return Math.round(((a - b) / b) * 100);
}

function fmtDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function Delta({ val }: { val: number }) {
  if (val === 0) return <span className="text-neutral-600 text-xs" style={mono}>—</span>;
  const pos = val > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${pos ? "text-green-400" : "text-red-400"}`} style={mono}>
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(val)}%
    </span>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-[#262626] bg-[#0A0A0A] ${className}`}>{children}</div>;
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#262626]">{children}</div>;
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5" style={mono}>{children}</h3>;
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-[#00E5FF]" />
      <h2 className="text-sm font-bold text-white uppercase tracking-widest" style={mono}>{title}</h2>
    </div>
  );
}

function Kpi({ label, value, delta, hint, icon: Icon }: { label: string; value: string; delta?: number; hint?: string; icon: React.ElementType }) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-none border border-[#262626] bg-black flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#00E5FF]" />
        </div>
        {delta !== undefined && <Delta val={delta} />}
      </div>
      <p className="text-xs text-neutral-500 uppercase tracking-widest mt-3" style={mono}>{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5" style={mono}>{value}</p>
      {hint && <p className="text-[11px] text-neutral-600 mt-1">{hint}</p>}
    </Panel>
  );
}

function UxGauge({ score }: { score: number }) {
  const good = score >= 80, warn = score >= 60;
  const color = good ? "#22c55e" : warn ? "#eab308" : "#ef4444";
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#262626" strokeWidth={8} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-2xl font-bold -mt-[52px]" style={{ ...mono, color }}>{score}</span>
      <span className="text-[11px] text-neutral-500 mt-8" style={mono}>{good ? "Strong" : warn ? "Needs work" : "At risk"}</span>
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

export default function LiveDemoPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const reg = `/${locale}/auth/register`;
  const t = TRAFFIC, pt = PREV;
  const maxCustomEvent = Math.max(...CUSTOM_EVENTS.map((e) => e.occurrences), 1);

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Sample-data banner */}
        <Reveal className="border border-[#00E5FF]/25 bg-[#00E5FF]/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">{ar ? "عرض تجريبي حيّ — كل الأرقام هنا نموذجية" : "Live demo — every number on this page is sample data"}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{ar ? "هذه نسخة طبق الأصل من صفحة \"الملخص اليومي\" داخل لوحة تحكم EYE الحقيقية." : "This is an exact copy of the real \"Daily Brief\" page inside the EYE dashboard."}</p>
            </div>
          </div>
          <Link href={reg} className="inline-flex items-center gap-2 rounded-none bg-[#00E5FF] text-black px-5 py-2.5 text-sm font-bold shrink-0 hover:bg-[#33EAFF]">
            {ar ? "ابدأ مجانًا" : "Start free"} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </Reveal>

        {/* Header — mirrors dashboard/daily-brief */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sunrise className="w-6 h-6 text-[#00E5FF]" />
              {ar ? "الملخص اليومي" : "Daily Brief"}
            </h1>
            <p className="text-neutral-400 text-sm mt-0.5">
              {ar ? "كل ما حدث اليوم — الزيارات، الحملات، التفاعل والصحة. كل الأرقام مقارنة بالأمس." : "Everything that happened today — traffic, campaigns, engagement & health. All numbers vs. yesterday."}
            </p>
          </div>
          <div className="text-end shrink-0">
            <p className="text-sm font-semibold text-white" style={mono}>{TODAY_LABEL}</p>
            <p className="text-[11px] text-neutral-600" style={mono}>{ar ? "بيانات نموذجية" : "sample data"}</p>
          </div>
        </div>

        {/* ── Needs Your Attention ── */}
        <div>
          <SectionHeader title={ar ? "يحتاج انتباهك" : "Needs Your Attention"} icon={AlertTriangle} />
          <RevealGroup className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
            <RevealItem className="lg:col-span-2 bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "أهم مشاكل اليوم" : "Top Issues Today"}</PanelTitle>
              <div className="space-y-2.5 mt-3">
                {TOP_ISSUES.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-[10px] font-bold uppercase border ${SEVERITY_STYLE[issue.severity]}`} style={mono}>{issue.severity}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">{issue.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{issue.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle><Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> {ar ? "رأي الذكاء الاصطناعي" : "AI Take"}</PanelTitle>
              <div className="space-y-2 mt-3">
                <p className="text-sm text-white font-medium">{AI_TAKE.insight}</p>
                {AI_TAKE.suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-neutral-500 border-s-2 border-[#00E5FF]/40 ps-2">{s}</p>
                ))}
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle><MousePointerClick className="w-3.5 h-3.5" /> {ar ? "مشاكل تجربة المستخدم اليوم" : "UX Issues Today"}</PanelTitle>
              <div className="space-y-2 mt-3">
                {UX_ISSUES.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white flex items-center gap-1.5">
                      {u.type === "js_error" ? <Bug className="w-3 h-3 text-red-400" /> : <MousePointerClick className="w-3 h-3 text-amber-400" />}
                      {u.label}
                    </span>
                    <span className="font-semibold text-white" style={mono}>{u.occurrences} <span className="text-neutral-500 font-normal">({u.affected})</span></span>
                  </div>
                ))}
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle><Gauge className="w-3.5 h-3.5" /> {ar ? "مؤشرات الويب الحيوية" : "Web Vitals Today"}</PanelTitle>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold capitalize text-green-400" style={mono}>{WEB_VITALS.rating}</span>
                <span className="text-xs text-neutral-500" style={mono}>{WEB_VITALS.good} good · {WEB_VITALS.needs_improvement} ok · {WEB_VITALS.poor} poor</span>
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle><DollarSign className="w-3.5 h-3.5 text-green-400" /> {ar ? "الإيرادات اليوم" : "Revenue Today"}</PanelTitle>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-white" style={mono}>${REVENUE.total.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500" style={mono}>{REVENUE.orders} orders</span>
                  <Delta val={pct(REVENUE.total, REVENUE.prev_total)} />
                </div>
              </div>
            </RevealItem>

            <RevealItem className="lg:col-span-3 bg-[#0A0A0A] p-4">
              <PanelTitle><Bell className="w-3.5 h-3.5" /> {ar ? "تنبيهات حديثة (آخر 7 أيام)" : "Recent Alerts (last 7 days)"}</PanelTitle>
              <div className="space-y-2 mt-3">
                {RECENT_ALERTS.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-white font-medium truncate">{a.title}</span>
                    <span className="text-neutral-600 shrink-0" style={mono}>{a.days_ago}d ago</span>
                  </div>
                ))}
              </div>
            </RevealItem>
          </RevealGroup>
        </div>

        {/* ── Traffic KPIs ── */}
        <div>
          <SectionHeader title={ar ? "زيارات اليوم" : "Traffic Today"} icon={BarChart2} />
          <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#262626] border border-[#262626]">
            <RevealItem><Kpi icon={Users} label={ar ? "الزوّار" : "Visitors"} value={t.visitors.toLocaleString()} delta={pct(t.visitors, pt.visitors)} /></RevealItem>
            <RevealItem><Kpi icon={Eye} label={ar ? "المشاهدات" : "Pageviews"} value={t.pageviews.toLocaleString()} delta={pct(t.pageviews, pt.pageviews)} /></RevealItem>
            <RevealItem><Kpi icon={Zap} label={ar ? "الجلسات" : "Sessions"} value={t.sessions.toLocaleString()} delta={pct(t.sessions, pt.sessions)} /></RevealItem>
            <RevealItem><Kpi icon={Clock} label={ar ? "متوسط الوقت" : "Avg. Time on Page"} value={fmtDuration(t.avg_duration)} delta={pct(t.avg_duration, pt.avg_duration)} /></RevealItem>
            <RevealItem><Kpi icon={TrendingDown} label={ar ? "معدل الارتداد" : "Bounce Rate"} value={`${t.bounce_rate}%`} delta={pct(t.bounce_rate, pt.bounce_rate)} /></RevealItem>
            <RevealItem><Kpi icon={TrendingUp} label={ar ? "متوسط الصفحات" : "Avg Pages"} value={t.avg_pages.toFixed(1)} delta={pct(t.avg_pages, pt.avg_pages)} /></RevealItem>
          </RevealGroup>
        </div>

        {/* ── Hourly chart ── */}
        <Panel>
          <PanelHeader><PanelTitle>{ar ? "الزوّار والجلسات — اليوم، بالساعة" : "Visitors & Sessions — Today, by Hour"}</PanelTitle></PanelHeader>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={HOURLY} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="dbV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CYAN} stopOpacity={0.35} /><stop offset="95%" stopColor={CYAN} stopOpacity={0} /></linearGradient>
                  <linearGradient id="dbS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} /><stop offset="95%" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" strokeOpacity={0.8} />
                <XAxis dataKey="hour" tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #262626", borderRadius: 0, color: "#fff", fontSize: 12 }} />
                <Area type="monotone" dataKey="visitors" name={ar ? "الزوّار" : "Visitors"} stroke={CYAN} strokeWidth={2} fill="url(#dbV)" dot={false} />
                <Area type="monotone" dataKey="sessions" name={ar ? "الجلسات" : "Sessions"} stroke="#ffffff" strokeWidth={1.5} fill="url(#dbS)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* ── Content & Audience ── */}
        <div>
          <SectionHeader title={ar ? "المحتوى والجمهور اليوم" : "Content & Audience Today"} icon={Globe} />
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "أهم الصفحات" : "Top Pages"}</PanelTitle>
              <div className="space-y-2 mt-3">
                {TOP_PAGES.map((p) => (
                  <div key={p.url} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-300 truncate" style={mono}>{p.url}</span>
                    <span className="text-xs font-semibold text-[#00E5FF] shrink-0" style={mono}>{p.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </RevealItem>
            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "أهم الدول" : "Top Countries"}</PanelTitle>
              <div className="space-y-2 mt-3">
                {TOP_COUNTRIES.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-300 flex items-center gap-1.5"><span className="text-sm leading-none">{c.flag}</span>{c.name}</span>
                    <span className="text-xs text-neutral-500 shrink-0" style={mono}>{c.sessions.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </RevealItem>
            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "أهم مصادر الزيارات" : "Top Referrers"}</PanelTitle>
              <div className="space-y-2 mt-3">
                {TOP_REFERRERS.map((r) => (
                  <div key={r.referrer} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-300 truncate">{r.referrer}</span>
                    <span className="text-xs text-neutral-500 shrink-0" style={mono}>{r.sessions.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </RevealItem>
          </RevealGroup>
        </div>

        {/* ── Channels & Campaigns ── */}
        <div>
          <SectionHeader title={ar ? "القنوات والحملات اليوم" : "Channels & Campaigns Today"} icon={Megaphone} />
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "توزيع الأجهزة" : "Device Split"}</PanelTitle>
              <div className="flex flex-col items-center gap-2 mt-2">
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={DEVICES} dataKey="sessions" nameKey="device_type" cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={3}>
                      {DEVICES.map((_, i) => <Cell key={i} fill={[CYAN, "#ffffff", "#525252"][i % 3]} />)}
                    </Pie>
                    <ChartTooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #262626", borderRadius: 0, color: "#fff", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center">
                  {DEVICES.map((dv, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <span className="w-2 h-2" style={{ background: [CYAN, "#ffffff", "#525252"][i % 3] }} />
                      <DeviceIcon type={dv.device_type} />{dv.device_type}
                      <span className="text-neutral-600" style={mono}>({dv.sessions.toLocaleString()})</span>
                    </span>
                  ))}
                </div>
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "أهم الحملات اليوم" : "Top Campaigns Today"}</PanelTitle>
              <div className="space-y-2.5 mt-3">
                {TOP_CAMPAIGNS.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{c.source}</span>
                      <span className="text-[11px] text-neutral-500 truncate">{c.campaign}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                      <span className="text-xs font-semibold text-[#00E5FF]" style={mono}>{c.sessions.toLocaleString()}</span>
                      <span className="text-[11px] text-neutral-600" style={mono}>{fmtDuration(c.avg_duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "التفاعل" : "Engagement"}</PanelTitle>
              <div className="space-y-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-300"><Flame className="w-3.5 h-3.5 text-amber-400" />{ar ? "زوّار متفاعلون" : "Engaged visitors"}</span>
                  <span className="text-xs font-bold text-amber-400" style={mono}>{ENGAGED_COUNT.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">{ar ? "متوسط الصفحات/جلسة" : "Avg pages/session"}</span>
                  <span className="text-sm font-bold text-white" style={mono}>{t.avg_pages.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">{ar ? "متوسط مدة الجلسة" : "Avg session duration"}</span>
                  <span className="text-sm font-bold text-white" style={mono}>{fmtDuration(t.avg_duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">{ar ? "معدل الارتداد" : "Bounce rate"}</span>
                  <span className="text-sm font-bold text-green-400" style={mono}>{t.bounce_rate}%</span>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>

        {/* ── Website Health ── */}
        <div>
          <SectionHeader title={ar ? "صحة الموقع اليوم" : "Website Health Today"} icon={Gauge} />
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#262626] border border-[#262626]">
            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "درجة رضا المستخدم" : "UX Happiness Score"}</PanelTitle>
              <div className="flex items-center gap-6 mt-2">
                <UxGauge score={UX_SCORE.score} />
                <div className="space-y-1.5 flex-1">
                  {Object.entries(UX_SCORE.breakdown).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-white" style={mono}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealItem>

            <RevealItem className="bg-[#0A0A0A] p-4">
              <PanelTitle>{ar ? "أهم الأحداث المخصصة اليوم" : "Top Custom Events Today"}</PanelTitle>
              <div className="space-y-2.5 mt-3">
                {CUSTOM_EVENTS.map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 bg-[#171717] h-1.5 overflow-hidden">
                      <div className="h-full bg-[#00E5FF]" style={{ width: `${Math.round((e.occurrences / maxCustomEvent) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-white w-28 shrink-0 truncate">{e.name}</span>
                    <span className="text-xs text-neutral-500 shrink-0" style={mono}>{e.occurrences.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </RevealItem>
          </RevealGroup>
        </div>

        {/* Final CTA */}
        <Reveal className="border border-[#00E5FF]/25 bg-[#00E5FF]/5 p-8 text-center space-y-3">
          <p className="text-xl font-bold text-white">{ar ? "جاهز لرؤية بيانات موقعك؟" : "Ready to see your own data?"}</p>
          <p className="text-sm text-neutral-400">{ar ? "أضف موقعك وابدأ تتبّع الزوّار الحقيقيين خلال دقائق." : "Add your website and start tracking real visitors in minutes."}</p>
          <Link href={reg} className="inline-flex items-center gap-2 rounded-none bg-[#00E5FF] text-black px-6 py-3 text-sm font-bold hover:bg-[#33EAFF]">
            {ar ? "ابدأ مجانًا — بدون بطاقة" : "Start free — no card"} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </Reveal>
      </main>
      <Footer locale={locale} />
      <MobileCtaBar />
      <SignupPopup />
    </div>
  );
}
