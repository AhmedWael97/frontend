"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const DONE_KEY = "_eye_tour_done";

type Step = {
  path?: string; // locale-relative, e.g. "/settings/domains?welcome=1"
  target?: string; // matches a [data-tour="..."] element; omit for a centered step
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    title: "Welcome to EYE 👋",
    body: "Let's connect your first website — takes about 2 minutes. You can skip this anytime and pick it up later.",
  },
  {
    path: "/settings/domains?welcome=1",
    target: "add-domain-input",
    title: "Add your website",
    body: "Type your domain without http:// — e.g. example.com. Once added, you'll get a one-line snippet to paste into your site.",
  },
  {
    path: "/dashboard",
    target: "hub-analyticsHub",
    title: "Analytics Hub",
    body: "Live visitors, funnels, campaigns, and revenue attribution — all in real time.",
  },
  {
    path: "/dashboard/intelligence",
    target: "hub-intelligenceHub",
    title: "Intelligence Hub",
    body: "Heatmaps, session replay, and UX scoring show you exactly how visitors experience your site.",
  },
  {
    path: "/dashboard/reports",
    target: "hub-reportsHub",
    title: "Reports Hub",
    body: "AI writes plain-English summaries of what's changing, plus leads and exports.",
  },
  {
    path: "/settings",
    target: "hub-settingsHub",
    title: "Settings",
    body: "Manage your team, billing, alerts, and more here.",
  },
  {
    title: "You're all set! 🎉",
    body: "Explore at your own pace — the chat bubble in the corner is always there if you need anything.",
  },
];

const PAD = 8;

/**
 * First-run product tour: welcome -> add first domain -> the 4 sidebar hubs
 * -> done. Read-only spotlight for the sidebar-hub steps (backdrop via a
 * giant box-shadow on the highlight box, not a covering div, so the real
 * page underneath stays clickable — matters for the "add domain" step,
 * where the user actually types into the real form while the tour is open).
 * Triggered once, right off RegisterController's ?welcome=1 redirect.
 */
export function TourGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { token } = useAuthStore();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const started = useRef(false);

  // Trigger once, off the register-redirect's ?welcome=1 — avoids needing a
  // useSearchParams() Suspense boundary at this layout level.
  useEffect(() => {
    if (!token || started.current) return;
    try {
      if (localStorage.getItem(DONE_KEY)) return;
      const welcome = new URLSearchParams(window.location.search).get("welcome") === "1";
      if (welcome) {
        started.current = true;
        setActive(true);
        setStepIndex(0);
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!active) return;
    const step = STEPS[stepIndex];
    let cancelled = false;
    setRect(null);

    (async () => {
      if (step.path) {
        const destBase = `/${locale}${step.path.split("?")[0]}`;
        if (!pathname?.startsWith(destBase)) {
          router.push(`/${locale}${step.path}`);
        }
      }
      if (!step.target) return;
      for (let i = 0; i < 40 && !cancelled; i++) {
        const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          await new Promise((r) => setTimeout(r, 250));
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          // Narrow viewport with the sidebar drawer closed: the hub link is
          // off-screen (translate-x-full) — spotlighting it would point at
          // nothing visible, so fall back to a centered tooltip instead.
          const offscreen = r.left < -1 || r.left > window.innerWidth;
          setRect(offscreen ? null : r);
          return;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, active]);

  useEffect(() => {
    if (!active || !rect) return;
    const step = STEPS[stepIndex];
    const onResize = () => {
      const el = step.target ? (document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null) : null;
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, rect, stepIndex]);

  const finish = () => {
    try { localStorage.setItem(DONE_KEY, "1"); } catch {}
    setActive(false);
  };

  if (!active) return null;

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const Tooltip = ({ style }: { style?: React.CSSProperties }) => (
    <div
      className="fixed z-[110] w-full max-w-sm bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 p-5"
      style={style ?? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <button onClick={finish} className="absolute top-3 ltr:right-3 rtl:left-3 p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high" aria-label="Close">
        <X className="w-4 h-4" />
      </button>
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
      <h3 className="text-lg font-black text-on-surface pe-6">{step.title}</h3>
      <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{step.body}</p>
      <div className="flex items-center justify-between gap-3 mt-4">
        {!isFirst ? (
          <button onClick={() => setStepIndex((i) => i - 1)} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> Back
          </button>
        ) : (
          <button onClick={finish} className="text-sm text-on-surface-variant hover:text-on-surface">Skip tour</button>
        )}
        <button
          onClick={() => (isLast ? finish() : setStepIndex((i) => i + 1))}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90"
        >
          {isLast ? "Finish" : isFirst ? "Start tour" : "Next"}
          {!isLast && <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
        </button>
      </div>
    </div>
  );

  if (!rect) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={finish} />
        <Tooltip />
      </div>
    );
  }

  const top = rect.top - PAD;
  const left = rect.left - PAD;
  const width = rect.width + PAD * 2;
  const height = rect.height + PAD * 2;
  const spaceBelow = window.innerHeight - rect.bottom;
  const tooltipTop = spaceBelow > 220 ? rect.bottom + 16 : Math.max(16, rect.top - 220);
  const tooltipLeft = Math.min(Math.max(16, rect.left), window.innerWidth - 400);

  return (
    <>
      <div
        className="fixed z-[105] rounded-xl ring-2 ring-primary transition-all duration-300"
        style={{ top, left, width, height, boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)", pointerEvents: "none" }}
      />
      <Tooltip style={{ top: tooltipTop, left: tooltipLeft, transform: "none" }} />
    </>
  );
}
