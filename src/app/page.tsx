"use client";

import { useEffect, useState } from "react";
import { getPosts, getCategories } from "@/lib/posts";
import { Post } from "@/lib/types";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import CategoryBadge from "@/components/CategoryBadge";

export default function HomePage() {
  const [featured, setFeatured] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allPosts = await getPosts({ max: 20 });
        const feat = allPosts.find((p) => p.featured) || null;
        setFeatured(feat);
        setPosts(feat ? allPosts.filter((p) => p.slug !== feat.slug) : allPosts);

        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0066CC] via-[#004C99] to-[#003366]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Engineering Blog
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
              Wifirst<br />
              <span className="text-blue-200">Tech Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 max-w-xl leading-relaxed">
              Engineering insights, technical deep-dives, and innovations from the team building Europe&apos;s leading WiFi infrastructure.
            </p>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading articles...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !featured && posts.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-500">Articles are on their way. Check back soon!</p>
          </div>
        )}

        {/* Featured */}
        {featured && (
          <section className="-mt-8 mb-16 relative z-10">
            <FeaturedPost post={featured} />
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Topics</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <CategoryBadge key={cat} category={cat} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Posts grid */}
        {posts.length > 0 && (
          <section className="pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
