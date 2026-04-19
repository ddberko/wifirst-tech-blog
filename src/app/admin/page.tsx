"use client";

import { useEffect, useState } from "react";
import { getPosts, updatePostStatus, updatePost } from "@/lib/posts";
import { Post, PostStatus } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import ClientDate from "@/components/ClientDate";

function AdminContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<{title: string, analysis: any} | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const allPosts = await getPosts({ includeDrafts: true });
      setPosts(allPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusToggle(slug: string, currentStatus: PostStatus) {
    const newStatus: PostStatus = currentStatus === "published" ? "draft" : "published";
    setUpdating(slug);

    try {
      const success = await updatePostStatus(slug, newStatus);
      if (success) {
        setPosts((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  }

  async function handleFeaturedToggle(slug: string, currentFeatured: boolean) {
    const newFeatured = !currentFeatured;
    setUpdating(slug);

    try {
      const success = await updatePost(slug, { featured: newFeatured });
      if (success) {
        setPosts((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, featured: newFeatured } : p))
        );
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
    } finally {
      setUpdating(null);
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading articles...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your blog articles</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Utilisateurs
          </Link>
          <Link
            href="/admin/subscribers"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Abonnés
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2 text-sm font-medium text-white bg-[#0066CC] rounded-lg hover:bg-[#0052a3] transition-colors"
          >
            Analytics
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Blog
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total Articles</p>
          <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Published</p>
          <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Drafts</p>
          <p className="text-3xl font-bold text-yellow-600">{draftCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
            filter === "all"
              ? "bg-[#0066CC] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({posts.length})
        </button>
        <button
          onClick={() => setFilter("published")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
            filter === "published"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
            filter === "draft"
              ? "bg-yellow-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Articles list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No articles found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Article</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Score</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPosts.map((post) => (
                  <tr key={post.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleFeaturedToggle(post.slug, post.featured || false)}
                          disabled={updating === post.slug}
                          className={`shrink-0 transition-colors ${
                            post.featured ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                          }`}
                          title={post.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-sm text-gray-500 truncate">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {post.analysis ? (
                        <div 
                          className="flex flex-col gap-1 cursor-pointer hover:bg-gray-100 p-1 -m-1 rounded transition-colors" 
                          title="Cliquez pour voir le rapport détaillé"
                          onClick={() => setSelectedAnalysis({ title: post.title, analysis: post.analysis })}
                        >
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${post.analysis.technicalScore >= 8 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>Tech: {post.analysis.technicalScore}/10</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${post.analysis.editorialScore >= 8 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>Edito: {post.analysis.editorialScore}/10</span>
                          {post.analysis.factCheckPassed ? (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">✓ Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">✗ Fact Check</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ClientDate date={post.publishedAt} format="short" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/post?slug=${post.slug}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/post/edit?slug=${post.slug}`}
                          className="p-2 text-gray-400 hover:text-[#0066CC] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(post.slug, post.status)}
                          disabled={updating === post.slug}
                          className={`p-2 rounded-lg transition-colors ${
                            post.status === "published"
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          } disabled:opacity-50`}
                          title={post.status === "published" ? "Unpublish" : "Publish"}
                        >
                          {updating === post.slug ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : post.status === "published" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <div key={post.slug} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <button
                        onClick={() => handleFeaturedToggle(post.slug, post.featured || false)}
                        disabled={updating === post.slug}
                        className={`mt-0.5 shrink-0 transition-colors ${
                          post.featured ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">{post.title}</h3>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  {post.analysis && (
                    <div 
                      className="flex flex-wrap gap-1 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedAnalysis({ title: post.title, analysis: post.analysis })}
                    >
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${post.analysis.technicalScore >= 8 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>Tech: {post.analysis.technicalScore}/10</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${post.analysis.editorialScore >= 8 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>Edito: {post.analysis.editorialScore}/10</span>
                      {post.analysis.factCheckPassed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">✓ Verified</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">✗ Fact Check</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        <ClientDate date={post.publishedAt} format="short" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/post?slug=${post.slug}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/post/edit?slug=${post.slug}`}
                        className="p-2 text-gray-400 hover:text-[#0066CC] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(post.slug, post.status)}
                        disabled={updating === post.slug}
                        className={`p-2 rounded-lg transition-colors ${
                          post.status === "published"
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        } disabled:opacity-50`}
                      >
                        {updating === post.slug ? (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : post.status === "published" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">
                Rapport d'Analyse : {selectedAnalysis.title}
              </h3>
              <button 
                onClick={() => setSelectedAnalysis(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Score Technique</p>
                <p className={`text-2xl font-bold ${selectedAnalysis.analysis.technicalScore >= 8 ? 'text-blue-600' : 'text-gray-900'}`}>
                  {selectedAnalysis.analysis.technicalScore}/10
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Score Éditorial</p>
                <p className={`text-2xl font-bold ${selectedAnalysis.analysis.editorialScore >= 8 ? 'text-purple-600' : 'text-gray-900'}`}>
                  {selectedAnalysis.analysis.editorialScore}/10
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Fact Checking</p>
                <div className="flex items-center justify-center h-8">
                  {selectedAnalysis.analysis.factCheckPassed ? (
                    <span className="flex items-center text-green-600 font-bold gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Validé
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 font-bold gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Échec
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Commentaire de l'évaluateur IA
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedAnalysis.analysis.comment}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedAnalysis(null)}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminContent />
    </AuthGuard>
  );
}
