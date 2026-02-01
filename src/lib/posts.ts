import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Post } from "./types";

const COLLECTION = "posts";

function docToPost(data: Record<string, unknown>): Post {
  return {
    slug: data.slug as string,
    title: data.title as string,
    excerpt: data.excerpt as string,
    content: data.content as string,
    coverImage: (data.coverImage as string) || "",
    category: data.category as string,
    tags: (data.tags as string[]) || [],
    author: data.author as string,
    featured: (data.featured as boolean) || false,
    publishedAt: data.publishedAt instanceof Timestamp
      ? data.publishedAt.toDate()
      : new Date(data.publishedAt as string),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt as string),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(collection(db, COLLECTION), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToPost(snapshot.docs[0].data());
}

export async function getPosts(options?: {
  category?: string;
  featured?: boolean;
  max?: number;
}): Promise<Post[]> {
  const constraints = [];
  if (options?.category) {
    constraints.push(where("category", "==", options.category));
  }
  if (options?.featured !== undefined) {
    constraints.push(where("featured", "==", options.featured));
  }
  constraints.push(orderBy("publishedAt", "desc"));
  if (options?.max) {
    constraints.push(limit(options.max));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToPost(d.data()));
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  // Firestore prefix match on title
  const end = searchTerm.slice(0, -1) + String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1);
  const q = query(
    collection(db, COLLECTION),
    where("title", ">=", searchTerm),
    where("title", "<", end),
    orderBy("title"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToPost(d.data()));
}

export async function getCategories(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const cats = new Set<string>();
  snapshot.docs.forEach((d) => cats.add(d.data().category));
  return Array.from(cats).sort();
}
