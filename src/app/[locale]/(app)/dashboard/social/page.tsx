"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { socialApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { Facebook, Twitter, Instagram, Sparkles, ImageIcon, Trash2, MessagesSquare, Download } from "lucide-react";

// Fixed platform -> color mapping (never cycled/index-based — see dataviz
// skill). Validated: passes lightness/chroma/CVD checks against this
// dashboard's dark card surface (#171f33), same surface the rest of the
// dashboard's charts already use.
const PLATFORM_COLOR: Record<string, string> = {
  facebook: "#6366f1",
  x: "#0891b2",
  instagram: "#d97706",
};
const PLATFORM_LABEL: Record<string, string> = { facebook: "Facebook", x: "X", instagram: "Instagram" };
const PLATFORM_ICON: Record<string, typeof Facebook> = { facebook: Facebook, x: Twitter, instagram: Instagram };
const PLATFORMS = ["facebook", "x", "instagram"] as const;

const TOOLTIP_STYLE = {
  background: "#171f33",
  border: "1px solid #464554",
  borderRadius: 8,
  color: "#dae2fd",
  fontSize: 12,
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
];

type InboxItem = {
  id: number; platform: string; item_type: string; author_name: string | null;
  author_handle: string | null; message: string | null; status: string; draft_reply: string | null;
};
type ScheduledPost = {
  id: number; platform: string; language: string; content: string; image_url: string | null;
  video_url: string | null; scheduled_at: string; status: string;
};
type DailyRow = { day: string; platform: string; total: number | string };
type ByPlatformRow = { platform: string; total: number | string; unread: number | string; replied: number | string };

function pivotDaily(daily: DailyRow[]) {
  const map = new Map<string, Record<string, string | number>>();
  for (const row of daily) {
    const entry = map.get(row.day) ?? { day: row.day };
    entry[row.platform] = Number(row.total);
    map.set(row.day, entry);
  }
  return Array.from(map.values()).sort((a, b) => String(a.day).localeCompare(String(b.day)));
}

function unwrap<T>(res: any): T {
  return (res.data?.data ?? res.data) as T;
}

