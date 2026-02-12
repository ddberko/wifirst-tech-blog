Le Wi-Fi 7 (802.11be) est officiellement certifié depuis janvier 2024. Avec des promesses de débits à 46 Gbps et une latence déterministe, la tentation de migrer est forte. Mais derrière le marketing, qu'est-ce qui change vraiment pour un opérateur réseau B2B ?

## TL;DR

- **MLO (Multi-Link Operation)** est la vraie révolution : agrégation, failover et redondance sur plusieurs bandes simultanément
- **4K-QAM** apporte +20% de débit théorique, mais uniquement à courte portée (SNR ~42 dB requis)
- **Europe : un seul canal 320 MHz disponible** — planification RF critique
- **Infrastructure à prévoir** : PoE 802.3bt, uplinks multigigabit, +20% d'AP pour couvrir le 6 GHz

---

## Multi-Link Operation : la vraie nouveauté

Oubliez le débit brut. La fonctionnalité qui change la donne, c'est **MLO**.

Jusqu'à Wi-Fi 6E, un client se connectait à une seule bande à la fois. Avec Wi-Fi 7, un appareil peut établir une connexion logique unique tout en communiquant sur 2.4, 5 et 6 GHz **simultanément**.

### Comment ça fonctionne

Wi-Fi 7 introduit une architecture MAC à deux niveaux :

- **Upper MAC** : gère l'association, la sécurité, le chiffrement — indépendant du lien physique
- **Lower MAC** : gère les beacons, acknowledgements — spécifique à chaque bande

Résultat : le client peut basculer entre bandes de façon transparente, sans réassociation.

### Modes d'opération

| Mode | Fonctionnement | Usage |
|------|---------------|-------|
| **STR (Simultaneous Tx/Rx)** | Transmission simultanée sur plusieurs bandes | Débit maximal, agrégation |
| **EMLSR** | Écoute sur plusieurs bandes, transmet sur une seule | Économie d'énergie, IoT |

### Performance réelle

Tests Cisco (CW9178I) : **+47% de débit** vs Wi-Fi 6 sur le même client, grâce à l'agrégation MLO.

Pour un opérateur, MLO signifie :
- **Moins de roaming** : le client reste connecté via le lien optimal
- **Failover instantané** : si le 6 GHz sature, bascule transparente vers le 5 GHz
- **Applications critiques** : redondance pour visio, télémédecine, contrôle industriel

---

## 4K-QAM : +20% de débit... en théorie

Wi-Fi 7 passe de 1024-QAM (10 bits/symbole) à 4096-QAM (12 bits/symbole). Sur le papier, c'est +20% de débit.

En pratique, c'est plus nuancé.

### Le problème du SNR

| Modulation | SNR requis |
|------------|-----------|
| 256-QAM (Wi-Fi 5) | ~25 dB |
| 1024-QAM (Wi-Fi 6) | ~31 dB |
| **4096-QAM (Wi-Fi 7)** | **~42 dB** |

Un SNR de 42 dB, c'est un client à quelques mètres de l'AP, sans obstacle, sans interférence.

**Traduction opérateur** : 4K-QAM sera actif dans les salles de réunion, pas dans un open space de 500 m². Ne dimensionnez pas votre réseau sur ce gain.

---

## Preamble Puncturing : optimiser le spectre

Le Preamble Puncturing existe depuis Wi-Fi 6, mais Wi-Fi 7 le rend **obligatoire** et l'améliore.

### Le problème résolu

Sur un canal de 160 MHz, si 20 MHz sont pollués par un radar ou un réseau voisin, Wi-Fi 6 perd souvent tout le canal secondaire (80 MHz).

Wi-Fi 7 peut "percer" uniquement les 20 MHz affectés et continuer à utiliser les 140 MHz restants.

### Impact opérationnel

- Déploiement de canaux **320 MHz** viable même avec interférences ponctuelles
- Meilleure coexistence avec les systèmes DFS (radars)
- **Efficacité spectrale** nettement améliorée en environnement dense

