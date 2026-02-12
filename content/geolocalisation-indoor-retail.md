## Le retail face au défi de la donnée spatiale

Le commerce physique vit une mutation profonde. Face à la montée du e-commerce — qui capte aujourd'hui plus de 14 % des ventes au détail en France — les enseignes cherchent à combler un fossé critique : le manque de données sur le comportement client en magasin. En ligne, chaque clic, chaque hésitation, chaque parcours est tracé, analysé, optimisé. En boutique ? Jusqu'à récemment, les retailers naviguaient largement à l'aveugle.

C'est là qu'intervient la **géolocalisation indoor**. En exploitant les signaux Wi-Fi et Bluetooth déjà présents dans la plupart des environnements commerciaux, il devient possible de cartographier les déplacements des clients, d'identifier les zones chaudes, d'optimiser l'agencement des rayons et de déclencher des interactions contextuelles en temps réel.

Le marché mondial de la localisation indoor est estimé à **16,9 milliards de dollars en 2025**, avec une croissance annuelle supérieure à 23 % jusqu'en 2032 (Research and Markets, 2025). Le retail représente l'un des premiers secteurs d'adoption : plus de 65 % des grandes chaînes en Europe et aux États-Unis ont déployé des services de localisation en magasin en 2024 (Global Growth Insights).

Pour un opérateur réseau B2B comme Wifirst, qui déploie et opère des infrastructures Wi-Fi dans des milliers de sites, cette convergence entre réseau et analytics spatiales ouvre un terrain stratégique. L'infrastructure est déjà en place — il reste à en libérer la valeur.

## Les technologies clés : Wi-Fi, BLE et approches hybrides

![Technologies de géolocalisation indoor](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/geolocalisation-indoor-technologies.png)

Trois familles de technologies dominent le paysage de la géolocalisation indoor. Chacune présente des compromis distincts en termes de précision, de coût et de complexité de déploiement.

### Wi-Fi : capitaliser sur l'infrastructure existante

Le Wi-Fi est la technologie la plus naturelle pour la localisation indoor dans le retail. La raison est simple : **les bornes d'accès (AP) sont déjà déployées** pour fournir la connectivité aux clients et aux collaborateurs. Exploiter ces AP pour la géolocalisation représente un surcoût marginal par rapport à un déploiement from scratch.

Deux approches principales coexistent :

- **Wi-Fi RSSI (Received Signal Strength Indicator)** : méthode historique qui exploite la puissance du signal reçu par les AP depuis les terminaux clients. Simple à implémenter, elle offre une précision de **3 à 8 mètres** — suffisante pour de l'analytics de flux et des heat maps zonales, mais insuffisante pour de la navigation turn-by-turn dans un rayon.

- **Wi-Fi RTT / FTM (Round-Trip Time / Fine Time Measurement)** : standardisé par l'amendement **IEEE 802.11mc**, le RTT mesure le temps d'aller-retour du signal entre le terminal et l'AP pour calculer une distance précise. La précision atteint **1 à 2 mètres**, un saut qualitatif majeur. Cette technologie nécessite toutefois des AP compatibles 802.11mc et des terminaux supportant le protocole (Android 9+ avec chipset compatible).

### Bluetooth Low Energy (BLE) : la précision au service de la proximité

Les **beacons BLE** sont de petits émetteurs autonomes qui diffusent périodiquement un identifiant unique. Déployés dans un magasin, ils permettent aux applications mobiles de détecter la proximité d'un point d'intérêt spécifique — un rayon, un présentoir, une caisse.

Le BLE excelle dans trois configurations :

- **Proximité simple (iBeacon / Eddystone)** : détection de zone à quelques mètres. Idéal pour le marketing contextuel et les notifications push géolocalisées.

- **BLE RSSI avec trilatération** : en combinant les signaux de plusieurs beacons, on obtient une précision de **2 à 5 mètres**. Comparable au Wi-Fi RSSI, mais avec un maillage plus fin et un coût unitaire par beacon très faible (3 à 15 € par unité).

