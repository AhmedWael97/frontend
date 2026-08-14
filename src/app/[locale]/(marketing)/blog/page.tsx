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
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">{ar ? "المدوّنة" : "Blog"}</h1>
        <p className="text-neutral-400 text-lg mb-10">{ar ? "قصص وحلول من داخل EYE." : "Stories and lessons from inside EYE."}</p>

        {posts.length === 0 ? (
          <p className="text-neutral-500">{ar ? "لا توجد مقالات بعد." : "No posts yet — check back soon."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#262626] border border-[#262626]">
            {posts.map((p) => (
              <Link key={p.slug} href={`/${params.locale}/blog/${p.slug}`} className="group bg-black hover:bg-[#0A0A0A] transition-colors overflow-hidden">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt="" className="w-full h-44 object-cover border-b border-[#262626]" />
                )}
                <div className="p-5">
                  <h2 className="font-bold text-white group-hover:text-[#00E5FF] transition-colors" dir={ar ? "rtl" : "ltr"}>{t(p, "title")}</h2>
                  {t(p, "excerpt") && <p className="text-sm text-neutral-400 mt-2 line-clamp-3" dir={ar ? "rtl" : "ltr"}>{t(p, "excerpt")}</p>}
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
