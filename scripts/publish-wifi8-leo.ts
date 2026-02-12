import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

const BUCKET_NAME = "wifirst-tech-blog.firebasestorage.app";

// Initialisation Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  } else {
    console.error("❌ Fichier service-account.json non trouvé");
    process.exit(1);
  }
}

const db = getFirestore();

const slug = "wifi-8-leo-convergence-2026";
const article = {
  slug: slug,
  title: "Wi-Fi 8 & LEO : La Convergence vers l'Ultra-Fiabilité en 2026",
  excerpt: "L'arrivée d'IEEE 802.11bn (Wi-Fi 8) et la maturité des constellations satellite LEO redéfinissent la connectivité critique. Analyse d'une synergie technologique majeure.",
  coverImage: "/images/header-wifi8-leo-convergence.png",
  date: "2026-02-04",
  author: "Léon",
  tags: ["Wi-Fi 8", "LEO", "Satellite", "802.11bn", "Networking"],
  content: `
L'année 2026 marque un tournant pour les infrastructures réseau. Alors que le Wi-Fi 7 achève sa phase d'adoption de masse, le groupe de travail IEEE 802.11bn pose les fondations de ce que nous appellerons le **Wi-Fi 8**. Contrairement aux générations précédentes, la course au débit brut cède la place à un impératif nouveau : l'**Ultra High Reliability (UHR)**.

En parallèle, les constellations de satellites en orbite basse (**LEO - Low Earth Orbit**), telles que Starlink v3 et le Projet Kuiper d'Amazon, atteignent une densité orbitale permettant des débits gigabit avec une latence inférieure à 30ms. La convergence de ces deux mondes ouvre des perspectives inédites pour les réseaux d'entreprise isolés ou mobiles.

## Wi-Fi 8 (802.11bn) : La Fiabilité avant tout

Le Wi-Fi 8 ne vise pas les 100 Gbps. Son objectif principal est d'assurer une connexion stable dans les environnements ultra-denses ou en conditions de signal dégradé. Les spécifications préliminaires visent une réduction de la latence de 25% au 95e percentile.

### Les piliers de l'UHR (Ultra High Reliability)
1. **Coordinated Multi-AP (MAP)** : Les points d'accès ne se contentent plus de coexister ; ils collaborent pour former des faisceaux coordonnés, réduisant les collisions et optimisant le spectre.
2. **Enhanced Multi-Link Operation (MLO)** : Le Wi-Fi 8 pousse plus loin l'agrégation de bandes (2.4, 5, et 6 GHz) avec une gestion dynamique du trafic en temps réel.
3. **Advanced Coding & Modulation** : Des mécanismes de correction d'erreurs plus robustes permettent de maintenir des flux critiques là où le Wi-Fi 7 aurait commencé à perdre des paquets.

![Architecture Wi-Fi 8 UHR](/images/content-wifi8-uhr-architecture.png)

## Le Satellite LEO comme Backhaul Critique

En 2026, la connectivité LEO n'est plus une solution de secours "best-effort". Elle s'intègre nativement dans les stratégies **Multi-WAN** et **SD-WAN** des entreprises.

- **Densification des constellations** : Avec plus de 3000 satellites pour Kuiper et la version 3 de Starlink, le "handover" entre faisceaux satellites est devenu quasi invisible.
- **Intégration SD-WAN** : Les flux Wi-Fi 8 critiques peuvent désormais être routés dynamiquement via satellite si la fibre terrestre présente un jitter excessif, garantissant une continuité de service totale.

## Défis et Opportunités pour 2026

L'intégration Wi-Fi 8 / LEO pose des défis de synchronisation complexes. Le jitter inhérent au mouvement des satellites LEO doit être compensé par les buffers intelligents des points d'accès Wi-Fi 8. Cependant, pour les secteurs industriels, maritimes ou les sites de construction, cette convergence offre pour la première fois un réseau local de classe "carrier-grade" sans aucune infrastructure terrestre à proximité.

**En conclusion**, le passage au Wi-Fi 8 symbolise la fin de la quête de vitesse pure pour entrer dans l'ère de la résilience absolue, propulsée par une infrastructure spatiale omniprésente.
  `
};

async function publish() {
  console.log(`🚀 Publication de l'article : ${article.title}`);
  try {
    await db.collection('posts').doc(slug).set(article);
    console.log("✅ Article publié sur Firestore !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la publication :", error);
    process.exit(1);
  }
}

publish();