- **BLE 5.1 Angle of Arrival (AoA) / Angle of Departure (AoD)** : la dernière génération exploite des antennes réseau pour mesurer l'angle d'arrivée du signal, atteignant une précision **sub-métrique (30 cm à 1 m)**. C'est la technologie la plus précise du portefeuille Bluetooth, mais elle requiert des locators dédiés avec antennes multi-éléments.

### UWB (Ultra-Wideband) : la référence en précision

L'**UWB** offre une précision de **10 à 30 centimètres** grâce à des impulsions radio à très large bande. Standardisé par l'IEEE 802.15.4z, il est la technologie de choix pour le suivi d'actifs de haute valeur (chariots connectés, assets logistiques). Son coût de déploiement élevé et la nécessité de tags dédiés limitent toutefois son adoption massive dans le retail grand public.

### L'approche hybride : le meilleur des deux mondes

En pratique, les déploiements les plus performants **combinent Wi-Fi et BLE**. Le Wi-Fi fournit une couverture large et une localisation de base (room-level), tandis que le BLE affine la précision dans les zones stratégiques. Cette architecture hybride est celle privilégiée par les principaux acteurs du marché : Cisco Spaces, Juniper Mist, Aruba (HPE).

| Technologie | Précision | Coût déploiement | Infrastructure requise | Cas d'usage retail |
|---|---|---|---|---|
| Wi-Fi RSSI | 3–8 m | Faible (AP existants) | AP Wi-Fi standards | Heat maps, flux globaux |
| Wi-Fi RTT (802.11mc) | 1–2 m | Moyen (AP compatibles) | AP 802.11mc | Navigation indoor |
| BLE beacons (RSSI) | 2–5 m | Faible | Beacons dédiés | Proximité, push marketing |
| BLE 5.1 AoA/AoD | 0,3–1 m | Élevé | Locators AoA | Suivi rayon précis |
| UWB | 0,1–0,3 m | Très élevé | Ancres UWB + tags | Asset tracking premium |

## Comment ça marche : les mécanismes techniques

![Schéma technique fingerprinting et trilatération](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/geolocalisation-indoor-technique.png)

Derrière les acronymes, les systèmes de géolocalisation indoor reposent sur quelques principes physiques et algorithmiques fondamentaux.

### Fingerprinting : la cartographie des signaux

Le **fingerprinting** (ou empreinte radio) est la méthode la plus répandue pour la localisation Wi-Fi. Son principe :

1. **Phase de calibration (offline)** : on parcourt le site en enregistrant, à chaque point de référence, les niveaux RSSI reçus de chaque AP visible. Ces mesures constituent une **radio map** — une base de données de signatures radio indexées par coordonnées.

2. **Phase de localisation (online)** : quand un terminal se connecte, il transmet les RSSI qu'il capte en temps réel. Un algorithme compare cette empreinte avec la radio map et identifie, par **k-Nearest Neighbors (k-NN)**, réseau de neurones ou autre méthode de machine learning, la position la plus probable.

Le fingerprinting a l'avantage de s'adapter naturellement aux environnements complexes avec obstacles (rayonnages, murs, piliers) où les modèles de propagation théoriques échouent. Son inconvénient principal : la **maintenance de la radio map**. Tout réagencement du magasin, changement de mobilier ou ajout d'AP nécessite une recalibration. Les approches modernes utilisent le **crowdsourcing** et le **transfer learning** pour réduire cette charge.

### Trilatération et triangulation

La **trilatération** estime la position d'un terminal en mesurant sa distance à trois émetteurs ou plus (par RSSI ou RTT) et en calculant l'intersection des cercles correspondants. C'est le principe utilisé par Wi-Fi RTT et UWB.

