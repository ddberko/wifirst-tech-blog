Wi-Fi 7 n'est pas une simple évolution incrémentale. Avec l'IEEE 802.11be officiellement finalisé en juillet 2025, cette nouvelle génération redéfinit les règles du jeu pour les opérateurs réseau. Voici ce qui change concrètement.

## Le MLO : la vraie révolution

![Visualisation du Multi-Link Operation avec les trois bandes de fréquences](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images%2Fwifi7-mlo-bands.png)

Le **Multi-Link Operation (MLO)** est la fonctionnalité phare de Wi-Fi 7 — et c'est obligatoire pour la certification. Le principe : un appareil peut désormais se connecter **simultanément sur plusieurs bandes** (2,4 GHz, 5 GHz, 6 GHz).

Concrètement, ça donne :

- **Agrégation de débit** : les flux sont répartis sur plusieurs liens
- **Routage intelligent** : les paquets sensibles à la latence passent par le lien le plus rapide
- **Redondance** : même données sur plusieurs liens pour les applications critiques

Les tests Cisco montrent une **amélioration de 47% du débit** avec le MLO activé par rapport à Wi-Fi 6 dans les mêmes conditions.

## 320 MHz : le double de bande passante

Wi-Fi 7 double la largeur de canal maximale, passant de 160 MHz à **320 MHz** dans la bande 6 GHz.

En Europe, avec 1200 MHz disponibles en bande 6 GHz, on peut théoriquement avoir **3 canaux de 320 MHz**. En pratique, c'est une ressource rare qu'il faudra planifier soigneusement.

## 4K-QAM : +20% de débit théorique

La modulation passe de 1024-QAM à **4096-QAM**, encodant 12 bits par symbole au lieu de 10. Le gain : environ **20% de débit supplémentaire**.

Le hic : ça nécessite un SNR de ~42 dB (vs 31 dB pour 1K-QAM). Autrement dit, ça fonctionne uniquement à **quelques mètres de l'AP**. C'est une fonctionnalité optionnelle pour la certification.

## Preamble Puncturing : fini le gaspillage

Avant Wi-Fi 7, une interférence sur une portion d'un canal large bloquait l'utilisation des canaux secondaires. Avec le **Preamble Puncturing**, on peut "perforer" uniquement la partie affectée et continuer à utiliser le reste.

Exemple : canal de 80 MHz avec 20 MHz brouillés → on perd 20 MHz au lieu de 60 MHz. Fonctionnalité obligatoire.

## Les chiffres qui comptent

| Métrique | Wi-Fi 6/6E | Wi-Fi 7 |
|----------|-----------|---------|
| Débit max théorique | 9,6 Gbps | **46 Gbps** |
| Largeur canal max | 160 MHz | **320 MHz** |
| Modulation max | 1024-QAM | **4096-QAM** |

En conditions réelles (tests WBA mai 2025) :
- **~2 Gbps** en downlink proche de l'AP (6 GHz, 160 MHz)
- **> 1 Gbps maintenu jusqu'à 12 mètres**
- Latence cible : **< 5 ms** pour AR/VR

## Ce que ça implique pour les opérateurs

![Point d'accès Wi-Fi enterprise en environnement professionnel](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images%2Fwifi7-enterprise-ap.png)

### Infrastructure

![Infrastructure réseau avec switches PoE et câblage structuré](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images%2Fwifi7-infrastructure.png)

L'upgrade n'est pas que côté radio :

- **Alimentation** : 802.3bt (UPOE) recommandé — les AP consomment 30-60W
- **Switching** : multi-gig obligatoire (2,5 GbE minimum, 5/10 GbE recommandé)
- **Backhaul** : le débit agrégé tri-bande + MLO dépasse facilement 1 Gbps

### Sécurité

**WPA3 est obligatoire** pour bénéficier des fonctionnalités Wi-Fi 7 (MLO, débits EHT). Les clients non-WPA3 fonctionneront, mais en mode dégradé Wi-Fi 6.

Point d'attention : WPA3 n'est pas rétrocompatible avec WPA2. Prévoir un mode mixte pour les appareils legacy.

### Planification radio

La bande 6 GHz a une portée réduite par rapport au 5 GHz. Conséquence : **plus d'AP potentiellement nécessaires** pour maintenir la couverture.

Recommandation : commencer par des canaux 160 MHz (plus de flexibilité), réserver le 320 MHz aux zones spécifiques à très haut débit.

## Cas d'usage B2B

### Hôtellerie
- Streaming 4K/8K dans les chambres
- MLO pour la stabilité dans les espaces denses (lobbies, salles de conf)
- Meilleure cohabitation Wi-Fi + IoT hôtelier

### Résidences étudiantes
- 5-10 appareils par résident = densité élevée
- Latence gaming/visio pour les examens en ligne
- MRU pour gérer efficacement les nombreux clients simultanés

### Entreprises
- AR/VR pour la formation et le design
- Applications collaboratives exigeantes
- Automatisation industrielle temps réel

## Calendrier et adoption

- **Janvier 2024** : certification Wi-Fi Alliance disponible
- **Juillet 2025** : norme IEEE finale publiée
- **Fin 2025** : ~17% des revenus AP enterprise (prévision IDC)
- **2027** : ~50% du marché AP enterprise

Les équipements sont là : Cisco Catalyst/Meraki, RUCKUS, Aruba, Juniper/Mist, Extreme Networks proposent tous des gammes Wi-Fi 7.

## Notre recommandation

Wi-Fi 7 est prêt pour la production. Pour les opérateurs réseau :

1. **Nouveaux déploiements** : partir directement en Wi-Fi 7
2. **Sites existants** : prioriser le refresh des zones haute densité
3. **Infrastructure** : anticiper le switch multi-gig et l'upgrade PoE
4. **Sécurité** : préparer la migration WPA3

Le cycle de refresh AP typique est de 5-7 ans. Autant investir maintenant dans une technologie qui sera le standard de la prochaine décennie.
