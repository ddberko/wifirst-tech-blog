import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import * as path from 'path';

// NE JAMAIS MODIFIER CET OBJET AUTEUR
const AUTHOR = {
  name: 'David Berkowicz',
  role: 'CTO @ Wifirst',
  avatar: 'https://ui-avatars.com/api/?name=David+Berkowicz&background=0D8ABC&color=fff'
};

/**
 * Traductions. Une entrée par langue produite au STEP 6 du workflow ; les langues
 * qui ont échoué sont simplement absentes. `contentFile` est lu comme celui de
 * l'article français, et `availableLocales` est calculé à partir des entrées
 * effectivement présentes.
 */
type TranslationInput = {
  title: string;
  excerpt: string;
  tags?: string[];
  contentFile: string;
};

const LOCALES = ['en', 'es', 'de'] as const;
type Locale = (typeof LOCALES)[number];

const ARTICLE = {
  "slug": "robots-txt-entrainement-ia-jeton-aipref",
  "title": "Robots.txt : dire non à l'entraînement IA ne bloque personne",
  "excerpt": "Un draft IETF individuel propose depuis le 30 octobre un jeton robots.txt pour refuser l'entraînement des IA. Google, Microsoft et Anthropic promettent de le lire, d'ici début 2027 au plus tard : il faut le publier sur chaque site hébergé, sans jamais le présenter comme une protection.",
  "category": "Réseaux",
  "tags": [
    "robots.txt",
    "IETF AIPREF",
    "Crawlers IA",
    "Entraînement IA",
    "WAF",
    "Hébergement multi-tenant"
  ],
  "readTime": 18,
  "coverImage": "https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers/robots-txt-entrainement-ia-jeton-aipref-cover.png",
  "contentFile": "/tmp/article-draft.md",
  "translations": {
    "en": {
      "title": "Robots.txt: Saying No to AI Training Blocks Nobody",
      "excerpt": "Since October 30, an individual IETF draft has proposed a robots.txt token for opting out of AI training. Google, Microsoft and Anthropic promise to read it, by early 2027 at the latest: publish it on every hosted site, and never present it as protection.",
      "tags": [
        "robots.txt",
        "IETF AIPREF",
        "AI crawlers",
        "AI training",
        "WAF",
        "Multi-tenant hosting"
      ],
      "contentFile": "/tmp/article-en.md"
    },
    "es": {
      "title": "Robots.txt: decir no al entrenamiento de IA no bloquea a nadie",
      "excerpt": "Un draft individual de la IETF propone desde el 30 de octubre un token en robots.txt para rechazar el entrenamiento de las IA. Google, Microsoft y Anthropic prometen leerlo, a más tardar a principios de 2027: hay que publicarlo en cada sitio alojado, sin presentarlo nunca como una protección.",
      "tags": [
        "robots.txt",
        "IETF AIPREF",
        "Crawlers de IA",
        "Entrenamiento de IA",
        "WAF",
        "Alojamiento multi-tenant"
      ],
      "contentFile": "/tmp/article-es.md"
    },
    "de": {
      "title": "Robots.txt: Wer dem KI-Training widerspricht, sperrt damit niemanden aus",
      "excerpt": "Seit dem 30. Oktober schlägt ein individueller IETF-Draft ein robots.txt-Token vor, mit dem sich das KI-Training ablehnen lässt. Google, Microsoft und Anthropic versprechen, es zu lesen, spätestens Anfang 2027: Man sollte es auf jeder gehosteten Website veröffentlichen, ohne es je als Schutz zu verkaufen.",
      "tags": [
        "robots.txt",
        "IETF AIPREF",
        "KI-Crawler",
        "KI-Training",
        "WAF",
        "Multi-Tenant-Hosting"
      ],
      "contentFile": "/tmp/article-de.md"
    }
  },
  "featured": true,
  "skipNewsletter": false,
  "analysis": {
    "technicalScore": 10,
    "editorialScore": 10,
    "geminiFactCheckPassed": true,
    "geminiModelVersion": "gemini-3.8-flash",
    "geminiComment": "L'analyse technique est rigoureuse et distingue parfaitement la couche déclarative (robots.txt, RFC 9309) de la couche d'application concrète (WAF, détection comportementale). La cohérence temporelle, les citations de documents de travail IETF et les nuances entre déclarations d'éditeurs sont remarquablement documentées et plausibles.",
    "finalVerdict": "PASS avec corrections",
    "verdictNote": "PASS avec corrections au premier passage, zéro hallucination, zéro retry. Trois corrections mineures appliquées avant traduction : (1) l'image « quatre géants derrière un même interrupteur », attribuée à la presse sans source, est reformulée en constat sur les titres de presse ; (2) la priorité des règles nommant un crawler n'est plus étendue à GPTBot, seule Anthropic l'affirme pour ClaudeBot (la page OpenAI, en 403 pour nos outils, n'a pas été lue en primaire) ; (3) Nate Hake est désigné comme fondateur de Travel Lemming, conformément à sa signature sur la liste ai-control. Statut IETF re-vérifié sur le texte du draft : soumission individuelle -00 du 30/10/2026, un seul auteur (Kevin Kelley, Anthropic), non endossée par l'IETF, rattachée à aucun groupe de travail, expire le 3/05/2027 ; Google, Microsoft et OpenAI ne figurent qu'aux remerciements, affiliations « for identification only » (le total de 46 noms vient du brief, non recompté). Calendriers vendor traités avec leur niveau de source : Microsoft/Bing lu en primaire (dates 15/12/2026, 1/02/2027, 1/03/2027, 30/09/2027) ; Google lu en primaire (« plans to », début 2027, lecture comme refus Google-Extended) ; Anthropic sans date ; OpenAI en source secondaire uniquement, sans aucune citation entre guillemets. Citations des listes IETF (Nate Hake 3/11, Alissa Cooper 4/11) vérifiées mot pour mot. Chiffres Cloudflare datés de 2025 et présentés comme tels. Le périmètre opérateur (portails captifs, sites clients hébergés) et la méthode en quatre couches sont balisés comme analyse de l'auteur, aucune source publique ne les chiffrant. Seule réserve non bloquante : la formulation sur l'échéance Bing du 1/03/2027 (NoArchive/NoCache et préférences de grounding) est cohérente avec la page Bing sans y être confirmée mot pour mot.",
    "hallucinations": [],
    "corrections": [
      "L41 : « La presse a résumé l'épisode en une image : quatre géants derrière un même interrupteur. Le document raconte une histoire plus modeste. » → « Les titres de presse ont présenté l'épisode comme un soutien unanime de quatre géants à un même mécanisme. Le document raconte une histoire plus modeste. »",
      "L32 : « Et une règle spécifique, qui nomme `ClaudeBot` ou `GPTBot`, devrait primer sur la règle générale. » → « Et une règle spécifique devrait primer sur la règle générale : Anthropic précise que les règles qui nomment `ClaudeBot` l'emportent sur le signal. »",
      "L47 : « Nate Hake, éditeur du site Travel Lemming » → « Nate Hake, fondateur du site Travel Lemming »"
    ],
    "residualHallucinations": [],
    "validatedClaims": [
      "Draft Kelley -00, auteur unique Kevin Kelley (Anthropic), 30/10/2026, expire 3/05/2027 (https://www.ietf.org/archive/id/draft-kelley-aipref-training-preference-signal-00.txt, 2026-10-30)",
      "Citations « not a directive for crawling behavior », « Private agreements MAY override... », MUST NOT sur le joker, exemple Figure 1 (draft Kelley §1, §4.2, §4.4, §4.5, 2026-10-30)",
      "Remerciements : Google 4, Microsoft 4, OpenAI 2, Anthropic 1 (confirmés ; total 46 repris du brief, non recompté) (draft Kelley, Table 1, 2026-10-30)",
      "Charte AIPREF : jalons vocab et attach à l'IESG au 31/08/2026 ; application technique des préférences hors périmètre (https://datatracker.ietf.org/group/aipref/about/, consulté 2026-11-05)",
      "Microsoft : 3 citations exactes ; 15/12/2026, 1/02/2027, 1/03/2027, 30/09/2027 ; auteur Krishna Madhavan (https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/, 2026-10-30)",
      "Google : citation de John Mueller exacte ; refus via le jeton lu comme refus Google-Extended (intention, « plans to ») (https://developers.google.com/search/blog/2026/10/ai-training-control, 2026-10-30)",
      "Citation Nate Hake exacte, 3/11/2026 (https://mailarchive.ietf.org/arch/msg/ai-control/A2LWviXagqaze8qg4rPvM_v5Akk/, 2026-11-03)",
      "Citation Alissa Cooper exacte (jeton search), absence de registre ; affiliation KGI (directrice exécutive) (https://mailarchive.ietf.org/arch/msg/ai-control/qhIHBiSQsFOKcKS8Yq56Dl2nhZU/ ; https://knightfoundation.org/press/releases/alissa-cooper-appointed-inaugural-executive-director-of-knight-georgetown-institute/, 2026-11-04)",
      "Cloudflare : entraînement 72 % (juil. 2024) puis 79 % (juil. 2025) (https://blog.cloudflare.com/crawlers-click-ai-bots-training/, 2025-08-29)",
      "Cloudflare/Perplexity : 20-25 M et 3-6 M requêtes/jour, dizaines de milliers de domaines, retrait de la liste des bots vérifiés (https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/, 2025-08-04)",
      "Reste (RFC 9309, vocab-08, attach-05, Anthropic, OpenAI en source secondaire, IETF 127, GPAI 10/07/2025) : conforme au brief, niveau [P] ou [S] correctement signalé dans l'article (/tmp/article-brief.md, 2026-11-05)"
    ]
  }
};
const serviceAccount = require('../service-account.json');