La **triangulation**, elle, utilise les angles (AoA/AoD) plutôt que les distances. Avec deux ou trois points de mesure angulaire, on détermine la position par intersection de droites. C'est le mécanisme du BLE 5.1 Direction Finding.

### Wi-Fi RTT / FTM en détail

Le protocole **Fine Time Measurement** (FTM) défini par l'IEEE 802.11mc fonctionne ainsi :

1. Le terminal (initiator) envoie une requête FTM à l'AP (responder).
2. L'AP répond avec un horodatage précis (timestamps t1, t2, t3, t4).
3. Le RTT est calculé : `RTT = (t4 - t1) - (t3 - t2)`.
4. La distance est déduite : `d = (RTT × c) / 2` où *c* est la vitesse de la lumière.

Avec des horloges à résolution nanoseconde, le FTM atteint une précision de distance de l'ordre du mètre, même en environnement indoor avec multipath. L'évolution **802.11az** (Next Generation Positioning) améliore encore cette précision avec des mécanismes de sécurisation et une meilleure gestion des trajets multiples.

### Le rôle du machine learning

Les systèmes modernes intègrent massivement le **machine learning** pour améliorer la précision et la robustesse :

- **Deep learning pour le fingerprinting** : les réseaux de neurones convolutifs (CNN) et les autoencoders apprennent des représentations plus robustes des signatures radio, réduisant l'impact des variations temporelles du signal.
- **Filtrage particule et Kalman** : ces filtres bayésiens lissent les trajectoires estimées en exploitant le modèle de déplacement humain (on ne se téléporte pas d'un rayon à l'autre).
- **Graph Temporal Convolution Networks** : les architectures les plus récentes combinent données RSS et RTT dans des réseaux graphiques pour exploiter la topologie spatiale du site (travaux publiés en 2025).

## Cas d'usage concrets dans le retail

