"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "@/api/blog";
import { toast } from "@/lib/use-toast";
import { Plus, Trash2, Pencil, X, Loader2, Image as ImageIcon } from "lucide-react";

type Post = {
  id: number; slug: string; status: string;
  title_en: string; title_ar?: string;
  excerpt_en?: string; excerpt_ar?: string;
  body_en?: string; body_ar?: string;
  cover_image_url?: string | null; published_at?: string | null;
};

const EMPTY: Partial<Post> = { title_en: "", title_ar: "", excerpt_en: "", excerpt_ar: "", body_en: "", body_ar: "", status: "draft" };

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => blogApi.adminList().then((r) => r.data as Post[]),
  });
  const posts = data || [];

  const del = useMutation({
    mutationFn: (id: number) => blogApi.adminDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog"] }); toast.success("Deleted."); },
  });

  const save = async () => {
    if (!editing?.title_en) { toast.error("English title required."); return; }
    setSaving(true);
    const fd = new FormData();
    ["title_en", "title_ar", "excerpt_en", "excerpt_ar", "body_en", "body_ar", "status", "slug"].forEach((k) => {
      const v = (editing as any)[k];
      if (v != null && v !== "") fd.append(k, v);
    });
    if (file) fd.append("cover_image", file);
    try {
      if (editing.id) await blogApi.adminUpdate(editing.id, fd);
      else await blogApi.adminCreate(fd);
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("Saved.");
      setEditing(null); setFile(null);
    } catch (e: any) {
      toast.error(e?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const field = (k: keyof Post, label: string, textarea = false, dir?: string) => (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
      {textarea ? (
        <textarea dir={dir} rows={6} value={(editing as any)?.[k] || ""} onChange={(e) => setEditing((s) => ({ ...s!, [k]: e.target.value }))} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
      ) : (
        <input dir={dir} value={(editing as any)?.[k] || ""} onChange={(e) => setEditing((s) => ({ ...s!, [k]: e.target.value }))} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Blog</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Bilingual posts for the marketing site (EN / AR).</p>
        </div>
        <button onClick={() => { setEditing({ ...EMPTY }); setFile(null); }} className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-2 text-sm font-bold"><Plus className="w-4 h-4" /> New post</button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {isLoading && <div className="p-6 text-sm text-on-surface-variant">Loading…</div>}
        {!isLoading && posts.length === 0 && <div className="p-8 text-center text-sm text-on-surface-variant">No posts yet.</div>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <div className="w-14 h-14 rounded-lg bg-surface-container-high overflow-hidden shrink-0 flex items-center justify-center">
              {p.cover_image_url ? <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-on-surface-variant" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface truncate">{p.title_en}</p>
              <p className="text-xs text-on-surface-variant">/{p.slug} · <span className={p.status === "published" ? "text-emerald-400" : "text-amber-400"}>{p.status}</span></p>
            </div>
            <button onClick={() => { setEditing(p); setFile(null); }} className="p-2 text-on-surface-variant hover:text-on-surface"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => confirm("Delete this post?") && del.mutate(p.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {/* Editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-2xl bg-surface h-full overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-on-surface">{editing.id ? "Edit post" : "New post"}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cover image</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-on-surface-variant" />
              {editing.cover_image_url && !file && <img src={editing.cover_image_url} alt="" className="mt-2 h-32 rounded-lg object-cover" />}
            </div>

            {field("title_en", "Title (EN)")}
            {field("title_ar", "العنوان (AR)", false, "rtl")}
            {field("excerpt_en", "Excerpt (EN)", true)}
            {field("excerpt_ar", "المقتطف (AR)", true, "rtl")}
            {field("body_en", "Body (EN)", true)}
            {field("body_ar", "المحتوى (AR)", true, "rtl")}
            {field("slug", "Slug (optional — auto from title)")}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</label>
              <select value={editing.status} onChange={(e) => setEditing((s) => ({ ...s!, status: e.target.value }))} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <button onClick={save} disabled={saving} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-3 text-sm font-bold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
