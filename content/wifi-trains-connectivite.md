## Le défi de la connectivité ferroviaire

Offrir une connexion WiFi stable à 300 km/h dans un tube métallique traversant des zones rurales représente l'un des défis techniques les plus complexes du monde des télécoms. Entre effet Faraday des wagons, handovers cellulaires à répétition et tunnels sans couverture, les opérateurs ferroviaires doivent déployer des architectures sophistiquées combinant réseaux mobiles et satellites.

Cet article décortique les solutions techniques actuelles et les évolutions qui transforment l'expérience passager.

![Architecture réseau embarqué dans un train](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/wifi-trains-architecture.png)

## Architecture réseau mobile : captation et distribution

### Antennes et répéteurs embarqués

L'architecture WiFi d'un train moderne repose sur plusieurs composants clés :

- **Antennes extérieures sur le toit** : systèmes MIMO 4x4 ou 8x8 captant les signaux 4G/5G des opérateurs le long des voies
- **Routeurs embarqués multi-SIM** : agrégation de plusieurs connexions cellulaires simultanées
- **Répéteurs intérieurs** : redistribution du signal via WiFi aux passagers
- **Backbone fibre optique** : liaison inter-voitures pour une couverture homogène

Le problème majeur reste l'**effet cage de Faraday** des wagons modernes. Les vitres Low-E avec revêtements métallisés et l'isolation acoustique en aluminium créent une atténuation de 20 à 30 dB — l'équivalent d'un mur de béton. Les solutions passent par des fenêtres RF-perméables ou des antennes déportées sur le toit avec redistribution interne.

### Le cauchemar du handover à haute vitesse

À 300 km/h, un TGV traverse une cellule 4G en 10 à 20 secondes seulement. Chaque transition (handover) génère 30 à 50 ms de latence, avec un taux d'échec de 5 à 15% sans optimisation.

Les spécifications 3GPP Release 16 garantissent désormais la mobilité jusqu'à **500 km/h** grâce à plusieurs innovations :

| Technologie | Principe |
|-------------|----------|
| **Conditional Handover** | Préparation anticipée de plusieurs cellules cibles |
| **Location-aware Handover** | Utilisation GPS pour prédire les transitions |
| **Soft Handover** | Connexion simultanée à 2 cellules pendant la transition |

### Agrégation multi-opérateurs

Les solutions de **WAN bonding** agrègent 4 à 8 connexions cellulaires simultanées provenant de différents opérateurs. Le trafic est distribué intelligemment sur tous les liens disponibles avec failover automatique.

Les technologies leaders incluent **SureWAN** (Icomera), **CloudLink** (Unwired Networks) et les solutions SD-WAN ferroviaires de Nomad Digital. Les performances typiques atteignent 50 à 150 Mbps en zones bien couvertes, avec une disponibilité supérieure à 95% sur les corridors principaux.

![Constellation de satellites LEO en orbite basse](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/wifi-trains-satellite.png)

## Solutions satellitaires : LEO vs GEO

### Comparatif des technologies

| Caractéristique | LEO (Starlink, OneWeb) | GEO (Eutelsat, Viasat) |
|-----------------|------------------------|------------------------|
| **Altitude** | 500-1200 km | 35 786 km |
| **Latence** | 20-50 ms | 600-800 ms |
| **Débit par terminal** | 200-400 Mbps | 50-150 Mbps |
| **Couverture** | Constellation (milliers de satellites) | 3-4 satellites couvrent le globe |
| **Coût terminal** | 2 000-5 000 € | 5 000-15 000 € |

Les constellations LEO présentent des avantages décisifs pour le ferroviaire : latence compatible avec la visioconférence, pas de zones d'ombre polaires, et meilleur fonctionnement en mouvement.

### Antennes à suivi : phased array vs paraboles

Deux technologies s'affrontent pour le suivi des satellites :

**Phased Array (antennes à balayage électronique)** :
- Aucune pièce mobile
- Suivi instantané (<1 ms)
- Profil bas (5-10 cm)
- Exemples : Starlink Rigid Terminal, Kymeta u8

**Paraboles motorisées** :
- Technologie éprouvée
- Gain antenne supérieur
- Maintenance mécanique requise
- Encombrement plus important

**Mai 2025** a marqué une étape majeure avec la première certification rail pour Starlink, obtenue par Clarus Networks pour ScotRail.

### Déploiements ferroviaires actuels

| Opérateur | Pays | Technologie | Statut |
|-----------|------|-------------|--------|
| **ScotRail** | Écosse | Starlink LEO | ✅ Opérationnel (mai 2025) |
| **Amtrak (Acela)** | États-Unis | Starlink + cellulaire | ✅ Opérationnel |
| **SNCF** | France | Hybride 4G/5G + satellite | 📋 Prévu 2026-2028 |
| **Deutsche Bahn** | Allemagne | Tests Starlink via Icomera | 🔄 En cours |

Les résultats des tests Starlink ferroviaires sont prometteurs : 200-400 Mbps de débit, latence inférieure à 40 ms, disponibilité supérieure à 99% hors tunnels.

## Architecture hybride : le meilleur des deux mondes

### Complémentarité cellulaire et satellite

Chaque technologie excelle dans des environnements spécifiques :