![Cas d'usage retail : analytics et expérience client](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/geolocalisation-indoor-usecases.png)

La géolocalisation indoor transforme le magasin physique en un espace mesurable, optimisable et interactif. Voici les cas d'usage qui génèrent le plus de valeur.

### Analytics de flux et heat maps

C'est le cas d'usage fondamental. En agrégeant les positions anonymisées des terminaux Wi-Fi et/ou des signaux BLE, les retailers construisent des **cartes de chaleur** (heat maps) qui révèlent :

- Les **zones à fort trafic** et les zones mortes
- Les **parcours types** des clients (entrée → rayon X → rayon Y → caisse)
- Les **temps de stationnement** (dwell time) devant chaque zone
- Les **taux de conversion** par zone (ratio visiteurs / achats)

Ces données alimentent des décisions concrètes : réagencement des rayons, repositionnement des promotions, optimisation des effectifs en caisse aux heures de pointe. Juniper Mist, par exemple, propose des dashboards d'analytics intégrés qui exploitent directement les données de localisation de ses AP Wi-Fi et BLE.

### Navigation indoor et wayfinding

Pour les grandes surfaces (hypermarchés, centres commerciaux, magasins de bricolage), la **navigation indoor turn-by-turn** permet au client de rechercher un produit et d'être guidé jusqu'à son emplacement exact. Cisco Spaces (ex-DNA Spaces) propose cette fonctionnalité via des App Clips mobiles, sans nécessiter l'installation d'une application dédiée.

La précision requise ici est de l'ordre de **1 à 2 mètres** — ce que permettent le Wi-Fi RTT et le BLE AoA, mais pas le simple RSSI.

### Marketing contextuel et notifications push

Les beacons BLE excellent dans le **proximity marketing** :

- **Notification de bienvenue** à l'entrée du magasin
- **Offre promotionnelle** quand le client s'approche d'un rayon spécifique
- **Cross-selling** contextuel basé sur le parcours en cours
- **Programme de fidélité** enrichi par les données de visite (fréquence, durée, zones visitées)

L'efficacité de ces notifications dépend directement de leur **pertinence contextuelle**. Un message envoyé au bon endroit et au bon moment affiche des taux d'engagement 3 à 5 fois supérieurs aux notifications push classiques.

### Gestion des stocks et asset tracking

Au-delà du client, la géolocalisation indoor sert aussi les **opérations** :

- **Localisation des chariots et des équipements** en temps réel (palettes, trans-palettes, terminaux de scan)
- **Suivi des réassorts** : détection automatique quand un chariot quitte la réserve pour le rayon
- **Inventaire dynamique** : couplée à la RFID, la localisation indoor permet de connaître la position des produits en temps réel

Pour ces cas, l'UWB ou le BLE AoA offrent la précision nécessaire, tandis que le Wi-Fi fournit la couverture de backhaul.

### Mesure de l'impact des campagnes offline

En croisant les données de géolocalisation avec les données de vente, les enseignes peuvent mesurer le **ROI des campagnes in-store** : une PLV (publicité sur le lieu de vente) a-t-elle réellement attiré du trafic dans le rayon concerné ? Le réagencement a-t-il augmenté le temps passé dans la zone premium ?

## Enjeux et défis

### Précision vs. coût : l'équation à résoudre

Chaque palier de précision a un prix. Passer de 5 mètres (Wi-Fi RSSI) à 1 mètre (RTT / BLE AoA) multiplie les coûts de déploiement et de maintenance. Le choix technologique doit être guidé par le **cas d'usage réel** : une heat map zonale ne justifie pas l'investissement dans du BLE 5.1 AoA ; une navigation indoor exige en revanche mieux que du RSSI brut.

La **densité d'AP** est un facteur critique. Pour le fingerprinting Wi-Fi, on recommande un AP tous les 15 à 20 mètres pour une précision acceptable. Pour le BLE, un beacon tous les 6 à 10 mètres dans les zones stratégiques.

### RGPD et vie privée : un impératif non négociable

La géolocalisation indoor traite des **données à caractère personnel** au sens du RGPD. Les adresses MAC, même hashées, peuvent constituer des identifiants uniques. Les enjeux sont multiples :

- **Base légale** : le consentement explicite est généralement requis pour la localisation fine des individus. L'intérêt légitime est plus difficile à justifier pour des données aussi intrusives.
- **Minimisation des données** : ne collecter que ce qui est strictement nécessaire. Les analytics de flux agrégées et anonymisées sont moins problématiques que le suivi individuel.
- **MAC address randomization** : depuis iOS 14 et Android 10, les terminaux randomisent leur adresse MAC par défaut, rendant le tracking passif par Wi-Fi probe requests de plus en plus difficile. C'est un changement structurel qui pousse vers des approches opt-in (application, portail captif) plutôt que le tracking passif.
- **Durée de conservation** : les données de localisation brutes ne doivent pas être conservées au-delà de la durée strictement nécessaire à leur finalité.
- **Information et transparence** : affichage visible en magasin, politique de confidentialité accessible, mécanisme d'opt-out effectif.

Les retailers les plus matures adoptent une approche **privacy-by-design** : anonymisation à la source, agrégation temps réel, suppression automatique des données brutes après traitement. C'est la seule voie viable à long terme.

### Interopérabilité et vendor lock-in

L'écosystème est fragmenté. Cisco Spaces ne parle qu'aux AP Cisco/Meraki, Juniper Mist à ses propres AP, Aruba Meridian à son écosystème HPE. Les standards ouverts (Wi-Fi RTT, BLE 5.1) progressent, mais l'intégration complète reste souvent propriétaire.

Pour un retailer multi-sites avec un parc hétérogène, cette fragmentation est un vrai frein. C'est là qu'un **opérateur réseau agnostique** comme Wifirst peut apporter de la valeur : en abstrayant la complexité multi-vendor et en proposant une couche d'analytics unifiée.

### Maintenance et évolution

Un système de localisation indoor n'est pas un déploiement one-shot :

- Les **radio maps** doivent être recalibrées à chaque modification du site
- Les **beacons BLE** ont une durée de vie de batterie de 2 à 5 ans et doivent être remplacés
- Les **mises à jour firmware** des AP peuvent impacter la précision
- Les **évolutions des OS mobiles** (randomisation MAC, restrictions background BLE) nécessitent une adaptation continue

## Perspectives et tendances

![Tendances futures de la géolocalisation indoor](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/geolocalisation-indoor-tendances.png)

### Wi-Fi 7 et 802.11az : la prochaine génération

Le **Wi-Fi 7 (802.11be)** et l'amendement **802.11az** (Next Generation Positioning) promettent un bond en précision. Le 802.11az introduit le **Secure LTF** (Long Training Field) qui améliore la mesure de distance tout en sécurisant les échanges FTM contre le spoofing. La précision attendue descend sous le mètre, rendant le Wi-Fi compétitif avec le BLE AoA pour la première fois.

### IA et jumeaux numériques

L'intégration de la localisation indoor dans les **digital twins** de bâtiments permet de simuler et d'optimiser l'agencement avant de le modifier physiquement. Les algorithmes de **reinforcement learning** commencent à être utilisés pour optimiser automatiquement le placement des produits en fonction des données de flux.

### Convergence Wi-Fi / BLE / UWB

Les chipsets modernes (Qualcomm, Broadcom) intègrent de plus en plus Wi-Fi 6E/7, BLE 5.3+ et UWB sur une même puce. Cette convergence hardware simplifie le déploiement d'architectures hybrides et réduit les coûts. Les AP Wi-Fi de dernière génération (Cisco CW9178, Juniper AP47, Aruba 730) embarquent nativement des radios BLE et parfois UWB, transformant chaque point d'accès en **locator multimodal**.

### Le rôle stratégique de l'opérateur réseau

Pour un opérateur B2B comme Wifirst, la géolocalisation indoor représente une opportunité de **montée en valeur**. L'infrastructure Wi-Fi déployée et opérée pour la connectivité peut être enrichie d'une couche de services de localisation — sans investissement matériel supplémentaire majeur dans le cas du Wi-Fi RSSI, et avec un surcoût maîtrisé pour le RTT.

Les atouts d'un opérateur réseau dans ce contexte :

- **Infrastructure existante** : des milliers d'AP déjà déployés, maintenus et supervisés
- **Compétences réseau** : maîtrise du dimensionnement, de la couverture et du roaming — des prérequis pour une localisation de qualité
- **Managed services** : capacité à opérer le service de bout en bout (calibration, maintenance des radio maps, gestion des beacons, supervision)
- **Neutralité vendor** : positionnement agnostique permettant de déployer la meilleure technologie pour chaque cas d'usage
- **Conformité RGPD** : expertise dans la gestion des données personnelles (portails captifs, analytics Wi-Fi) transposable à la localisation

La proposition de valeur est claire : transformer le réseau Wi-Fi d'un centre de coût (la connectivité) en un **actif productif** générant des insights business pour le retailer.

## Conclusion : du réseau à l'intelligence spatiale

La géolocalisation indoor n'est plus une technologie expérimentale. Les standards sont matures (802.11mc, BLE 5.1, 802.11az), les cas d'usage sont validés par des déploiements à grande échelle, et le marché connaît une croissance à deux chiffres.

Pour le retail, c'est un levier de compétitivité : les enseignes qui maîtrisent la donnée spatiale prennent des décisions plus rapides, plus éclairées et plus rentables que celles qui opèrent à l'aveugle.

Pour les opérateurs réseau B2B, c'est une opportunité de transformation : chaque borne Wi-Fi déployée devient un capteur spatial, chaque réseau opéré devient une plateforme d'analytics. La question n'est plus de savoir **si** cette convergence réseau-localisation va se produire, mais **qui** va en capter la valeur.
