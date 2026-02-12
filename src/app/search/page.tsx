"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(q);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "articles"));
      const lowerTerm = term.toLowerCase();
      const results = snap.docs
        .map((doc) => {
          const data = doc.data();
          return {
            ...data,
            status: data.status || "published",
            publishedAt: data.publishedAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Post;
        })
        .filter((p) => p.status === "published")
        .filter(
          (p) =>
            p.title?.toLowerCase().includes(lowerTerm) ||
            p.excerpt?.toLowerCase().includes(lowerTerm) ||
            p.tags?.some((t: string) => t.toLowerCase().includes(lowerTerm)) ||
            p.category?.toLowerCase().includes(lowerTerm)
        )
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      setPosts(results);
    } catch (err) {
      console.error("Search error:", err);
      setError(`Erreur de recherche : ${err instanceof Error ? err.message : String(err)}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchInput(q);
    if (q) doSearch(q);
  }, [q, doSearch]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search/?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  return (
    <>
      <section className="bg-gradient-to-br from-[#0066CC] to-[#004C99] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">Recherche</h1>
          <div className="max-w-2xl">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher des articles..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-white/30 shadow-sm transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-white/20 backdrop-blur text-white px-6 sm:px-8 py-3.5 rounded-2xl text-base font-medium hover:bg-white/30 transition-all"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {q && (
          <p className="text-gray-500 mb-8">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Recherche en cours...
              </span>
            ) : (
              <span>
                <span className="font-semibold text-gray-900">{posts.length}</span> résultat{posts.length !== 1 ? "s" : ""} pour &laquo;&nbsp;<span className="text-[#0066CC]">{q}</span>&nbsp;&raquo;
              </span>
            )}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {!loading && q && posts.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Aucun résultat</h2>
            <p className="text-gray-500 text-sm">Essayez d&apos;autres mots-clés ou parcourez les catégories.</p>
          </div>
        )}

        {!q && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Recherchez un article</h2>
            <p className="text-gray-500 text-sm">Tapez un mot-clé ci-dessus pour trouver des articles.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
