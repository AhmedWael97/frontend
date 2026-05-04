"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { replayApi } from "@/api";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Play, Pause, SkipForward, Trash2, Clock, MousePointer, Monitor, Smartphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────
type ReplaySession = {
  id: number;
  session_id: string;
  visitor_id: string;
  start_url: string | null;
  event_count: number;
  status: "recording" | "complete" | "pruned";
  recorded_at: string;
};

type RrwebEvent = {
  type: number;
  data: Record<string, unknown>;
  timestamp: number;
};

// ── Replay Player (client-only, imports rrweb dynamically) ────────────────────
function ReplayPlayer({
  domainId,
  session,
  onClose,
}: {
  domainId: number;
  session: ReplaySession;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const replayerRef  = useRef<any>(null);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [speed,      setSpeed]      = useState(1);
  const [progress,   setProgress]   = useState(0);
  const [elapsed,    setElapsed]    = useState(0);
  const [totalMs,    setTotalMs]    = useState(0);
  const [skipInactive, setSkipInactive] = useState(true);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [viewportInfo, setViewportInfo] = useState<{ w: number; h: number } | null>(null);
  const progressRef  = useRef<ReturnType<typeof setInterval>>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["replay-events", domainId, session.session_id],
    queryFn: () =>
      replayApi.events(domainId, session.session_id).then((r) => r.data as RrwebEvent[]),
    staleTime: Infinity,
  });

  // Rebuild rrweb events from the backend format (type + data + timestamp)
  function toRrwebEvents(rows: RrwebEvent[]): RrwebEvent[] {
    let hasFullSnapshot = false;

    const events = rows.map((r, index) => {
      const event: RrwebEvent = {
        type:      Number(r.type),
        data:      r.data ?? {},
        timestamp: Number(r.timestamp),
      };

      // Extract viewport dimensions from Meta event (type 4)
      if (event.type === 4 && event.data) {
        const w = Number((event.data as any).width);
        const h = Number((event.data as any).height);
        if (w > 0 && h > 0) setViewportInfo({ w, h });
      }

      // Track if we have a valid FullSnapshot
      if (event.type === 2) {
        hasFullSnapshot = true;
        if (!event.data || !event.data.node) {
          console.warn(`FullSnapshot event at index ${index} missing node data`, event);
        }
      }

      return event;
    });

    // Set error if no FullSnapshot found
    if (!hasFullSnapshot && events.length > 0) {
      setReplayError('No FullSnapshot event found. The recording may be incomplete.');
    }

    return events;
  }

  // Initialise rrweb Replayer once we have events
  useEffect(() => {
    if (!data || !data.length || !containerRef.current) return;

    // Destroy existing instance
    if (replayerRef.current) {
      try { replayerRef.current.pause(); } catch {
        // Suppress error if pause fails
      }
      replayerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    }

    const events = toRrwebEvents(data);

    // Extract recorded viewport dimensions from the Meta event (type 4).
    // rrweb getMetaData() does NOT expose width/height — we must read from events.
    const metaEv = events.find((e) => e.type === 4);
    const viewportDims = {
      w: Number((metaEv?.data as any)?.width  ?? 0),
      h: Number((metaEv?.data as any)?.height ?? 0),
    };

    // rrweb is installed at build time (package.json); ts-ignore until npm install runs
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import("rrweb").then(({ Replayer }: { Replayer: any }) => {
      if (!containerRef.current) return;

      const replayer = new Replayer(events, {
        root:         containerRef.current,
        speed,
        skipInactive,
        showWarning:  false,
        showDebug:    false,
        UNSAFE_replayCanvas: true,  // CRITICAL FIX: Enable canvas replay
      });

      replayerRef.current = replayer;

      const meta = replayer.getMetaData();
      setTotalMs(meta.totalTime);

      // Scale mobile recordings down to fit the container.
      // Use a short timeout so rrweb has painted .replayer-wrapper before we measure.
      setTimeout(() => {
        const wrapper = containerRef.current?.querySelector('.replayer-wrapper') as HTMLElement | null;
        if (wrapper && containerRef.current && viewportDims.w > 0 && viewportDims.h > 0) {
          const containerW = containerRef.current.clientWidth;
          const containerH = containerRef.current.clientHeight;
          const scale = Math.min(containerW / viewportDims.w, containerH / viewportDims.h, 1);
          if (scale < 0.99) {
            wrapper.style.transformOrigin = 'top left';
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.marginBottom = `${viewportDims.h * scale - viewportDims.h}px`;
          }
        }
      }, 150);

      replayer.on("finish", () => {
        setIsPlaying(false);
        clearInterval(progressRef.current);
      });

      // Auto-play
      replayer.play();
      setIsPlaying(true);

      progressRef.current = setInterval(() => {
        try {
          const cur = replayer.getCurrentTime();
          const tot = meta.totalTime || 1;
          setElapsed(cur);
          setProgress(Math.min(100, (cur / tot) * 100));
        } catch {
          // Suppress error if timing data unavailable
        }
      }, 250);
    });

    return () => {
      clearInterval(progressRef.current);
      try { replayerRef.current?.pause(); } catch {
        // Suppress error if pause fails during cleanup
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Apply speed / skipInactive changes to existing replayer
  useEffect(() => {
    if (!replayerRef.current) return;
    replayerRef.current.setConfig({ speed, skipInactive });
  }, [speed, skipInactive]);

  const togglePlay = useCallback(() => {
    const r = replayerRef.current;
    if (!r) return;
    if (isPlaying) {
      r.pause();
      clearInterval(progressRef.current);
      setIsPlaying(false);
    } else {
      r.resume();
      setIsPlaying(true);
      progressRef.current = setInterval(() => {
        try {
          const meta = r.getMetaData();
          const cur  = r.getCurrentTime();
          setElapsed(cur);
          setProgress(Math.min(100, (cur / (meta.totalTime || 1)) * 100));
        } catch {
          // Suppress error if timing data unavailable
        }
      }, 250);
    }
  }, [isPlaying]);

  const seek = useCallback((pct: number) => {
    const r = replayerRef.current;
    if (!r) return;
    const meta = r.getMetaData();
    const target = (pct / 100) * (meta.totalTime || 0);
    r.play(target);
    setIsPlaying(true);
  }, []);

  const fmtMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-on-surface truncate max-w-sm">
                {session.start_url || "Session Recording"}
              </p>
              {viewportInfo && (
                <Badge variant="outline" className="text-[10px] flex items-center gap-1 shrink-0">
                  {viewportInfo.w < 768
                    ? <><Smartphone className="w-3 h-3" /> Mobile ({viewportInfo.w}px)</>
                    : <><Monitor className="w-3 h-3" /> Desktop ({viewportInfo.w}px)</>
                  }
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant">
              {session.event_count.toLocaleString()} events ·{" "}
              {formatDistanceToNow(new Date(session.recorded_at), { addSuffix: true })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface text-xl leading-none px-2"
          >
            ✕
          </button>
        </div>

        {/* Player viewport */}
        <div className="flex-1 overflow-hidden bg-[#111] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm z-10">
              Loading recording…
            </div>
          )}
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm z-10">
              Failed to load recording.
            </div>
          )}
          {replayError && (
            <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-sm z-10 bg-black/50">
              <div className="text-center p-4">
                <p className="font-semibold mb-2">⚠️ {replayError}</p>
                <p className="text-xs text-yellow-300/70">The session recording may be incomplete or corrupted.</p>
              </div>
            </div>
          )}
          <div
            ref={containerRef}
            className="replay-viewport w-full h-full"
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-3 border-t border-outline-variant/20 space-y-2">
          {/* Progress bar */}
          <div
            className="w-full h-2 bg-surface-container rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Play / Pause */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={isLoading || !data?.length}
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/80 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Time */}
              <span className="text-xs font-mono text-on-surface-variant tabular-nums">
                {fmtMs(elapsed)} / {fmtMs(totalMs)}
              </span>
            </div>

            {/* Speed + skip inactive */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipInactive}
                  onChange={(e) => setSkipInactive(e.target.checked)}
                  className="accent-primary"
                />
                <SkipForward className="w-3.5 h-3.5" /> Skip inactivity
              </label>

              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="text-xs bg-surface-container border border-outline-variant/30 rounded-md px-2 py-1 text-on-surface"
              >
                {[1, 2, 4, 8].map((s) => (
                  <option key={s} value={s}>{s}×</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Session list row ─────────────────────────────────────────────────────────
function SessionRow({
  session,
  onPlay,
  onDelete,
}: {
  session: ReplaySession;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const domain = session.start_url
    ? (() => { try { return new URL(session.start_url).pathname; } catch { return session.start_url; } })()
    : "—";

  // Heuristic session quality label based on event count
  const isShortSession = session.event_count < 10;
  const isMediumSession = session.event_count >= 10 && session.event_count < 30;

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors group ${isShortSession ? "opacity-60" : ""}`}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Film className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{domain}</p>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1">
            <MousePointer className="w-3 h-3" />
            {session.event_count.toLocaleString()} events
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(session.recorded_at), { addSuffix: true })}
          </span>
          {isShortSession && (
            <span className="text-amber-500 font-medium">· low activity</span>
          )}
          {isMediumSession && (
            <span className="text-blue-500 font-medium">· brief visit</span>
          )}
        </div>
      </div>

      <Badge
        variant={session.status === "complete" ? "default" : "secondary"}
        className="shrink-0"
      >
        {session.status}
      </Badge>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onPlay}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Play className="w-3.5 h-3.5" /> Play
        </button>
        <button
          onClick={onDelete}
          className="text-error hover:text-error/80 transition-colors"
          title="Delete recording"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function Content() {
  const { selectedDomainId } = useAuthStore();
  const [playing, setPlaying] = useState<ReplaySession | null>(null);
  const [hideShort, setHideShort] = useState(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["replay-sessions", selectedDomainId],
    queryFn: () =>
      replayApi.sessions(selectedDomainId!).then((r) => {
        const d = r.data;
        return (Array.isArray(d) ? d : d?.data ?? []) as ReplaySession[];
      }),
    enabled: !!selectedDomainId,
  });

  const handleDelete = async (session: ReplaySession) => {
    if (!selectedDomainId) return;
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    await replayApi.destroy(selectedDomainId, session.session_id);
    refetch();
  };

  const allSessions = data ?? [];
  // Filter sessions with too few events — these are likely dead-click stalls or
  // incomplete recordings where the user landed and immediately left.
  const sessions = hideShort
    ? allSessions.filter((s) => s.event_count >= 10)
    : allSessions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Session Replay</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Watch recorded visitor sessions — every click, scroll, and navigation
        </p>
      </div>

      {/* Instructions banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm text-on-surface-variant">
          <p className="font-semibold text-on-surface mb-1">Enable recording on your site</p>
          <p>
            Add <code className="bg-surface px-1 py-0.5 rounded text-xs font-mono">data-replay=&quot;true&quot;</code> to
            your tracking snippet and load{" "}
            <code className="bg-surface px-1 py-0.5 rounded text-xs font-mono">/tracker/eye-replay.js</code>{" "}
            after it. Recordings respect the <code className="text-xs font-mono">eye-block</code> /
            <code className="text-xs font-mono"> eye-mask</code> CSS classes for privacy.
          </p>
        </CardContent>
      </Card>

      {/* Session list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2 flex-wrap">
            <Film className="w-4 h-4" /> Recorded Sessions
            {allSessions.length > 0 && (
              <span className="ml-auto text-xs font-normal normal-case text-on-surface-variant flex items-center gap-3">
                {allSessions.length - sessions.length > 0 && (
                  <span className="text-on-surface-variant/60">
                    {allSessions.length - sessions.length} short hidden
                  </span>
                )}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideShort}
                    onChange={(e) => setHideShort(e.target.checked)}
                    className="accent-primary"
                  />
                  Hide sessions &lt;10 events
                </label>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-on-surface-variant">Loading recordings…</div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
                <Film className="w-8 h-8 text-on-surface-variant/40" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">No recordings yet</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                  Once you enable the replay module on your site, sessions will appear here within minutes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  onPlay={() => setPlaying(s)}
                  onDelete={() => handleDelete(s)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player modal */}
      {playing && selectedDomainId && (
        <ReplayPlayer
          domainId={selectedDomainId}
          session={playing}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}

export default function ReplayPage() {
  return <Content />;
}