| Environnement | Technologie optimale |
|---------------|---------------------|
| Zones urbaines denses | 4G/5G (capacité, faible latence) |
| Zones rurales | Satellite LEO (couverture) |
| Tunnels | Cellulaire si DAS installé |
| Haute vitesse pleine voie | Satellite (moins de handovers) |

### Failover et load balancing intelligent

L'architecture hybride combine les flux selon des politiques dynamiques :

- **Politique par défaut** : cellulaire prioritaire (coût moindre)
- **Failover** : basculement satellite si signal cellulaire insuffisant
- **Load balancing** : répartition selon latence mesurée, bande passante disponible, type de trafic et coût data

La SNCF prévoit un déploiement généralisé de cette architecture hybride d'ici 2028, avec un appel d'offres opposant Starlink à Eutelsat (OneWeb) — l'enjeu de souveraineté européenne pesant dans la balance.

![Passagers connectés dans un train moderne](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/wifi-trains-passengers.png)

## Défis techniques spécifiques

### Tunnels et zones blanches

La couverture des tunnels repose sur deux technologies principales :

**Leaky Feeder (câble rayonnant)** : câble coaxial avec fentes émettant le signal, nécessitant des amplificateurs tous les 500 mètres. Coût : environ 50-100 €/mètre linéaire.

**DAS (Distributed Antenna System)** : petites antennes distribuées tous les 100-300 mètres, offrant une meilleure capacité mais un coût d'installation plus élevé.

La couverture reste incomplète : en Suède, 45 tunnels de plus de 300 mètres n'ont toujours pas de couverture mobile en 2023.

### Gestion de la densité

Un TGV duplex transporte jusqu'à **508 passagers**. Avec 40-60% connectés simultanément et un usage moyen de 1-5 Mbps par passager (streaming), le besoin backhaul atteint 200-500 Mbps minimum.

Les solutions incluent le WiFi 6 avec OFDMA pour une meilleure gestion multi-utilisateurs, le traffic shaping limitant chaque utilisateur, et le content caching local préchargeant les contenus populaires.

## Évolutions et tendances

### 5G et FRMCS

Le **FRMCS (Future Railway Mobile Communication System)** succédera au GSM-R pour les communications critiques ferroviaires. Basé sur la 5G SA avec une bande dédiée à 1900 MHz, son déploiement européen s'étalera de 2025 à 2030.

Le **Network Slicing** permettra de séparer les flux :
- **URLLC** : signalisation critique, latence <10 ms
- **eMBB** : WiFi passagers, latence <50 ms
- **mMTC** : IoT et capteurs

### WiFi 6E et WiFi 7 à bord

L'évolution des standards WiFi embarqués progresse rapidement :

| Standard | Adoption rail 2025 | Avantage clé |
|----------|-------------------|--------------|
| WiFi 4/5 | 90% | Legacy |
| WiFi 6 | 8% | OFDMA, MU-MIMO |
| WiFi 6E | 2% | Bande 6 GHz moins encombrée |
| WiFi 7 | <1% (pilotes) | MLO, 46 Gbps théorique |

L'**Icomera A2**, premier point d'accès WiFi 7 certifié ferroviaire, introduit le Multi-Link Operation pour une latence inférieure à 2 ms.

## Benchmark européen

Les performances WiFi varient considérablement selon les pays (Ookla Q2 2025) :

| Pays | Débit médian | Commentaire |
|------|--------------|-------------|
| 🇸🇪 Suède | 64,58 Mbps | Leader européen, infrastructure dédiée |
| 🇨🇭 Suisse | 29,79 Mbps | SBB FreeSurf + bonding avancé |
| 🇫🇷 France | 19,12 Mbps | TGV multi-opérateurs 4G |
| 🇩🇪 Allemagne | ~15 Mbps | ICE avec Icomera |
| 🇬🇧 Royaume-Uni | 1,09 Mbps | Équipement legacy WiFi 4 |

L'écart de performance reflète directement les investissements dans l'infrastructure embarquée et la couverture des corridors ferroviaires.

## Acteurs clés du marché

| Fournisseur | Spécialité | Clients notables |
|-------------|-----------|------------------|
| **Icomera** (Amadeus) | Routeurs, agrégation WAN, Starlink | Deutsche Bahn, Amtrak, SJ |
| **Nomad Digital** (Alstom) | WiFi embarqué, analytics | Eurostar, Trenitalia |
| **Clarus Networks** | Intégration Starlink rail | ScotRail |
| **Galgus** | WiFi intelligent | Renfe, métros |

## Conclusion

La connectivité WiFi dans les trains évolue vers un modèle **hybride cellulaire + satellite LEO** avec bonding intelligent. Les défis principaux — effet Faraday, handovers haute vitesse, tunnels — trouvent des réponses technologiques matures.

Les constellations LEO comme Starlink bouleversent l'équation en offrant une couverture quasi-universelle avec des latences acceptables. Couplées à l'agrégation multi-opérateurs et au WiFi 6E/7, elles promettent une expérience passager proche de celle d'un bureau connecté.

La SNCF prévoit un déploiement généralisé d'ici 2028, tandis que ScotRail a inauguré en mai 2025 la première certification rail Starlink mondiale. Le train connecté n'est plus un luxe — c'est une attente légitime des voyageurs, et l'industrie ferroviaire se donne enfin les moyens d'y répondre.
