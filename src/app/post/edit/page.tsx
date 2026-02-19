"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPostBySlug, updatePost, getCategories } from "@/lib/posts";
import { Post, PostStatus } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

function EditPostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function loadPost() {
      try {
        const [post, cats] = await Promise.all([
          getPostBySlug(slug),
          getCategories(),
        ]);

        if (post) {
          setTitle(post.title);
          setExcerpt(post.excerpt);
          setContent(post.content);
          setCategory(post.category);
          setTags(post.tags?.join(", ") || "");
          setCoverImage(post.coverImage || "");
          setStatus(post.status || "draft");
        }

        setCategories(cats);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load the article");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const result = await updatePost(slug, {
        title,
        excerpt,
        content,
        category,
        tags: tagsArray,
        coverImage,
        status,
      });

      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Failed to update the article");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading article...
        </div>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No article specified</h1>
        <p className="text-gray-500 mb-4">Please provide a slug parameter in the URL.</p>
        <Link href="/admin" className="text-[#0066CC] hover:underline">
          Go to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-[#0066CC] mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
        </div>
        <Link
          href={`/post?slug=${slug}`}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Article
        </Link>
      </div>

      {/* Status messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-sm text-green-600">Article saved successfully!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Status toggle */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Publication Status</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStatus("draft")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                status === "draft"
                  ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                  : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus("published")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                status === "published"
                  ? "bg-green-100 text-green-800 border-2 border-green-300"
                  : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
              }`}
            >
              Published
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all"
            placeholder="Article title"
            required
          />
        </div>

        {/* Excerpt */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all resize-none"
            placeholder="Short description of the article"
            required
          />
        </div>

        {/* Category and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categories"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all"
              placeholder="e.g., WiFi, Infrastructure"
              required
            />
            <datalist id="categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all"
              placeholder="e.g., wifi6, mesh, performance"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <label htmlFor="coverImage" className="block text-sm font-semibold text-gray-700 mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all"
            placeholder="https://..."
          />
          {coverImage && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full max-w-md h-40 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Content (Markdown)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all font-mono text-sm resize-y"
            placeholder="Write your article content in Markdown..."
            required
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/admin"
            className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-[#0052a3] shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <AuthGuard requiredRole={["publisher", "admin"]}>
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-400">
            Loading...
          </div>
        }
      >
        <EditPostContent />
      </Suspense>
    </AuthGuard>
  );
}
