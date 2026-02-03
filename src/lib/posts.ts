import postsData from "@/data/posts.json";
import { Post } from "./types";

// Static posts loaded at build time - no Firestore client needed!
const posts: Post[] = postsData.map((p) => ({
  ...p,
  publishedAt: new Date(p.publishedAt),
  updatedAt: new Date(p.updatedAt),
}));

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cleanSlug = slug.trim();
  if (!cleanSlug) return null;
  return posts.find((p) => p.slug === cleanSlug) || null;
}

export async function getPosts(options?: {
  category?: string;
  featured?: boolean;
  max?: number;
}): Promise<Post[]> {
  let result = [...posts];
  
  if (options?.category) {
    result = result.filter((p) => p.category === options.category);
  }
  if (options?.featured !== undefined) {
    result = result.filter((p) => p.featured === options.featured);
  }
  if (options?.max) {
    result = result.slice(0, options.max);
  }
  
  return result;
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  const term = searchTerm.toLowerCase();
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.excerpt.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term)
  );
}

export async function getCategories(): Promise<string[]> {
  const cats = new Set(posts.map((p) => p.category));
  return Array.from(cats).sort();
}
