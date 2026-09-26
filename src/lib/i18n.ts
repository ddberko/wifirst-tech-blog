import { Locale } from "./types";

/**
 * Chaînes d'interface du blog.
 *
 * Avant cette table, l'interface mélangeait français et anglais — « Recent Articles »
 * voisinait avec « Chargement… ». Le français fait désormais référence, les trois autres
 * langues en découlent.
 *
 * Le nom de marque « Wifirst Tech Blog » et les noms de catégories venant de Firestore
 * ne sont volontairement pas traduits.
 */
export const UI = {
  // Navigation
  "nav.home": { fr: "Accueil", en: "Home", es: "Inicio", de: "Startseite" },
  "nav.categories": { fr: "Catégories", en: "Categories", es: "Categorías", de: "Kategorien" },
  "nav.search": { fr: "Rechercher", en: "Search", es: "Buscar", de: "Suchen" },
  "nav.admin": { fr: "Admin", en: "Admin", es: "Admin", de: "Admin" },
  "nav.about": { fr: "À propos", en: "About Us", es: "Quiénes somos", de: "Über uns" },
  "nav.navigation": { fr: "Navigation", en: "Navigation", es: "Navegación", de: "Navigation" },

  // Compte
  "account.title": { fr: "Compte", en: "Account", es: "Cuenta", de: "Konto" },
  "account.login": { fr: "Se connecter", en: "Sign in", es: "Iniciar sesión", de: "Anmelden" },
  "account.logout": { fr: "Se déconnecter", en: "Sign out", es: "Cerrar sesión", de: "Abmelden" },
  "account.profile": { fr: "Profil", en: "Profile", es: "Perfil", de: "Profil" },

  // Accueil
  "home.tagline": {
    fr: "Analyses d'ingénierie, plongées techniques et innovations en réseau, IA et logiciel.",
    en: "Engineering insights, technical deep-dives, and innovations in networking, AI, and software engineering.",
    es: "Análisis de ingeniería, inmersiones técnicas e innovaciones en redes, IA e ingeniería de software.",
    de: "Engineering-Analysen, technische Tiefgänge und Innovationen aus Netzwerk, KI und Softwareentwicklung.",
  },
  "home.topics": { fr: "Thèmes", en: "Topics", es: "Temas", de: "Themen" },
  "home.recent": { fr: "Articles récents", en: "Recent Articles", es: "Artículos recientes", de: "Neueste Artikel" },
  "home.empty.title": { fr: "Aucun article pour l'instant", en: "No posts yet", es: "Todavía no hay artículos", de: "Noch keine Artikel" },
  "home.empty.body": {
    fr: "Les articles arrivent. Repassez bientôt.",
    en: "Articles are on their way. Check back soon!",
    es: "Los artículos están en camino. Vuelve pronto.",
    de: "Die Artikel sind unterwegs. Schauen Sie bald wieder vorbei.",
  },
  "home.featured": { fr: "À la une", en: "Featured", es: "Destacado", de: "Empfohlen" },

  // Article
  "post.related": { fr: "Articles liés", en: "Related Articles", es: "Artículos relacionados", de: "Verwandte Artikel" },
  "post.notFound": { fr: "Article introuvable", en: "Post not found", es: "Artículo no encontrado", de: "Artikel nicht gefunden" },
  "post.error": { fr: "Erreur de chargement", en: "Error Loading Article", es: "Error al cargar", de: "Fehler beim Laden" },
  "post.readTime": { fr: "min de lecture", en: "min read", es: "min de lectura", de: "Min. Lesezeit" },
  "post.exportPdf": { fr: "Exporter en PDF", en: "Export PDF", es: "Exportar PDF", de: "Als PDF" },
  "post.edit": { fr: "Modifier", en: "Edit", es: "Editar", de: "Bearbeiten" },
  "post.notTranslated": {
    fr: "Cet article n'est pas encore traduit — il s'affiche en français.",
    en: "This article isn't translated yet — showing the French version.",
    es: "Este artículo aún no está traducido: se muestra en francés.",
    de: "Dieser Artikel ist noch nicht übersetzt — er erscheint auf Französisch.",
  },
  "post.continueFr": { fr: "Continuer en français", en: "Continue in French", es: "Continuar en francés", de: "Auf Französisch weiterlesen" },

  // Catégories
  "category.title": { fr: "Catégories", en: "Categories", es: "Categorías", de: "Kategorien" },
  "category.explore": { fr: "Explorer les articles", en: "Explore articles", es: "Explorar artículos", de: "Artikel entdecken" },
  "category.empty": {
    fr: "Aucun article dans cette catégorie.",
    en: "No articles found in this category.",
    es: "No hay artículos en esta categoría.",
    de: "Keine Artikel in dieser Kategorie.",
  },

  // Recherche
  "search.title": { fr: "Recherche", en: "Search", es: "Búsqueda", de: "Suche" },
  "search.placeholder": { fr: "Rechercher des articles…", en: "Search articles…", es: "Buscar artículos…", de: "Artikel suchen…" },
  "search.prompt": { fr: "Recherchez un article", en: "Search for an article", es: "Busca un artículo", de: "Suchen Sie einen Artikel" },
  "search.empty": { fr: "Aucun résultat", en: "No results", es: "Sin resultados", de: "Keine Treffer" },

  // Divers
  "common.loading": { fr: "Chargement…", en: "Loading…", es: "Cargando…", de: "Wird geladen…" },
  "common.articles": { fr: "articles", en: "articles", es: "artículos", de: "Artikel" },
  "common.language": { fr: "Langue", en: "Language", es: "Idioma", de: "Sprache" },
} as const;

export type UIKey = keyof typeof UI;

export function translate(locale: Locale, key: UIKey): string {
  const entry = UI[key];
  // Repli sur le français : une clé non traduite affiche du français lisible
  // plutôt qu'un identifiant technique.
  return entry?.[locale] ?? entry?.fr ?? key;
}

/** Étiquette de locale au sens Intl, pour les dates et les nombres. */
export const INTL_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
};
