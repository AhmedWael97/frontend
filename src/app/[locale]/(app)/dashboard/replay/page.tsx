import { Film } from "lucide-react";

export default function ReplayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Session Replay</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Watch recorded visitor sessions</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Film className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">Coming Soon</h2>
        <p className="text-on-surface-variant max-w-sm text-sm">
          Session replay is under development. You&apos;ll be able to watch full visitor recordings, with privacy masking and heatmap overlays.
        </p>
        <div className="px-4 py-2 rounded-full border border-primary/30 text-xs font-semibold text-primary bg-primary/5">
          Expected in a future release
        </div>
      </div>
    </div>
  );
}
