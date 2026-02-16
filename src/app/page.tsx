"use client";

import { useEffect, useState } from "react";
import { getPosts, getCategories } from "@/lib/posts";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import CategoryBadge from "@/components/CategoryBadge";
import AuthGuard from "@/components/AuthGuard";
import { Post } from "@/lib/types";

function HomeContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featured, setFeatured] = useState<Post | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("[Home] Starting to load posts...");
        const allPosts = await getPosts({ max: 20 });
        console.log("[Home] Raw posts fetched:", allPosts);
        
        if (!allPosts || allPosts.length === 0) {
          console.warn("[Home] No posts returned from getPosts()");
        }

        const feat = allPosts.find((p) => p.featured) || null;
        console.log("[Home] Featured post found:", feat?.title || "None");
        setFeatured(feat);
        
        const otherPosts = feat ? allPosts.filter((p) => p.slug !== feat.slug) : allPosts;
        console.log("[Home] Setting posts to state, count:", otherPosts.length);
        setPosts(otherPosts);
        
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load home data:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-400">
      <div className="animate-pulse mb-4 text-2xl font-bold">Wifirst Tech</div>
      Loading engineering insights...
    </div>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0066CC] via-[#004C99] to-[#003366]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
              Wifirst<br />
              <span className="text-blue-200">Tech Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 max-w-xl leading-relaxed">
              Engineering insights, technical deep-dives, and innovations in networking, AI, and software engineering.
            </p>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Empty state */}
        {posts.length === 0 && !featured && (
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

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
