import { db } from "./firebase";
import {
  collection,
  query,
  where,
  limit as fsLimit,
  getDocs,
  doc,
  getDoc,
  orderBy,
  updateDoc,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { Post, PostStatus } from "./types";

// ---------- Cache (C) — sessionStorage with TTL ----------
// Lectures Firestore mises en cache pour éviter un fetch complet à chaque navigation.
// 5 min sur les listes (un nouvel article est rare entre 2 visites), 1h sur les
// catégories (rarement nouvelles). Le cache est SCOPÉ à la session : F5 le purge.
const CACHE_PREFIX = "wtb-cache:v1:";
const TTL_POSTS_MS = 5 * 60 * 1000;
const TTL_CATEGORIES_MS = 60 * 60 * 1000;
const TTL_SLUG_MS = 5 * 60 * 1000;

function cacheGet<T>(key: string, ttlMs: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: T };
    if (Date.now() - ts > ttlMs) {
      window.sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ ts: Date.now(), data })
    );
  } catch {
    // sessionStorage peut throw QuotaExceededError quand on dépasse ~5MB.
    // On échoue silencieusement : prochaine lecture refera un fetch.
  }
}

function rehydratePost(p: any): Post {
  return {
    ...p,
    publishedAt:
      typeof p.publishedAt === "string" ? new Date(p.publishedAt) : p.publishedAt,
    updatedAt:
      typeof p.updatedAt === "string" ? new Date(p.updatedAt) : p.updatedAt,
  } as Post;
}

function mapDoc(docData: any): Post {
  return {
    ...docData,
    status: docData.status || "published",
    publishedAt: docData.publishedAt?.toDate() || new Date(),
    updatedAt: docData.updatedAt?.toDate() || new Date(),
  } as Post;
}

// ---------- API ----------

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cleanSlug = slug.trim();
  if (!cleanSlug) return null;

  const cached = cacheGet<Post>(`slug:${cleanSlug}`, TTL_SLUG_MS);
  if (cached) return rehydratePost(cached);

  try {
    const docRef = doc(db, "articles", cleanSlug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const post = mapDoc(docSnap.data());
      cacheSet(`slug:${cleanSlug}`, post);
      return post;
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
  const cacheKey = `posts:${JSON.stringify(options ?? {})}`;
  const cached = cacheGet<Post[]>(cacheKey, TTL_POSTS_MS);
  if (cached) return cached.map(rehydratePost);

  try {
    const postsRef = collection(db, "articles");

    // (A) Filtre + tri côté serveur — évite de récupérer puis trier 148 docs en JS.
    // (B) Le filtre catégorie est aussi appliqué côté Firestore : les "related posts"
    // d'une page article passaient avant par un fetch-all + filter, c'est terminé.
    const constraints: QueryConstraint[] = [];
    if (!options?.includeDrafts) {
      constraints.push(where("status", "==", "published"));
    }
    if (options?.category) {
      constraints.push(where("category", "==", options.category));
    }
    if (options?.featured !== undefined) {
      constraints.push(where("featured", "==", options.featured));
    }
    constraints.push(orderBy("publishedAt", "desc"));
    if (options?.max && options.max > 0) {
      constraints.push(fsLimit(options.max));
    }

    const q = query(postsRef, ...constraints);
    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => mapDoc(d.data()));

    cacheSet(cacheKey, posts);
    return posts;
  } catch (error) {
    console.error("[PostsLib] Error fetching posts:", error);
    return [];
  }
}

// (B) Spécifique aux "related posts" : récupère N articles d'une catégorie en
// excluant un slug donné. Fait UNE requête bornée (limit = max+1 pour pouvoir
// exclure le slug en gardant N résultats).
export async function getRelatedPosts(
  category: string,
  excludeSlug: string,
  max = 3
): Promise<Post[]> {
  const cacheKey = `related:${category}:${excludeSlug}:${max}`;
  const cached = cacheGet<Post[]>(cacheKey, TTL_POSTS_MS);
  if (cached) return cached.map(rehydratePost);

  try {
    const postsRef = collection(db, "articles");
    const q = query(
      postsRef,
      where("status", "==", "published"),
      where("category", "==", category),
      orderBy("publishedAt", "desc"),
      fsLimit(max + 1)
    );
    const snap = await getDocs(q);
    const posts = snap.docs
      .map((d) => mapDoc(d.data()))
      .filter((p) => p.slug !== excludeSlug)
      .slice(0, max);
    cacheSet(cacheKey, posts);
    return posts;
  } catch (error) {
    console.error("[PostsLib] Error fetching related posts:", error);
    return [];
  }
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  // Firestore ne fait pas de full-text natif — on fetch all (avec cache) puis filtre JS.
  // searchPosts profite donc du même cache que getPosts() : pas de double fetch.
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
  const cached = cacheGet<string[]>("categories", TTL_CATEGORIES_MS);
  if (cached) return cached;

  // Categories rarement nouvelles → TTL 1h. On lit avec includeDrafts pour
  // garder la catégorie d'un draft en cours.
  const allPosts = await getPosts({ includeDrafts: true });
  const cats = Array.from(new Set(allPosts.map((p) => p.category))).sort();
  cacheSet("categories", cats);
  return cats;
}

export async function updatePost(
  slug: string,
  updates: Partial<Omit<Post, "slug" | "publishedAt" | "updatedAt">>
): Promise<boolean> {
  try {
    const docRef = doc(db, "articles", slug);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("[PostsLib] Post not found for update:", slug);
      return false;
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    // Invalide le cache du slug + les listes (un champ a peut-être changé qui affecte l'affichage).
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(CACHE_PREFIX + `slug:${slug}`);
        // Purge toutes les clés posts:* et related:* en bloc.
        const keys = Object.keys(window.sessionStorage);
        for (const k of keys) {
          if (
            k.startsWith(CACHE_PREFIX + "posts:") ||
            k.startsWith(CACHE_PREFIX + "related:") ||
            k === CACHE_PREFIX + "categories"
          ) {
            window.sessionStorage.removeItem(k);
          }
        }
      } catch {
        /* ignore */
      }
    }

    return true;
  } catch (error) {
    console.error("[PostsLib] Error updating post:", error);
    return false;
  }
}

export async function updatePostStatus(slug: string, status: PostStatus): Promise<boolean> {
  return updatePost(slug, { status });
}
