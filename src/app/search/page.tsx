"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchPosts } from "@/lib/posts";
import { Post } from "@/lib/types";
import PostCard from "@/components/PostCard";
import SearchBar from "@/components/SearchBar";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    searchPosts(q)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      {q && (
        <p className="text-gray-500 mb-8">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching...
            </span>
          ) : (
            <span>
              <span className="font-semibold text-gray-900">{posts.length}</span> result{posts.length !== 1 ? "s" : ""} for &ldquo;<span className="text-[#0066CC]">{q}</span>&rdquo;
            </span>
          )}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {!loading && q && posts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No results found</h2>
          <p className="text-gray-500 text-sm">Try different keywords or browse categories.</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#0066CC] to-[#004C99] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">Search</h1>
          <div className="max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
          <SearchResults />
        </Suspense>
      </div>
    </>
  );
}
