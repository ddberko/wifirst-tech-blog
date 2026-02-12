"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { Post } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CategoryBadge from "@/components/CategoryBadge";
import PostCard from "@/components/PostCard";
import ClientDate from "@/components/ClientDate";
import AuthGuard from "@/components/AuthGuard";
import NewsletterButton from "@/components/NewsletterButton";
/* eslint-disable @next/next/no-img-element */

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return <div className="reading-progress" style={{ width: `${progress}%` }} />;
}

function PostContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      console.log("[PostPage] No slug provided");
      setLoading(false);
      return;
    }
    async function load() {
      console.log("[PostPage] Loading slug:", slug);
      setError(null);
      try {
        const p = await getPostBySlug(slug);
        console.log("[PostPage] Post result:", p ? p.title : "null");
        setPost(p);
        if (p) {
          const all = await getPosts({ category: p.category, max: 4 });
          setRelated(all.filter((r) => r.slug !== p.slug).slice(0, 3));
        }
      } catch (err) {
        console.error("[PostPage] Error loading post:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load article: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="inline-flex items-center gap-3 text-gray-400">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading article...
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Article</h1>
      <p className="text-red-600 font-mono text-sm bg-red-50 px-4 py-3 rounded-lg inline-block mb-4">{error}</p>
      <p className="text-gray-500 text-sm">Slug: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code></p>
    </div>
  );

  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
      <p className="text-gray-500 mb-2">The article you&apos;re looking for doesn&apos;t exist.</p>
      <p className="text-gray-400 text-sm">Slug: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code></p>
    </div>
  );

  return (
    <>
      <ReadingProgress />

      {/* Hero image */}
      {post.coverImage && (
        <div className="relative w-full max-w-5xl mx-auto px-4 mt-8">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <article className="max-w-5xl mx-auto px-4 py-12">
        {/* Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={post.category} />
            {post.tags?.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">#{tag}</span>
            ))}
            {post.tags && post.tags.length > 5 && (
              <span className="text-xs text-gray-300">+{post.tags.length - 5}</span>
            )}
          </div>
          {/* Edit button - visible for authenticated users */}
          <Link
            href={`/post/edit?slug=${slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0066CC] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.15]">
          {post.title}
        </h1>

        {/* Author bar */}
        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover shadow-md shadow-gray-200/50"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0066CC] to-[#3399FF] flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-blue-200/50">
              {post.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-500">{post.author.role}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              <ClientDate date={post.publishedAt} format="long" />
            </p>
          </div>
        </div>

        {/* Content */}
        <MarkdownRenderer content={post.content} />

        {/* Newsletter CTA */}
        <div className="mt-16">
          <NewsletterButton variant="full" />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => <PostCard key={r.slug} post={r} />)}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

export default function PostPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="max-w-3xl mx-auto px-4 py-24 text-center text-gray-400">Loading...</div>
      }>
        <PostContent />
      </Suspense>
    </AuthGuard>
  );
}
