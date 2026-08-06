import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { SITE_URL, localePath } from "@/lib/seo";

type Post = {
  slug: string; title_en: string; title_ar?: string;
  excerpt_en?: string; excerpt_ar?: string; body_en?: string; body_ar?: string;
  cover_image_url?: string | null; published_at?: string;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/v1/blog/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? json) as Post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Blog" };
  const ar = params.locale === "ar";
  const title = ar ? (post.title_ar || post.title_en) : post.title_en;
  const desc = ar ? (post.excerpt_ar || post.excerpt_en) : post.excerpt_en;
  return {
    title,
    description: desc || undefined,
    openGraph: { title, description: desc || undefined, images: post.cover_image_url ? [post.cover_image_url] : undefined },
    alternates: { canonical: `${SITE_URL}${localePath(params.locale, `/blog/${post.slug}`)}` },
  };
}

export default async function BlogPostPage({ params }: { params: { locale: string; slug: string } }) {
  const ar = params.locale === "ar";
  const post = await getPost(params.slug);
  if (!post) notFound();

  const title = ar ? (post.title_ar || post.title_en) : post.title_en;
  const body = ar ? (post.body_ar || post.body_en) : post.body_en;
  const desc = ar ? (post.excerpt_ar || post.excerpt_en) : post.excerpt_en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: desc || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.published_at,
    inLanguage: ar ? "ar" : "en",
    author: { "@type": "Organization", name: "EYE Analytics" },
    publisher: { "@type": "Organization", name: "EYE Analytics", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${params.locale}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <article className="max-w-3xl mx-auto px-4 py-16 sm:py-20" dir={ar ? "rtl" : "ltr"}>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">{title}</h1>
        {post.cover_image_url && <img src={post.cover_image_url} alt="" className="w-full rounded-2xl mb-8" />}
        <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap text-[15px]">{body}</div>
      </article>
      <Footer locale={params.locale} />
    </div>
  );
}
