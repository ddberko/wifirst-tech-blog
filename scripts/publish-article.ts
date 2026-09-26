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

const ARTICLE = {
  "slug": "wifi-7-cisco-it-migration-commencee-un-an-avant",
  "title": "90 000 employés en Wi-Fi 7, et la vraie migration avait eu lieu un an plus tôt",
  "excerpt": "Cisco IT a basculé 90 000 employés en Wi-Fi 7 sans configuration sur site. Le facteur déterminant n'était pas la borne : certificats, télémétrie et automatisation RF étaient posés douze mois plus tôt.",
  "category": "Réseaux",
  "tags": [
    "Wi-Fi 7",
    "WPA3",
    "802.11be",
    "Cisco",
    "Dell'Oro",
    "MLO"
  ],
  "readTime": 16,
  "coverImage": "https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers/wifi-7-cisco-it-migration-commencee-un-an-avant-cover.jpg",
  "contentFile": "/tmp/article-draft.md",
  "featured": true,
  "skipNewsletter": false,
  "analysis": {
    "technicalScore": 10,
    "editorialScore": 10,
    "geminiFactCheckPassed": true,
    "geminiModelVersion": "gemini-3.8-flash",
    "geminiComment": "L'analyse technique et contextuelle est rigoureuse, offrant une excellente distinction entre les prérequis d'infrastructure, les contraintes cryptographiques et les réalités du marché. La chronologie et les ordres de grandeur sont parfaitement cohérents avec le cadre temporel fixé.",
    "finalVerdict": "PASS",
    "verdictNote": "PASS au premier passage, zéro hallucination, zéro retry. Chaque chiffre est rattaché à son périmètre exact : la baisse de 40 % des incidents concerne un seul site de Cisco IT et est attribuée par Cisco à l'adoption de Meraki, pas au Wi-Fi 7 ; les 39 sites sur 44 sans étude prédictive sont une mesure d'un trimestre sur un parc corporate homogène. Ordre de grandeur Dell'Oro re-vérifié par curl direct : plus de 10 MILLIONS de points d'accès expédiés au 2T 2026 (record sectoriel), jamais milliards. Les séries 1T 2026 (Light Reading) et 2T 2026 (Dell'Oro) sont traitées comme deux trimestres distincts et l'article le dit explicitement. Dates du standard conformes : programme Wi-Fi CERTIFIED 7 lancé le 8 janvier 2024, amendement approuvé sous la désignation 802.11be-2024 avec document final publié le 22 juillet 2025 ; aucune mention d'une Release 2 non vérifiée. Aucune citation guillemetée : les propos de Cisco et de Siân Morgan (Senior Director at Dell'Oro Group, titre confirmé par curl du communiqué) sont paraphrasés. Le rapprochement CCMP-128 / GCMP-256 et le coût caché de mise à niveau des switchs sont explicitement balisés comme lecture d'architecte de l'auteur, le billet Cisco ne traitant aucun des deux. La capture de trames Windows 11 25H2 / Intel BE200 est présentée comme un test individuel de blogueur, sans en tirer de statistique de parc. Le contexte opérateur Wi-Fi managé (hôtellerie, résidences étudiantes) est assumé comme analyse, aucune source publique ne le chiffrant. Vérifications additionnelles hors brief : CW9178I confirmé comme produit réel (Cisco Wireless 9178I), obligation WPA3 sur les liens MLO confirmée multi-sources.",
    "hallucinations": [],
    "corrections": [],
    "residualHallucinations": [],
    "validatedClaims": [
      "Cisco IT : 90 000 employés et des centaines de sites dans le monde (Cisco Blogs, 14/09/2026)",
      "Débits observés : 1,4 Gbit/s contre 600 Mbit/s en Wi-Fi 6E sur leurs réseaux, soit 100 % ou plus",
      "Cisco ISE / authentification par certificat posée comme prérequis garantissant le support WPA3 des terminaux",
      "Meraki Dashboard + AP en production depuis plus d'un an avant la sortie du Wi-Fi 7",
      "Baisse de 40 % des incidents remontés — sur UN SEUL site, attribuée à Meraki et non au Wi-Fi 7",
      "Catalyst Center AI RRM : 39 des 44 sites ont sauté l'étude de couverture prédictive sur un trimestre",
      "Splunk : vue historique de la performance sans fil sur chaque site avant bascule",
      "Onboarding réseau par site ramené de 2 jours à 1-2 heures via le Plug-and-Play Meraki",
      "Déploiement du CW9178I, démarrage au nouveau bureau d'Austin, TX ; Campus Gateway pour l'itinérance et la sécurité sur les grands campus",
      "Dell'Oro 2T 2026 : plus de 10 millions d'AP expédiés, record sectoriel ; Wi-Fi 7 au-delà de la moitié du marché WLAN entreprise",
      "Siân Morgan (Senior Director, Dell'Oro) : ASP en hausse modérée, volumes en envolée, commandes anticipées, hausse des prix attendue sur l'année du fait du coût des composants mémoire tiré par l'IA",
      "Dell'Oro : plus grand nombre d'AP multi-gig et 10 Gbps jamais expédié sur un trimestre",
      "Light Reading (04/06/2026) : croissance à deux chiffres du marché WLAN au 1T 2026 malgré la pénurie mémoire — série distincte du 2T",
      "IEEE 802.11be : premier draft mars 2021, approuvé sous la désignation 802.11be-2024, document final publié le 22 juillet 2025",
      "Wi-Fi Alliance : programme Wi-Fi CERTIFIED 7 lancé le 8 janvier 2024, avant la publication finale du document IEEE",
      "Capture de trames mrn-cciew (14/01/2026) : Windows 11 25H2 / Intel BE200 en MLO 5+6 GHz sur SSID Meraki WPA3-Enterprise négocie CCMP-128-AES alors que le Wi-Fi Alliance met en avant GCMP-256 — test individuel, pas statistique de parc",
      "Support WPA3-Enterprise pour Wi-Fi 7 absent des postes Windows jusqu'à la version 25H2",
      "Lecture CCMP-128/GCMP-256 et coût de mise à niveau des switchs balisés comme analyse de l'auteur, non traités par le billet Cisco"
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
    analysis: ARTICLE.analysis
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
