"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPosts } from "@/lib/posts";
import { Post } from "@/lib/types";
import PostCard from "@/components/PostCard";

function CategoryContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("name") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) { setLoading(false); return; }
    async function load() {
      try { setPosts(await getPosts({ category })); } catch { /* */ } finally { setLoading(false); }
    }
    load();
  }, [category]);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0066CC] to-[#004C99] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-4 border border-white/10">
            Category
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{category || "Categories"}</h1>
          <p className="text-blue-100/70 mt-3 text-lg">
            {posts.length > 0 ? `${posts.length} article${posts.length !== 1 ? "s" : ""}` : "Explore articles"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </div>
          </div>
        )}
        {!loading && posts.length === 0 && (
          <p className="text-gray-400 text-center py-16">No articles found in this category.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
      </div>
    </>
  );
}

export default function CategoryPage() {
  return <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading...</div>}><CategoryContent /></Suspense>;
}
