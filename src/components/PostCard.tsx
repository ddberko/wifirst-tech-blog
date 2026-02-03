import Link from "next/link";
import Image from "next/image";
import CategoryBadge from "./CategoryBadge";
import { Post } from "@/lib/types";
import ClientDate from "./ClientDate";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
      {post.coverImage ? (
        <Link href={`/post?slug=${post.slug}`} className="block overflow-hidden">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      ) : (
        <Link href={`/post?slug=${post.slug}`} className="block">
          <div className="aspect-video bg-gradient-to-br from-[#0066CC] to-[#004C99] flex items-center justify-center">
            <span className="text-white/20 text-6xl font-bold">{post.title.charAt(0)}</span>
          </div>
        </Link>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={post.category} />
          <span className="text-xs text-gray-400">
            <ClientDate date={post.publishedAt} />
          </span>
        </div>
        <Link href={`/post?slug=${post.slug}`}>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#0066CC] transition-colors mb-2 line-clamp-2 leading-snug">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
          {post.author.avatar ? (
            <Image 
              src={post.author.avatar} 
              alt={post.author.name}
              width={24}
              height={24}
              className="rounded-full bg-gray-100 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0066CC] to-[#3399FF] flex items-center justify-center text-white text-xs font-medium">
              {post.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-500">{post.author.name}</span>
        </div>
      </div>
    </article>
  );
}
