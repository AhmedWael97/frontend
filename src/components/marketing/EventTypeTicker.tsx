const EVENTS = [
  "pageview", "click", "rage_click", "dead_click", "scroll_depth", "excessive_scroll",
  "time_on_page", "quick_back", "js_error", "form_abandon", "broken_link", "web_vitals",
  "page_load", "slow_resources", "identify", "custom", "conversion",
];

/** Horizontal marquee of every real event type eye.js emits — the taxonomy, not a logo wall. */
export default function EventTypeTicker() {
  return (
    <div className="border-b border-[#262626] bg-black py-5 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: "@keyframes eyeTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}" }} />
      <div className="flex whitespace-nowrap" style={{ animation: "eyeTicker 32s linear infinite" }}>
        {[...EVENTS, ...EVENTS].map((ev, i) => (
          <span key={i} className="flex items-center text-xs sm:text-sm text-neutral-500 px-5" style={{ fontFamily: "var(--font-mono-marketing)" }}>
            <span className="text-[#00E5FF] ltr:mr-2 rtl:ml-2">·</span>{ev}
          </span>
        ))}
      </div>
    </div>
  );
}