function InboxTab() {
  const qc = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  const { data: summary } = useQuery({
    queryKey: ["social-inbox-summary"],
    queryFn: () => socialApi.inboxSummary().then((r: any) => unwrap<{ by_platform: ByPlatformRow[]; daily: DailyRow[] }>(r)),
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["social-inbox", platformFilter],
    queryFn: () => socialApi.inbox(platformFilter ? { platform: platformFilter } : undefined).then((r: any) => unwrap<InboxItem[]>(r)),
  });

  const draftMutation = useMutation({
    mutationFn: (id: number) => socialApi.inboxDraft(id).then((r: any) => unwrap<{ reply: string }>(r)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social-inbox"] }),
    onError: (e: any) => toast.error(e?.message ?? "AI draft failed."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "replied" | "dismissed" }) => socialApi.inboxStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-inbox"] });
      qc.invalidateQueries({ queryKey: ["social-inbox-summary"] });
    },
  });

  const detectedPlatforms = (summary?.by_platform ?? []).map((p) => p.platform);
  const dailyData = useMemo(() => pivotDaily(summary?.daily ?? []), [summary]);
  const totalUnread = (summary?.by_platform ?? []).reduce((sum, p) => sum + Number(p.unread), 0);
  const totalReplied = (summary?.by_platform ?? []).reduce((sum, p) => sum + Number(p.replied), 0);
  const totalItems = (summary?.by_platform ?? []).reduce((sum, p) => sum + Number(p.total), 0);

  return (
    <div className="space-y-6">
      {detectedPlatforms.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-on-surface-variant">
            No data yet. Download the extension (button above), install it, log in, then browse
            Facebook/X/Instagram (logged in) — comments and DMs sync here automatically.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-on-surface-variant">Total items</p><p className="text-2xl font-black text-on-surface">{totalItems}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-on-surface-variant">Unread</p><p className="text-2xl font-black text-on-surface">{totalUnread}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-on-surface-variant">Replied</p><p className="text-2xl font-black text-on-surface">{totalReplied}</p></CardContent></Card>
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-1.5 items-center">
            {detectedPlatforms.length === 0 && <span className="text-xs text-on-surface-variant">No platforms detected</span>}
            {detectedPlatforms.map((p) => {
              const Icon = PLATFORM_ICON[p];
              return (
                <span key={p} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: `${PLATFORM_COLOR[p]}22`, color: PLATFORM_COLOR[p] }}>
                  {Icon && <Icon className="w-3 h-3" />} {PLATFORM_LABEL[p]}
                </span>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {dailyData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">Activity — last 14 days</CardTitle></CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RTooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#c7c4d7" }} formatter={(v) => PLATFORM_LABEL[v] ?? v} />
                {PLATFORMS.map((p) => (
                  <Bar key={p} dataKey={p} stackId="volume" fill={PLATFORM_COLOR[p]} radius={[0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => setPlatformFilter(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!platformFilter ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>All</button>
        {PLATFORMS.map((p) => (
          <button key={p} onClick={() => setPlatformFilter(p)} disabled={!detectedPlatforms.includes(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 ${platformFilter === p ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>
            {PLATFORM_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-on-surface-variant">Loading…</p>}
        {!isLoading && (items ?? []).length === 0 && detectedPlatforms.length > 0 && (
          <p className="text-sm text-on-surface-variant">Nothing here.</p>
        )}
        {(items ?? []).map((item) => (
          <InboxRow key={item.id} item={item} onDraft={() => draftMutation.mutate(item.id)}
            onStatus={(status) => statusMutation.mutate({ id: item.id, status })} />
        ))}
      </div>
    </div>
  );
}

function InboxRow({ item, onDraft, onStatus }: { item: InboxItem; onDraft: () => void; onStatus: (s: "replied" | "dismissed") => void }) {
  const Icon = PLATFORM_ICON[item.platform];
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span className="inline-flex items-center gap-1 font-medium" style={{ color: PLATFORM_COLOR[item.platform] }}>
            {Icon && <Icon className="w-3.5 h-3.5" />} {PLATFORM_LABEL[item.platform]} · {item.item_type}
          </span>
          <span>{item.status}</span>
        </div>
        <p className="text-sm text-on-surface">
          <strong>{item.author_name || item.author_handle || "Someone"}:</strong> {item.message}
        </p>
        {item.draft_reply && (
          <div className="rounded-lg bg-surface-container p-2 text-sm text-on-surface-variant">
            <span className="text-xs font-semibold text-on-surface">AI draft: </span>{item.draft_reply}
            <p className="text-xs mt-1 text-on-surface-variant/70">Open the extension popup on the live tab to insert this into the reply box.</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onDraft}><Sparkles className="w-3.5 h-3.5 me-1" /> AI Draft</Button>
          <Button size="sm" variant="outline" onClick={() => onStatus("replied")}>Mark replied</Button>
          <Button size="sm" variant="outline" onClick={() => onStatus("dismissed")}>Dismiss</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ComposeTab() {
  const qc = useQueryClient();
  const [platform, setPlatform] = useState("x");
  const [language, setLanguage] = useState("en");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["social-settings"],
    queryFn: () => socialApi.settingsShow().then((r: any) => unwrap<{ has_openai_key: boolean; has_comfyui: boolean }>(r)),
  });
  const canGenerateImage = settings?.has_openai_key || settings?.has_comfyui;

  const { data: posts } = useQuery({
    queryKey: ["scheduled-posts"],
    queryFn: () => socialApi.posts().then((r: any) => unwrap<ScheduledPost[]>(r)),
  });

  const genText = useMutation({
    mutationFn: () => socialApi.generateText({ platform, language, prompt }).then((r: any) => unwrap<{ content: string }>(r)),
    onSuccess: (data) => setContent(data.content),
    onError: (e: any) => toast.error(e?.message ?? "AI text generation failed."),
  });

  const genImage = useMutation({
    mutationFn: () => socialApi.generateImage(prompt || content).then((r: any) => unwrap<{ image_url: string }>(r)),
    onSuccess: (data) => { setImageUrl(data.image_url); setVideoUrl(null); },
    onError: (e: any) => toast.error(e?.message ?? "Image generation failed."),
  });

  const genVideo = useMutation({
    mutationFn: () => socialApi.generateVideo(imageUrl!).then((r: any) => unwrap<{ video_url: string }>(r)),
    onSuccess: (data) => setVideoUrl(data.video_url),
    onError: (e: any) => toast.error(e?.message ?? "Video generation failed."),
  });

  const createPost = useMutation({
    mutationFn: () => socialApi.createPost({ platform, language, prompt, content, image_url: imageUrl, video_url: videoUrl, scheduled_at: scheduledAt }),
    onSuccess: () => {
      toast.success("Queued. The extension will fill it in next time that platform's tab is open.");
      qc.invalidateQueries({ queryKey: ["scheduled-posts"] });
      setContent(""); setImageUrl(null); setVideoUrl(null); setScheduledAt("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not queue post."),
  });

  const deletePost = useMutation({
    mutationFn: (id: number) => socialApi.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });

  const inputCls = "w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">Compose with AI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select className={inputCls} value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}
            </select>
            <select className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <textarea className={inputCls + " min-h-[70px]"} placeholder="What should the post be about? (your prompt to the AI)"
            value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!prompt || genText.isPending} onClick={() => genText.mutate()}>
              <Sparkles className="w-3.5 h-3.5 me-1" /> {genText.isPending ? "Generating…" : "Generate text"}
            </Button>
            <Button size="sm" variant="outline" disabled={(!prompt && !content) || genImage.isPending || !canGenerateImage} onClick={() => genImage.mutate()}
              title={!canGenerateImage ? "Add your OpenAI API key in Settings first" : undefined}>
              <ImageIcon className="w-3.5 h-3.5 me-1" /> {genImage.isPending ? "Generating…" : "Generate image"}
            </Button>
            {imageUrl && (
              <Button size="sm" variant="outline" disabled={!settings?.has_comfyui || genVideo.isPending} onClick={() => genVideo.mutate()}
                title={!settings?.has_comfyui ? "Needs the ComfyUI GPU box configured" : undefined}>
                {genVideo.isPending ? "Animating…" : "Animate to video"}
              </Button>
            )}
          </div>
          {!canGenerateImage && <p className="text-xs text-on-surface-variant">Image generation needs your OpenAI API key (or our ComfyUI box) — add it in the Settings tab.</p>}

          <textarea className={inputCls + " min-h-[90px]"} placeholder="Post content (edit freely)" value={content} onChange={(e) => setContent(e.target.value)} />
          {videoUrl ? (
            <video src={videoUrl} controls className="rounded-lg max-h-56" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="Generated" className="rounded-lg max-h-56 object-cover" />
          ) : null}

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs text-on-surface-variant">Schedule for</label>
              <input type="datetime-local" className={inputCls} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <Button disabled={!content || !scheduledAt || createPost.isPending} onClick={() => createPost.mutate()}>
              Queue post
            </Button>
          </div>
          <p className="text-xs text-on-surface-variant">
            No server-side auto-publish — the extension fills this into the compose box next time you have
            that platform open, and notifies you. You still click Post yourself.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">Queued &amp; past posts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(posts ?? []).length === 0 && <p className="text-sm text-on-surface-variant">Nothing queued yet.</p>}
          {(posts ?? []).map((p) => {
            const Icon = PLATFORM_ICON[p.platform];
            return (
              <div key={p.id} className="flex items-start justify-between gap-3 rounded-lg bg-surface-container p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: PLATFORM_COLOR[p.platform] }}>
                    {Icon && <Icon className="w-3.5 h-3.5" />} {PLATFORM_LABEL[p.platform]} · {new Date(p.scheduled_at).toLocaleString()} · {p.status}
                  </div>
                  <p className="text-sm text-on-surface truncate">{p.content}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deletePost.mutate(p.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsTab() {
  const qc = useQueryClient();
  const [key, setKey] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["social-settings"],
    queryFn: () => socialApi.settingsShow().then((r: any) => unwrap<{ has_openai_key: boolean }>(r)),
  });

  const save = useMutation({
    mutationFn: () => socialApi.settingsUpdate(key || null),
    onSuccess: () => {
      toast.success("Saved.");
      setKey("");
      qc.invalidateQueries({ queryKey: ["social-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save."),
  });

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">OpenAI API key</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-on-surface-variant">
            Used only for AI image generation (Claude doesn&apos;t generate images). Stored encrypted, billed to
            your own OpenAI account.
          </p>
          <p className="text-xs text-on-surface-variant">
            Current: {settings?.has_openai_key ? <span className="text-green-500 font-medium">key saved</span> : <span>none set</span>}
          </p>
          <input type="password" placeholder="sk-…" value={key} onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface" />
          <div className="flex gap-2">
            <Button size="sm" disabled={!key || save.isPending} onClick={() => save.mutate()}>Save</Button>
            {settings?.has_openai_key && <Button size="sm" variant="outline" onClick={() => { setKey(""); save.mutate(); }}>Clear key</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">Chrome extension</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-on-surface-variant">
          <p>This page reads what the <strong>EYE Social Manager</strong> Chrome extension syncs from your own
            logged-in Facebook/X/Instagram tabs — it never sees your platform password or session.</p>
          <p>
            <a href="/downloads/eye-social-manager-extension.zip" download className="text-primary underline font-medium">
              Download the extension (.zip)
            </a>, unzip it, then: <code>chrome://extensions</code> → Developer mode → Load unpacked → pick the
            unzipped <code>eye-social-manager-extension</code> folder → log in with this EYE account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Content() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <MessagesSquare className="w-6 h-6 text-primary" /> Social Manager
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Unified Facebook/X/Instagram inbox synced from the Chrome extension, AI-assisted replies, and an
            AI post composer with scheduling.
          </p>
        </div>
        <a href="/downloads/eye-social-manager-extension.zip" download>
          <Button size="sm"><Download className="w-3.5 h-3.5 me-1" /> Download extension</Button>
        </a>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="compose">Compose &amp; Schedule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox"><InboxTab /></TabsContent>
        <TabsContent value="compose"><ComposeTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

export default function SocialManagerPage() {
  return <Content />;
}
