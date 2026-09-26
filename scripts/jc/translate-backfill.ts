/**
 * Rattrapage des traductions sur les articles déjà publiés.
 *
 * Deux commandes, appelées par la routine de backfill (scripts/jc/backfill-workflow.md) :
 *
 *   list [n] [décalage]      → n articles prioritaires sans traduction complète, à partir
 *                              du rang [décalage], avec le chemin où leur contenu français
 *                              a été écrit. Le décalage évite que des runs simultanés
 *                              sélectionnent tous les mêmes articles.
 *   apply <slug> <lang> <f>  → injecte la traduction du fichier f dans le document
 *
 * Priorité : les articles `featured` d'abord, puis les plus récents. C'est la vitrine
 * qui compte, pas l'exhaustivité — 456 articles x 3 langues ne se justifient pas.
 *
 * Usage : NODE_PATH=./node_modules npx tsx scripts/jc/translate-backfill.ts list 3
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = join(__dirname, '../..');
const serviceAccount = JSON.parse(
  readFileSync(join(PROJECT_ROOT, 'service-account.json'), 'utf8')
);

try {
  initializeApp({ credential: cert(serviceAccount) });
} catch {
  // déjà initialisé
}
const db = getFirestore();

const LOCALES = ['en', 'es', 'de'] as const;
type Locale = (typeof LOCALES)[number];
const WORKDIR = '/tmp/backfill';

function missingLocales(data: FirebaseFirestore.DocumentData): Locale[] {
  const t = (data.translations ?? {}) as Record<string, unknown>;
  return LOCALES.filter((l) => !t[l]);
}

async function list(limit: number, offset = 0) {
  // Pas de where() sur translations : Firestore ne sait pas filtrer sur l'absence
  // d'une clé de map. On lit les publiés et on trie côté client.
  const snap = await db
    .collection('articles')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();

  const candidats = snap.docs
    .map((d) => ({ doc: d, data: d.data(), missing: missingLocales(d.data()) }))
    .filter((c) => c.missing.length > 0)
    .sort((a, b) => {
      const fa = a.data.featured ? 1 : 0;
      const fb = b.data.featured ? 1 : 0;
      if (fa !== fb) return fb - fa; // featured d'abord
      return (
        (b.data.publishedAt?.toMillis?.() ?? 0) - (a.data.publishedAt?.toMillis?.() ?? 0)
      );
    })
    .slice(offset, offset + limit);

  mkdirSync(WORKDIR, { recursive: true });

  console.log(`${candidats.length} article(s) à traiter (décalage ${offset}) — ${snap.size} publiés au total\n`);
  for (const c of candidats) {
    const slug = c.data.slug;
    const src = join(WORKDIR, `${slug}.fr.md`);
    writeFileSync(src, c.data.content ?? '');
    const words = String(c.data.content ?? '').split(/\s+/).length;
    console.log(`SLUG: ${slug}`);
    console.log(`  TITRE   : ${c.data.title}`);
    console.log(`  FEATURED: ${c.data.featured ? 'oui' : 'non'}`);
    console.log(`  MOTS    : ${words}`);
    console.log(`  MANQUE  : ${c.missing.join(', ')}`);
    console.log(`  SOURCE  : ${src}`);
    console.log(`  CIBLES  : ${c.missing.map((l) => join(WORKDIR, `${slug}.${l}.md`)).join(' ')}`);
    console.log('');
  }
  if (candidats.length === 0) console.log('Rien à rattraper.');
}

async function apply(slug: string, lang: string, file: string, title: string, excerpt: string) {
  if (!(LOCALES as readonly string[]).includes(lang)) {
    throw new Error(`langue inconnue : ${lang}`);
  }
  const ref = db.collection('articles').doc(slug);
  const snap = await ref.get();
  if (!snap.exists) throw new Error(`article introuvable : ${slug}`);

  const data = snap.data()!;
  const content = readFileSync(file, 'utf8');
  const words = content.split(/\s+/).length;
  const frWords = String(data.content ?? '').split(/\s+/).length;
  const ratio = words / frWords;

  if (ratio < 0.5 || ratio > 1.6) {
    throw new Error(
      `volume suspect pour ${slug}/${lang} : ${words} mots contre ${frWords} en français (ratio ${ratio.toFixed(2)}) — traduction probablement tronquée, rien écrit.`
    );
  }
  if (content.includes('$')) {
    console.warn(`⚠️  des « $ » subsistent dans ${lang} : le frontend les rendra en LaTeX.`);
  }

  const translations = { ...(data.translations ?? {}) };
  translations[lang] = { title, excerpt, tags: data.tags ?? [], content, wordCount: words };
  const availableLocales = ['fr', ...LOCALES.filter((l) => translations[l])];

  await ref.set({ translations, availableLocales }, { merge: true });
  console.log(`✅ ${slug} / ${lang} — ${words} mots — « ${title} »`);
  console.log(`   langues disponibles : ${availableLocales.join(', ')}`);
}

const [cmd, ...args] = process.argv.slice(2);

(async () => {
  if (cmd === 'list') {
    // Le décalage permet à plusieurs runs simultanés de travailler sur des tranches
    // disjointes : sans lui, ils sélectionneraient tous les mêmes articles.
    await list(Number(args[0] ?? 3), Number(args[1] ?? 0));
  } else if (cmd === 'apply') {
    const [slug, lang, file, title, excerpt] = args;
    if (!slug || !lang || !file || !title || !excerpt) {
      throw new Error('usage: apply <slug> <lang> <fichier> <titre> <chapô>');
    }
    await apply(slug, lang, file, title, excerpt);
  } else {
    console.error('usage: list [n] [décalage] | apply <slug> <lang> <fichier> <titre> <chapô>');
    process.exit(2);
  }
  process.exit(0);
})().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