try {
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (e) {
  // Already initialized
}

const db = getFirestore();

async function publish() {
  console.log(`🚀 Publication de l'article: ${ARTICLE.slug}`);

  const content = readFileSync(ARTICLE.contentFile, 'utf8');
  const wordCount = content.split(/\s+/).length;
  console.log(`✅ Contenu lu: ${ARTICLE.contentFile} (${content.length} caractères, ~${wordCount} mots)`);

  if (wordCount < 1800) {
    console.error(`❌ ERREUR : L'article est trop court (${wordCount} mots). Le minimum requis est de 1800 mots.`);
    process.exit(1);
  }

  // Traductions : lecture de chaque contentFile, avec les mêmes garde-fous que le français.
  const rawTranslations = ((ARTICLE as Record<string, unknown>).translations ?? {}) as
    Partial<Record<Locale, TranslationInput>>;
  const translations: Record<string, unknown> = {};

  for (const locale of LOCALES) {
    const t = rawTranslations[locale];
    if (!t) continue;
    try {
      const translated = readFileSync(t.contentFile, 'utf8');
      const tWords = translated.split(/\s+/).length;
      const ratio = tWords / wordCount;
      if (ratio < 0.5 || ratio > 1.6) {
        console.warn(`⚠️  ${locale} ignoré : ${tWords} mots pour ${wordCount} en français (ratio ${ratio.toFixed(2)}) — traduction probablement tronquée.`);
        continue;
      }
      if (translated.includes('$')) {
        console.warn(`⚠️  ${locale} : des « $ » subsistent, le frontend les rendra en LaTeX.`);
      }
      translations[locale] = {
        title: t.title,
        excerpt: t.excerpt,
        tags: t.tags ?? ARTICLE.tags,
        content: translated,
        wordCount: tWords,
      };
      console.log(`✅ Traduction ${locale} : ${tWords} mots — « ${t.title} »`);
    } catch (e) {
      console.warn(`⚠️  ${locale} illisible (${t.contentFile}) : ${(e as Error).message}`);
    }
  }

  const availableLocales = ['fr', ...Object.keys(translations)];
  if (availableLocales.length === 1) {
    console.log('ℹ️  Aucune traduction : l\'article sera publié en français seul.');
  }

  const docRef = db.collection('articles').doc(ARTICLE.slug);

  const articleData = {
    slug: ARTICLE.slug,
    title: ARTICLE.title,
    excerpt: ARTICLE.excerpt,
    category: ARTICLE.category,
    tags: ARTICLE.tags,
    readTime: ARTICLE.readTime,
    coverImage: ARTICLE.coverImage,
    content: content,
    author: AUTHOR,
    publishedAt: Timestamp.now(),
    featured: ARTICLE.featured !== false,
    skipNewsletter: ARTICLE.skipNewsletter,
    status: 'published',
    analysis: ARTICLE.analysis,
    translations,
    availableLocales
  };

  await docRef.set(articleData, { merge: true });

  console.log('✅ Article publié/mis à jour sur Firestore (collection: articles)');
  console.log('\n========================================');
  console.log('📝 PUBLICATION RÉUSSIE');
  console.log('========================================');
  console.log(`Slug: ${ARTICLE.slug}`);
  console.log(`Titre: ${ARTICLE.title}`);
  console.log(`Image de couverture: ${ARTICLE.coverImage}`);
  console.log(`\n🔗 URL de l'article: https://wifirst-tech-blog.web.app/post?slug=${ARTICLE.slug}`);
  console.log('========================================');
}

publish().catch(console.error);
