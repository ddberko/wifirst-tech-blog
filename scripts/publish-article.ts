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
  "slug": "nist-ir-8547-horloge-post-quantique-fournisseurs",
  "title": "2030, 2035 : NIST règle l'horloge post-quantique de vos fournisseurs",
  "excerpt": "Le rapport final NIST IR 8547 déprécie la cryptographie à clé publique actuelle après 2030 et l'interdit après 2035 dans le périmètre des normes NIST. Il ne lie aucune entreprise française, mais il règle l'horloge de vos fournisseurs de bornes et de box : à vous d'en tirer un inventaire du parc et des clauses datées.",
  "category": "Cybersécurité",
  "tags": [
    "Post-quantique",
    "NIST IR 8547",
    "ML-KEM",
    "EO 14412",
    "Crypto-agilité",
    "Achats IT"
  ],
  "readTime": 21,
  "coverImage": "https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers/nist-ir-8547-horloge-post-quantique-fournisseurs-cover.png",
  "contentFile": "/tmp/article-draft.md",
  "translations": {
    "en": {
      "title": "2030, 2035: NIST Sets Your Vendors' Post-Quantum Clock",
      "excerpt": "The final NIST IR 8547 report deprecates today's public-key cryptography after 2030 and disallows it after 2035 within the scope of NIST standards. It binds no French company, but it sets the clock for your access point and gateway vendors. Your job is to turn that into an inventory of your estate and dated contract clauses.",
      "tags": [
        "Post-Quantum",
        "NIST IR 8547",
        "ML-KEM",
        "EO 14412",
        "Crypto-Agility",
        "IT Procurement"
      ],
      "contentFile": "/tmp/article-en.md"
    },
    "es": {
      "title": "2030, 2035: el NIST fija el reloj poscuántico de sus proveedores",
      "excerpt": "El informe final NIST IR 8547 declara deprecada la criptografía de clave pública actual después de 2030 y la prohíbe después de 2035 dentro del perímetro de las normas NIST. No obliga a ninguna empresa francesa, pero fija el reloj de sus proveedores de puntos de acceso y gateways: a usted le toca convertirlo en un inventario del parque y en cláusulas con fecha.",
      "tags": [
        "Poscuántica",
        "NIST IR 8547",
        "ML-KEM",
        "EO 14412",
        "Criptoagilidad",
        "Compras de TI"
      ],
      "contentFile": "/tmp/article-es.md"
    },
    "de": {
      "title": "2030, 2035: NIST stellt die Post-Quanten-Uhr Ihrer Lieferanten",
      "excerpt": "Der finale Bericht NIST IR 8547 stuft die heutige Public-Key-Kryptografie nach 2030 als deprecated ein und untersagt sie nach 2035 im Geltungsbereich der NIST-Standards. Er bindet kein französisches Unternehmen, stellt aber die Uhr Ihrer Lieferanten von Access Points und Boxen: Daraus ergeben sich ein Bestandsinventar und datierte Vertragsklauseln.",
      "tags": [
        "Post-Quanten-Kryptografie",
        "NIST IR 8547",
        "ML-KEM",
        "EO 14412",
        "Krypto-Agilität",
        "IT-Einkauf"
      ],
      "contentFile": "/tmp/article-de.md"
    }
  },
  "featured": true,
  "skipNewsletter": false,
  "analysis": {
    "technicalScore": 8,
    "editorialScore": 10,
    "geminiFactCheckPassed": true,
    "geminiModelVersion": "gemini-3.8-flash",
    "geminiComment": "L'analyse technique et réglementaire de la transition post-quantique est d'une grande rigueur, distinguant parfaitement dépréciation et interdiction ainsi que les enjeux spécifiques au matériel réseau. Le style est percutant, pédagogique et parfaitement ancré dans les réalités opérationnelles des acheteurs et ingénieurs réseau.",
    "finalVerdict": "PASS avec corrections",
    "verdictNote": "PASS avec corrections au premier passage, zéro retry, zéro hallucination bloquante. Gemini a rendu 10/10 en technique sans voir une dérive IEEE ; la note technique retenue est l'évaluation indépendante du fact-checker (8/10). Deux défauts non bloquants corrigés : (1) l'effort IEEE 802.11 était décrit comme un groupe d'étude (page Study Group de mai 2025) alors qu'au 31/10/2026 c'est le Task Group BT, amendement P802.11bt, Draft D1.0 en Letter Ballot 297 ; la conclusion « aucun standard publié » reste vraie ; (2) la préférence de l'ANSSI pour l'hybridation était rattachée à la paraphrase Clubic du 19/06/2026 qui n'en parle pas : renvoyée au conditionnel vers la FAQ ANSSI, non relue. Périmètre des dates : « deprecated after 2030 / disallowed after 2035 » tel quel (p.13 du PDF final), sans date au jour près ; « disallowed » vaut sous les normes et guides NIST, pas interdiction légale générale ; l'IR ne lie pas d'entreprise française. Seul vecteur contractuel : EO 14412 §6(c), règle FAR proposée attendue vers le 19/12/2026 (calcul 180 jours depuis le 22/06/2026), non publiée au 31/10/2026, présentée au conditionnel ; « covered contractors » non défini. Hybride : laissé au choix de chaque application, « typically expected to be temporary measures » (p.10). RFC 10024 datée d'août 2026, non citée par l'IR : rapprochement balisé comme celui de l'auteur. Écarts connus des synthèses tierces (31 décembre 2035, « enforce » TLS 1.3, SP 800-56C « mis à jour ») évités. Toute la lecture Wi-Fi / RADIUS / 802.1X / CPE, le tableau d'inventaire et les clauses fournisseurs sont balisés comme analyse de l'auteur ; échéance OpenSSL 3.5 (support jusqu'au 08/04/2030) présentée comme inférence. Liens internes vérifiés présents dans Firestore avant publication.",
    "hallucinations": [
      "H1 (medium, stale-fact (pas une invention)) — ligne 137 (+ ligne 129, ligne 170, source 10) : L'article presente l'effort IEEE 802.11 comme un 'groupe d'etude' dont le 'projet de mandat' a ete approuve en juillet 2025. La page IEEE officielle actuelle (grouper.ieee.org/groups/802/11/Reports/tgbt_update.htm, lue directement) montre un Task Group BT (P802.11bt, PQC) avec Draft D1.0 en Letter Ballot 297, 650 commentaires dont 232 resolus a la reunion de septembre 2026, editeur Jay Yang. Le brief s'appuyait sur l'ancienne page du Study Group (pqc_update.htm, derniere maj mai 2025). La conclusion 'aucun standard publie' reste exacte (amendement en brouillon), mais 'groupe d'etude' est faux a la date du 2026-10-31 et l'etat d'avancement est sous-estime.",
      "H2 (low, attribution) — ligne 50 : La recommandation d'hybridation de l'ANSSI est rattachee a la paraphrase Clubic. L'article Clubic (19 juin 2026, intervention de Samih Souissi a France Quantum) ne mentionne ni 'hybridation' ni 'hybride'. Les resultats de recherche indiquent que la FAQ ANSSI la recommande, mais la FAQ n'a pas pu etre lue directement (page vide cote fetch). A attribuer correctement ou hedger."
    ],
    "corrections": [
      "C1  : « Un groupe d'étude dédié, présidé par Stephen Orr (Cisco), a vu son projet de mandat approuvé par la plénière 802.11 de juillet 2025, avec pour objectif de mettre à jour ou de créer des mécanismes de gestion de clés résistants, et d'examiner notamment SAE et OWE. » → « Un groupe de travail dédié, le Task Group BT présidé par Stephen Orr (Cisco), prépare l'amendement P802.11bt. Son mandat (PAR et CSD) a été approuvé par la plénière 802.11 en juillet 2025. Son projet D1.0 est passé en vote de groupe (Letter Ballot 297) et la résolution des 650 commentaires reçus était en cours à la réunion de septembre 2026. Il vise des suites d'authentification et de gestion de clés (AKM) résistantes, un échange de clé par mot de passe post-quantique et la révision des échanges de clés, en regardant notamment SAE et OWE. »",
      "C1b  : « À ma connaissance, aucun standard IEEE 802.11 post-quantique n'est publié. » → « À ma connaissance, aucun standard IEEE 802.11 post-quantique n'est publié : l'amendement P802.11bt n'en est qu'au stade du brouillon. »",
      "C1c  : « **La radio n'a pas de solution.** » → « **La radio n'a pas encore de solution publiée.** »",
      "C1d  : « Rien de normalisé : veille IEEE 802.11 » → « Rien de publié : amendement IEEE P802.11bt en brouillon, à suivre »",
      "C1e  : « les travaux du groupe IEEE 802.11 » → « la publication de l'amendement IEEE P802.11bt »",
      "C1f  : « 10. IEEE 802.11, PQC Study Group, compte rendu : https://grouper.ieee.org/groups/802/11/Reports/pqc_update.htm » → « 10. IEEE 802.11, Task Group BT (PQC), P802.11bt, compte rendu (réunion de septembre 2026) : https://grouper.ieee.org/groups/802/11/Reports/tgbt_update.htm »",
      "C2  : « Ces dates proviennent d'une paraphrase de presse (Clubic, juin 2026) d'une intervention de l'agence, pas d'un texte officiel que j'aurais relu. Elles sont à confirmer à la source, » → « Ces dates proviennent d'une paraphrase de presse (Clubic, 19 juin 2026) d'une intervention de l'agence, pas d'un texte officiel que j'aurais relu ; l'article ne parle d'ailleurs pas d'hybridation, ce point est à vérifier dans la FAQ de l'ANSSI. Ces éléments sont à confirmer à la source, »",
      "C3  : « quelques mois avant que la fenêtre de dépréciation ne s'ouvre » → « environ neuf mois avant que la fenêtre de dépréciation ne s'ouvre »",
      "{\"id\": \"C5\", \"required\": true, \"type\": \"verification manuelle\", \"lines\": [50, 143], \"action\": \"Confirmer que les slugs tunnels-ipsec-quatre-ans-retard-post-quantique et anssi-calendrier-post-quantique-2027-sourcing-equipements sont publies sur wifirst-tech-blog.web.app avant mise en ligne. Sinon retirer les liens.\"}",
      "Reformulation orchestrateur ligne 50 : « en privilégiant l'hybridation » retiré de la phrase attribuée à Clubic ; hybridation renvoyée au conditionnel vers la FAQ ANSSI, à vérifier à la source",
      "U1 levé : slugs tunnels-ipsec-quatre-ans-retard-post-quantique et anssi-calendrier-post-quantique-2027-sourcing-equipements vérifiés présents dans la collection Firestore articles avant publication ; liens internes conservés"
    ],
    "residualHallucinations": [],
    "validatedClaims": [
      "Version finale IR 8547 publiee le 27 octobre 2026 ; PDF date octobre 2026 (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) ; csrc.nist.gov/pubs/ir/8547/final (historique 10/27/26), 2026-10-27)",
      "Citation exacte : 'NIST will deprecate quantum-vulnerable public-key cryptography after 2030 and disallow its use under NIST standards and guidelines after 2035.' (section 4, p.13) (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.13 imprime, 2026-10)",
      "Aucune date au jour pres pour 2030/2035 dans le texte ; echeances EO/OMB seules au jour pres (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) ; EO 14412, 91 FR 38483 (PDF whitehouse.gov), 2026-10)",
      "Fenetre 2030-2035 n'altere pas les echeances plus precoces HVA/high impact (section 4, p.13) (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.13, 2026-10)",
      "Tables 2 et 4 (p.15-16) : tous niveaux listes 'Deprecated after 2030 / Disallowed after 2035' (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) Tables 2, 4, 2026-10)",
      "IPD 2024 : seuls 112 bits 'Deprecated after 2030', >=128 bits seulement 'Disallowed after 2035' (NIST IR 8547 IPD PDF, tables (nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf), 2024-11-12)",
      "'NIST recommends using ML-KEM-768 as the default parameter set' (4.1.2, p.17) ; ML-KEM seul schema PQ d'etablissement de cle approuve ; HQC selectionne, FIPS en developpement (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.17 imprime, 2026-10)",
      "Hybride : 'typically expected to be temporary measures' (p.10) ; acceptation FIPS 140 si une brique approuvee ; NIST 'intends to update SP 800-56C' (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.10-11, p.18, 2026-10)",
      "'a practical near-term path' TLS 1.3 + hybride ; priorite echange de cles TLS/IKE ; prochaine revision SP 800-52 (4.2, p.20) (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.20, 2026-10)",
      "'Organizations should treat the migration to PQC as a current operational priority...' (p.1) (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.1, 2026-10)",
      "Rapport destine aux agences, fournisseurs, normalisation, labos ; 'blueprint' pour infrastructures critiques (1.1, p.2) (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.2, 2026-10)",
      "Firmware : fabricants materiels doivent amorcer l'integration PQC immediatement (p.6) ; LMS/XMSS non destines a un usage general (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.6, 2.1.1, 2026-10)",
      "Agences doivent supporter (pas imposer) TLS 1.3 au plus tard le 2 janvier 2030 (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) p.13, p.20 ; OMB M-26-15 (PDF whitehouse.gov), 2026-10)",
      "Aucune mention Wi-Fi/RADIUS/VPN dans l'IR 8547 ; RFC 10024 non citee par le rapport (NIST IR 8547 final (PDF, nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) (grep texte integral), 2026-10)",
      "EO 14412 signe le 22 juin 2026, publie 91 FR 38483 le 25 juin 2026 (EO 14412, 91 FR 38483 (PDF whitehouse.gov), 2026-06-22)",
      "EO 4(b) : cle 2030-12-31, signatures 2031-12-31 pour HVA et high impact (EO 14412, 91 FR 38483 (PDF whitehouse.gov) Sec. 4(b)(ii)-(iii), 2026-06-22)",
      "EO 6(c) : regle FAR proposee sous 180 jours (=2026-12-19), covered contractors conformes FIPS dont PQC au 2030-12-31 (EO 14412, 91 FR 38483 (PDF whitehouse.gov) Sec. 6(c), 2026-06-22)",
      "'covered contractors' non defini a la Sec. 2 (EO 14412, 91 FR 38483 (PDF whitehouse.gov) Sec. 2, 2026-06-22)",
      "EO 7(c) : aucun droit opposable cree (EO 14412, 91 FR 38483 (PDF whitehouse.gov) Sec. 7(c), 2026-06-22)",
      "EO 6(b) : revision CMVP sous 180 jours ; 5(d) : contenu minimal CBOM par CISA sous 270 jours (=2027-03-19) (EO 14412, 91 FR 38483 (PDF whitehouse.gov), 2026-06-22)",
      "Regle FAR PQC non publiee a ce jour (recherche web independante : cabinets Skadden, King & Spalding, Wiley ; aucune publication au Federal Register trouvee) (WebSearch, skadden.com/insights/publications/2026/06/big-changes-coming-for-government-contractors et al., 2026-10-31)",
      "M-26-15 du 24 juin 2026 ; phases 2026-27, 2027-28, 2028-30, 2031, 2035 ; hybride 'intricate and resource-intensive stopgap' ; exemple x25519 + ML-KEM-768 ; alignement IR 8547 'or successor' ; systemes non migrables a remplacer (OMB M-26-15 (PDF whitehouse.gov), 2026-06-24)",
      "RFC 10024 : titre exact, aout 2026, Proposed Standard ; X25519MLKEM768 seul 'Recommended = Y' (SecP256r1MLKEM768 et SecP384r1MLKEM1024 = N) (datatracker.ietf.org/doc/rfc10024/, 2026-08)",
      "RFC 9954 'Hybrid Key Exchange in TLS 1.3', juillet 2026, Informational (rfc-editor.org/rfc/rfc9954.html, 2026-07)",
      "OpenSSL 3.5 LTS publie le 8 avril 2025, support jusqu'au 8 avril 2030 ; OpenSSL 3.0 correctifs de securite jusqu'au 7 septembre 2026 ; key shares par defaut X25519MLKEM768 + X25519 (openssl-library.org/post/2025-04-08-openssl-35-final-release/ ; github.com/openssl/openssl/discussions/27299, 2025-04-08)",
      "draft-ietf-emu-pqc-eap-tls-02 : 23 sept 2026, T. Reddy (Nokia), exige TLS 1.3 + groupe PQ/hybride + chaine PQ/hybride pour confidentialite longue duree, ne nomme ni RADIUS ni RadSec ni 802.1X, Internet-Draft (ietf.org/archive/id/draft-ietf-emu-pqc-eap-tls-02.html, 2026-09-23)",
      "CISA 23 janvier 2026 : Networking Hardware/Software dans la liste 'transitioning' ; ni Wi-Fi AP ni VPN (cisa.gov product-categories page, 2026-01-23)",
      "Feuille de route UE (NIS CG) publiee juin 2025 ; jalons 2026/2030/2035 (via miroir key4biz, cite l'IPD 2024) (digital-strategy.ec.europa.eu (page 2025-06-23) ; brief 5.6, 2025-06)",
      "ANSSI 2027/2030 : paraphrase Clubic (19 juin 2026, annonce de Samih Souissi a France Quantum) ; correctement hedgee dans l'article (clubic.com/actualite-617680, 2026-06-19)",
      "IEEE : chair Stephen Orr (Cisco) ; PAR/CSD approuves en plenaire de juillet 2025 (exact, mais statut depuis obsolete, voir H1) (grouper.ieee.org/groups/802/11/Reports/tgbt_update.htm, 2026-09)",
      "Calcul 180 jours = 2026-12-19 ; 270 jours = 2027-03-19 (article : 'mi-decembre', 'mi-mars') (calcul date -d, 2026-10-31)"
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
