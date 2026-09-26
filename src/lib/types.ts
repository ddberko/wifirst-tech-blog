export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export type PostStatus = 'draft' | 'published';

/**
 * Verdict du fact-checker.
 *
 * Deux schémas coexistent en base :
 *  - legacy   : factCheckPassed + comment (articles d'avant le schéma enrichi)
 *  - enrichi  : finalVerdict + geminiFactCheckPassed + verdictNote + geminiComment
 *
 * `finalVerdict` fait autorité quand il est présent : le verdict du fact-checker
 * prime sur le booléen brut de Gemini, dont la coupure d'entraînement produit des
 * faux négatifs sur nos articles datés 2026. Utiliser `resolveFactCheck()` plutôt
 * que de lire un champ directement.
 */
export type FactCheckVerdict = 'PASS' | 'PASS avec corrections' | 'FAIL' | string;

export interface ArticleAnalysis {
  technicalScore: number;
  editorialScore: number;

  // Schéma legacy
  factCheckPassed?: boolean;
  comment?: string;

  // Schéma enrichi
  finalVerdict?: FactCheckVerdict;
  verdictNote?: string;
  geminiFactCheckPassed?: boolean;
  geminiComment?: string;
  geminiModelVersion?: string;
  hallucinations?: string[];
  corrections?: string[];
  residualHallucinations?: string[];
  validatedClaims?: string[];
}

export type FactCheckState = 'passed' | 'passed-with-corrections' | 'failed' | 'unknown';

/** Résout le verdict affichable, quel que soit le schéma de l'article. */
export function resolveFactCheck(a: ArticleAnalysis): {
  state: FactCheckState;
  label: string;
  comment?: string;
} {
  const comment = a.verdictNote ?? a.comment ?? a.geminiComment;

  if (typeof a.finalVerdict === 'string') {
    const v = a.finalVerdict.trim().toUpperCase();
    if (v.startsWith('PASS')) {
      return v.includes('CORRECTION')
        ? { state: 'passed-with-corrections', label: '✓ Validé (corrigé)', comment }
        : { state: 'passed', label: '✓ Validé', comment };
    }
    if (v.startsWith('FAIL')) return { state: 'failed', label: '✗ Échec', comment };
  }

  if (typeof a.factCheckPassed === 'boolean') {
    return a.factCheckPassed
      ? { state: 'passed', label: '✓ Validé', comment }
      : { state: 'failed', label: '✗ Échec', comment };
  }

  // Ni l'un ni l'autre : ne pas afficher un échec par défaut, c'est une absence d'info.
  return { state: 'unknown', label: '— Non renseigné', comment };
}

export const LOCALES = ['fr', 'en', 'es', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
};

/** Version traduite d'un article. Les images, la catégorie et la cover restent communes. */
export interface PostTranslation {
  title: string;
  excerpt: string;
  tags?: string[];
  content: string;
  wordCount?: number;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Applique une traduction à un article. Retombe sur le français si la langue
 * demandée n'existe pas — un lecteur ne doit jamais tomber sur une page vide.
 */
export function localizePost(post: Post, locale: Locale): Post {
  if (locale === 'fr') return post;
  const t = post.translations?.[locale];
  if (!t) return post;
  return {
    ...post,
    title: t.title,
    excerpt: t.excerpt,
    content: t.content,
    tags: t.tags ?? post.tags,
  };
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  featured: boolean;
  translations?: Partial<Record<Locale, PostTranslation>>;
  availableLocales?: string[];
  status: PostStatus;
  publishedAt: Date;
  updatedAt: Date;
  analysis?: ArticleAnalysis;
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  author: Author;
  featured?: boolean;
  status?: PostStatus;
  analysis?: ArticleAnalysis;
}

export interface Subscriber {
  uid: string;
  email: string;
  displayName: string;
  subscribedAt: Date;
  active: boolean;
  categories: string[];
  unsubscribeToken: string;
}

export interface AnalyticsEvent {
  type: 'page_view' | 'article_read';
  path: string;
  slug?: string;
  sessionId: string;
  userId?: string;
  timestamp: Date;
  date: string;
}

export interface DailyViewData {
  date: string;
  views: number;
  reads: number;
}

export interface TopArticle {
  slug: string;
  title: string;
  views: number;
}

export interface AnalyticsData {
  dailyViews: DailyViewData[];
  topArticles: TopArticle[];
  totalViews: number;
  totalReads: number;
  totalSubscribers: number;
  activeSubscribers: number;
}