---

## Le spectre 6 GHz : attention à l'Europe

C'est LE point d'attention pour les déploiements européens.

| Région | Spectre 6 GHz | Canaux 320 MHz |
|--------|--------------|----------------|
| États-Unis | 1200 MHz | 3 canaux |
| **Europe** | **480 MHz** | **1 canal** |
| Canada | 1200 MHz | 3 canaux |

En Europe, vous avez **un seul canal 320 MHz**. Si deux AP voisins l'utilisent, ils sont en co-canal.

### Recommandation

- Privilégier **160 MHz** pour un meilleur spatial reuse
- Réserver le 320 MHz aux zones isolées ou très haute densité
- Site survey obligatoire avec outils 6 GHz

---

## Infrastructure : ce qu'il faut prévoir

### Alimentation PoE

| Standard | Puissance | Support Wi-Fi 7 |
|----------|-----------|-----------------|
| 802.3af | 15.4 W | ❌ Insuffisant |
| 802.3at | 30 W | ⚠️ Fonctions réduites |
| **802.3bt** | 60-90 W | ✅ Recommandé |

Les AP Wi-Fi 7 tri-radio consomment plus. Prévoir le budget switching.

### Uplinks

Un AP Wi-Fi 7 peut dépasser 2 Gbps de débit agrégé. Avec des uplinks 1 GbE, vous créez un goulot d'étranglement.

- **Minimum** : 2.5 GbE
- **Recommandé** : 5 GbE ou 10 GbE pour les zones denses

### Couverture 6 GHz

Le 6 GHz a une propagation inférieure au 5 GHz. Comptez **+20% d'AP** pour une couverture équivalente.

---

## Équipements disponibles (2026)

| Constructeur | Modèles Enterprise | Points forts |
|--------------|-------------------|--------------|
| Cisco Catalyst | CW9178I, CW9176I, CW9172H | Écosystème IOS XE, wall plates |
| HPE Aruba | Série 700 | AI Insights, Networking Central |
| Ruckus | R770, R670, R370 | BeamFlex+, Unleashed |
| Juniper Mist | AP47 | AI-driven, Marvis |
| Ubiquiti | U7 Pro, U7 Pro Max | Coût/perf, cloud ou self-hosted |

### Côté clients

~30% du parc enterprise est compatible 6 GHz fin 2025 (source Cisco). Les iPhone 16 Pro, Samsung Galaxy S24 et laptops Intel BE200 supportent Wi-Fi 7.

---

## Stratégie de migration

### Phase 1 : zones critiques

Commencez par les salles de réunion, auditoriums, zones de visioconférence. Le ROI est immédiat avec MLO.

### Phase 2 : haute densité

Cantines, halls, événementiel. Le Preamble Puncturing et les canaux larges absorbent les pics.

### Phase 3 : généralisation

Une fois l'infrastructure (PoE, uplinks) à niveau et le parc client suffisamment équipé.

### Prérequis transverses

- **WPA3 obligatoire** pour les fonctions 802.11be
- **Formation équipes** sur le troubleshooting MLO
- **Outils de monitoring** capables de décoder 802.11be

---

## Ce qu'il faut retenir

| Point | Verdict |
|-------|---------|
| MLO | ✅ Game-changer — fiabilité et débit réels |
| 4K-QAM | ⚠️ Gain limité aux courtes distances |
| 320 MHz | ⚠️ Un seul canal en Europe — planifier |
| Infrastructure | 🔧 PoE 802.3bt + multigigabit = budget à prévoir |
| Migration | 📍 Commencer par zones critiques |

Wi-Fi 7 n'est pas un simple incrément de débit. C'est une refonte architecturale avec MLO au centre. Pour un opérateur B2B, le vrai bénéfice est la **fiabilité** — et ça, les clients le voient.

---

*Article technique Wifirst — Février 2026*
