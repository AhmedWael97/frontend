import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = { title: "Blog" };

type Post = {
  slug: string; title_en: string; title_ar?: string;
  excerpt_en?: string; excerpt_ar?: string; cover_image_url?: string | null; published_at?: string;
};

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/v1/blog`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? json) as Post[];
  } catch {
    return [];
  }
}

export default async function BlogPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  const posts = await getPosts();
  const t = (p: Post, k: "title" | "excerpt") =>
    ar ? ((p as any)[`${k}_ar`] || (p as any)[`${k}_en`]) : (p as any)[`${k}_en`];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">{ar ? "المدوّنة" : "Blog"}</h1>
        <p className="text-on-surface-variant text-lg mb-10">{ar ? "قصص وحلول من داخل EYE." : "Stories and lessons from inside EYE."}</p>

        {posts.length === 0 ? (
          <p className="text-on-surface-variant">{ar ? "لا توجد مقالات بعد." : "No posts yet — check back soon."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((p) => (
              <Link key={p.slug} href={`/${params.locale}/blog/${p.slug}`} className="group rounded-2xl border border-outline-variant/15 overflow-hidden hover:border-primary/30 transition-colors">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt="" className="w-full h-44 object-cover" />
                )}
                <div className="p-5">
                  <h2 className="font-black text-on-surface group-hover:text-primary transition-colors" dir={ar ? "rtl" : "ltr"}>{t(p, "title")}</h2>
                  {t(p, "excerpt") && <p className="text-sm text-on-surface-variant mt-2 line-clamp-3" dir={ar ? "rtl" : "ltr"}>{t(p, "excerpt")}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer locale={params.locale} />
    </div>
  );
}
