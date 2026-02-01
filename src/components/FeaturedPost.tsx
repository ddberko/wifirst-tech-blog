import Link from "next/link";
import { Post } from "@/lib/types";

export default function FeaturedPost({ post }: { post: Post }) {
  return (
    <article className="group relative rounded-2xl overflow-hidden">
      <Link href={`/post?slug=${post.slug}`} className="block">
        <div className="relative aspect-[21/9] min-h-[360px]">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC] via-[#004C99] to-[#003366]" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  ✦ Featured
                </span>
                <span className="bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                  {post.category}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-blue-100 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-200 text-base md:text-lg mb-4 line-clamp-2 max-w-2xl">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-medium">
                    {post.author?.charAt(0)?.toUpperCase() || "W"}
                  </div>
                  <span>{post.author}</span>
                </div>
                <span className="text-gray-500">&middot;</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
