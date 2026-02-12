import { db } from "./firebase";
import { collection, query, where, limit, getDocs, doc, getDoc, orderBy, updateDoc, Timestamp } from "firebase/firestore";
import { Post, PostStatus } from "./types";

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cleanSlug = slug.trim();
  if (!cleanSlug) return null;

  try {
    const docRef = doc(db, "articles", cleanSlug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        status: data.status || 'published',
        publishedAt: data.publishedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Post;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function getPosts(options?: {
  category?: string;
  featured?: boolean;
  max?: number;
  includeDrafts?: boolean;
}): Promise<Post[]> {
  try {
    console.log("[PostsLib] Fetching from Firestore, options:", JSON.stringify(options));
    const postsRef = collection(db, "articles");

    // Total reset of the query for debugging
    const q = query(postsRef);

    const querySnapshot = await getDocs(q);
    console.log("[PostsLib] Query snapshot size:", querySnapshot.size);

    let posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        status: data.status || 'published',
        publishedAt: data.publishedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Post;
    });

    // Filter by status unless includeDrafts is true
    if (!options?.includeDrafts) {
      posts = posts.filter(p => p.status === 'published');
    }

    // Filter by category if specified
    if (options?.category) {
      posts = posts.filter(p => p.category === options.category);
    }

    // Filter by featured if specified
    if (options?.featured !== undefined) {
      posts = posts.filter(p => p.featured === options.featured);
    }

    console.log("[PostsLib] Mapped posts count:", posts.length);
    // Sort client-side for now to avoid index issues during debugging
    posts = posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Apply max limit if specified
    if (options?.max) {
      posts = posts.slice(0, options.max);
    }

    return posts;
  } catch (error) {
    console.error("[PostsLib] Error fetching posts:", error);
    return [];
  }
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  // Firestore doesn't support native full-text search easily.
  // We'll fetch all and filter client-side for now, as the volume is low.
  const allPosts = await getPosts();
  const term = searchTerm.toLowerCase();
  return allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.excerpt.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term)
  );
}

export async function getCategories(): Promise<string[]> {
  const allPosts = await getPosts({ includeDrafts: true });
  const cats = new Set(allPosts.map((p) => p.category));
  return Array.from(cats).sort();
}

export async function updatePost(
  slug: string,
  updates: Partial<Omit<Post, 'slug' | 'publishedAt' | 'updatedAt'>>
): Promise<boolean> {
  try {
    const docRef = doc(db, "articles", slug);

    // Verify the post exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("[PostsLib] Post not found for update:", slug);
      return false;
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log("[PostsLib] Post updated successfully:", slug);
    return true;
  } catch (error) {
    console.error("[PostsLib] Error updating post:", error);
    return false;
  }
}

export async function updatePostStatus(slug: string, status: PostStatus): Promise<boolean> {
  return updatePost(slug, { status });
}
