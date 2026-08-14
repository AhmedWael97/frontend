const ROWS: { t: string; c: string }[] = [
  { t: "10:42:01  pageview      /pricing              US", c: "text-neutral-400" },
  { t: "10:42:03  click         x:42% y:18%           US", c: "text-[#00E5FF]" },
  { t: "10:42:05  scroll_depth  75%                    DE", c: "text-neutral-400" },
  { t: "10:42:08  rage_click    3x / 600ms             EG", c: "text-red-400" },
  { t: "10:42:11  identify      user_2291              US", c: "text-neutral-400" },
  { t: "10:42:14  web_vitals    LCP 1.2s               FR", c: "text-green-400" },
  { t: "10:42:17  conversion    $49.00                 US", c: "text-green-400" },
  { t: "10:42:20  pageview      /docs                  EG", c: "text-neutral-400" },
  { t: "10:42:23  js_error      TypeError caught       DE", c: "text-red-400" },
  { t: "10:42:26  click         x:8% y:64%             FR", c: "text-[#00E5FF]" },
];

/** Illustrative sample-event stream (static loop, not a live feed) — shows the shape of real EYE.js payloads without claiming to be a live production tap. */
export default function LiveTerminalPreview() {
  return (
    <div className="relative z-10 rounded-none border border-[#262626] bg-[#0A0A0A] overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: "@keyframes eyeLogScroll{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}" }} />
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#171717]">
        <span className="text-[11px] text-neutral-500" style={{ fontFamily: "var(--font-mono-marketing)" }}>eye.js — sample stream</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none border border-green-500/30 bg-green-500/10 text-green-400" style={{ fontFamily: "var(--font-mono-marketing)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> streaming
        </span>
      </div>
      <div className="relative h-72 sm:h-80 overflow-hidden p-4">
        <div style={{ animation: "eyeLogScroll 14s linear infinite" }}>
          {[...ROWS, ...ROWS].map((r, i) => (
            <div key={i} className={`text-[11px] sm:text-xs leading-relaxed whitespace-pre ${r.c}`} style={{ fontFamily: "var(--font-mono-marketing)" }}>
              {r.t}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
      </div>
    </div>
  );
}
