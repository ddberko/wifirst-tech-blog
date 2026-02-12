## Cisco Live EMEA 2026 : les 5 annonces qui redéfinissent l'infrastructure réseau

Le 10 février 2026, à Amsterdam, Cisco a profité de son événement phare **Cisco Live EMEA** pour dévoiler une série d'innovations qui marquent un tournant dans l'histoire du géant du réseau. Le message est clair : le réseau n'est plus un tuyau passif, c'est une **plateforme d'intelligence artificielle**. Retour sur les cinq annonces majeures et ce qu'elles signifient concrètement pour les opérateurs et les entreprises.

![Le Silicon One G300, la nouvelle puce de commutation AI de Cisco](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/cisco-silicon-one-g300.png)

## Silicon One G300 : 102,4 Tbps dans une puce

La star de la conférence, c'est incontestablement le **Silicon One G300**. Cette puce de commutation, gravée en **3 nm chez TSMC**, repousse les limites avec une capacité de **102,4 térabits par seconde** — un record pour du silicium Ethernet.

Mais la vraie rupture ne tient pas uniquement au débit brut. Cisco introduit ce qu'il appelle l'**Intelligent Collective Networking**, une combinaison de trois technologies intégrées directement dans le silicium :

- **Buffer partagé de paquets** : un pool mémoire unifié qui absorbe les rafales de trafic AI (2,5× mieux que les alternatives selon Cisco)
- **Équilibrage de charge par chemin** (*path-based load balancing*) : routage granulaire qui répartit intelligemment les flux east-west entre GPU
- **Télémétrie proactive** : remontée d'informations réseau en temps réel vers les ordonnanceurs de jobs AI

Les résultats annoncés sont significatifs : **+33 % d'utilisation réseau** et **-28 % de temps de complétion des jobs** par rapport à un routage non optimisé. En clair, plus de tokens générés par heure GPU, donc un meilleur retour sur investissement pour chaque cluster AI.

> *« Il ne s'agit plus simplement de bande passante brute. C'est l'intelligence intégrée dans le silicium qui fait la différence — l'équilibrage de charge granulaire, la télémétrie fine qui alimente les ordonnanceurs. »*
> — Kevin Wolterweber, SVP Data Center & Internet Infrastructure, Cisco

Le G300 est aussi **entièrement programmable** : de nouvelles fonctionnalités réseau peuvent être ajoutées après déploiement, protégeant ainsi l'investissement à long terme. Et la sécurité est fusionnée dans le hardware, avec du chiffrement à vitesse ligne.

Sameh Boujelbene, VP chez Dell'Oro Group, résume : *« Le G300 représente bien plus qu'une mise à niveau incrémentale. Cisco pousse l'intelligence directement dans le silicium de commutation, ce qui répond aux vraies douleurs des grands clusters AI : trafic east-west imprévisible, hotspots de congestion et limites des fabrics legacy. »*

![Systèmes Cisco Nexus liquid-cooled pour datacenters AI](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/cisco-liquid-cooling.png)

## Nouveaux systèmes : liquid cooling et optique 1,6T

Le silicium ne vit pas seul. Cisco lance de nouveaux châssis **Nexus 9000** et **Cisco 8000** propulsés par le G300, disponibles en configurations air-cooled et **100 % liquid-cooled**.

### Pourquoi le liquid cooling change la donne

Les chiffres parlent d'eux-mêmes :

- **Amélioration de l'efficacité énergétique de ~70 %** par rapport à la génération précédente
- **Un seul système** remplace ce qui nécessitait auparavant **6 systèmes** pour la même bande passante
- Alignement avec l'évolution des serveurs GPU, qui passent eux aussi au refroidissement liquide

> *« Les futures générations de GPU seront toutes liquid-cooled. Nous intégrons donc le refroidissement liquide dans nos équipements de commutation également. »*
> — Kevin Wolterweber, Cisco

### Optique nouvelle génération

Côté interconnexions, deux innovations majeures :

| Module | Capacité | Avantage clé |
|--------|----------|--------------|
| **OSFP 1,6T** | 1,6 Tbps par module | Connectivité ultra-haute densité switch-to-NIC et switch-to-server |
| **LPO 800G** | 800 Gbps linéaire | -50 % de consommation par module optique, -30 % de puissance globale du switch |

Les optiques **Linear Pluggable (LPO)** sont particulièrement intéressantes : en supprimant l'étape de retiming du signal, elles réduisent drastiquement la consommation — un argument de poids quand on gère des centaines de ports par rack.

Cisco étend également son portefeuille basé sur la puce **Silicon One P200** (51,2 Tbps) pour les cas d'usage **scale-across** — interconnexion de datacenters distants en un seul pool de ressources. Selon IDC, près de **90 % des entreprises** prévoient d'augmenter leur bande passante inter-datacenter de plus de 10 % dans l'année à venir, et plus d'un tiers anticipe une croissance de 50 % ou plus.

![AgenticOps — l'IA autonome au service du réseau](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/cisco-agenticops.png)

## AgenticOps : vers le réseau autonome

C'est peut-être l'annonce la plus ambitieuse. Cisco passe de l'IA qui **observe** à l'IA qui **raisonne, décide et agit**. Bienvenue dans l'ère de l'**AgenticOps** — un ensemble de capacités autonomes intégrées à travers le réseau, la sécurité et l'observabilité.

### Trois piliers de l'autonomie réseau

**Troubleshooting autonome**
Fini les investigations manuelles de plusieurs heures. Les agents IA de Cisco peuvent désormais mener des investigations end-to-end en testant **plusieurs hypothèses simultanément**, réduisant le MTTR (Mean Time To Resolution) de quelques heures à quelques minutes.

**Optimisation continue**
Des agents qui ajustent en permanence les paramètres RF, la QoS et le routage pour maintenir l'expérience utilisateur — **avant même qu'un humain ne détecte une dégradation**. Pour un opérateur comme Wifirst qui gère des milliers de sites, c'est un levier de productivité considérable.

**Validation de confiance**
Avant toute modification réseau, des agents « risk-aware » évaluent l'impact potentiel sur la topologie en production. Ils identifient le **rayon d'explosion** (*blast radius*) d'un changement avant qu'il ne cause une panne. C'est du change management augmenté par l'IA.

Le concept de « réseau auto-piloté » existe depuis des années, mais l'attitude des ingénieurs réseau a évolué. Selon les analystes présents à Amsterdam, on assiste à un changement d'état d'esprit : l'IA n'est plus perçue comme une menace pour les emplois réseau, mais comme un outil qui permet de travailler **plus vite et plus intelligemment**.

Cisco prévoit d'ajouter progressivement des capacités agentiques, avec une roadmap vers l'autonomie complète d'ici **24 à 36 mois**.

## AI Defense : sécuriser la chaîne agentique

À mesure que les agents IA deviennent plus autonomes, les risques de sécurité deviennent « sémantiquement complexes ». Les firewalls traditionnels ne suffisent plus quand la menace vient d'un prompt malveillant ou d'un outil empoisonné dans la chaîne d'un agent.

Cisco répond avec la plus grosse mise à jour de sa solution **AI Defense** depuis son lancement initial :

### AI Bill of Materials (AI-BOM)

Par analogie avec le SBOM (Software Bill of Materials) du monde logiciel, l'**AI-BOM** fournit une visibilité complète sur :

- Les modèles d'IA déployés dans l'entreprise
- Les dépendances de données et d'entraînement
- Les outils et services tiers utilisés par les agents

Il ne s'agit plus de traquer du code, mais de traquer l'**intention**. C'est un changement de paradigme en sécurité : documenter la chaîne d'approvisionnement IA pour protéger contre des menaces que les firewalls classiques ne peuvent tout simplement pas voir.

### Red Teaming algorithmique avancé

Cisco introduit des tests de sécurité **multi-tours adaptatifs**. Au lieu de chercher un seul prompt malveillant, le système analyse comment un agent se comporte au cours d'une **conversation prolongée**. L'objectif : détecter les tentatives de détournement d'autorité, les outils empoisonnés et les injections de prompt sophistiquées.

Matt Garman, CEO d'AWS, a illustré l'importance de ces garde-fous lors du sommet AI de Cisco avec une métaphore parlante : *« Si vous posez une planche au-dessus d'un canyon, vous rampez dessus. La même planche avec des rambardes, vous courez. AI Defense, ce sont les rambardes. »*

![Cryptographie post-quantique intégrée au réseau](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/cisco-pqc-security.png)

## Cryptographie post-quantique full-stack

Dans une première industrielle, Cisco annonce des **protections PQC (Post-Quantum Cryptography) full-stack** intégrées à son nouveau système d'exploitation **IOS XE 26**.

### Pourquoi maintenant ?

La stratégie est claire : **« Harvest Now, Decrypt Later »**. Des acteurs malveillants collectent aujourd'hui des données chiffrées dans l'espoir de les déchiffrer demain grâce à un ordinateur quantique. Pour les organisations dont les données ont une valeur à long terme (gouvernements, santé, finance, défense), la protection doit commencer **maintenant**.

Les protections PQC sont embarquées dans :

- La nouvelle série **Cisco 8000 Secure Routers**
- Les **C9000 Smart Switches**
- L'ensemble conforme aux recommandations évolutives du NIST et des régulateurs européens

C'est un sujet que nous avions déjà exploré sur ce blog à propos de la migration PQC. Cisco concrétise cette transition en l'intégrant directement dans le matériel réseau — une approche qui simplifie considérablement le déploiement pour les opérateurs.

## Nexus One : la fabric unifiée pour l'ère AI

Pour orchestrer l'ensemble, Cisco unifie sa stratégie datacenter sous **Nexus One** — une plateforme intégrée qui regroupe silicium, systèmes, optiques et logiciel sous un modèle opérationnel unique.

### Les nouveautés clés

- **Fabric unifiée** : déploiement et gestion simplifiés des fabrics AI, on-premises ou cloud
- **Automatisation API-driven** : provisionnement programmatique des fabrics
- **Observabilité des jobs AI** : corrélation entre la télémétrie réseau et le comportement des workloads AI
- **Intégration native Splunk** (disponible mars 2026) : analyse de la télémétrie réseau directement là où résident les données, sans les déplacer vers des systèmes externes

Cette intégration Splunk est particulièrement stratégique pour les déploiements en **cloud souverain**, où la localisation des données et la conformité sont primordiales. Cisco offre essentiellement un **« single pane of glass »** pour gérer tout, des workloads traditionnels aux clusters d'entraînement AI massifs.

## Ce que ça change pour les opérateurs B2B

Pour un opérateur réseau B2B comme Wifirst, ces annonces dessinent plusieurs axes de réflexion :

**Le réseau comme avantage compétitif IA.** La thèse de Cisco est que le réseau n'est plus un centre de coût mais un multiplicateur de performance AI. Un réseau optimisé peut réduire de 28 % le temps de complétion des jobs AI — un argument business puissant pour les clients enterprise.

**L'efficacité énergétique comme impératif.** Avec des améliorations de 70 % en efficacité énergétique grâce au liquid cooling et des réductions de 30 % via les optiques LPO, la pression sur la consommation des infrastructures réseau va s'intensifier. Les opérateurs devront intégrer ces critères dans leur roadmap.

**L'autonomie opérationnelle.** L'AgenticOps promet de réduire drastiquement le MTTR et d'optimiser les réseaux en continu. Pour les opérateurs gérant des milliers de sites, c'est un levier de scalabilité majeur — à condition de maîtriser la confiance dans ces agents autonomes.

**La sécurité post-quantique.** Avec NIS2 et les réglementations européennes qui se durcissent, l'intégration PQC native dans le matériel réseau va devenir un critère de sélection fournisseur. Mieux vaut anticiper.

**Ethernet vs InfiniBand.** En misant sur Ethernet pour l'AI networking, Cisco propose une alternative ouverte et flexible à l'InfiniBand propriétaire de Nvidia. Pour les entreprises, c'est la promesse de ne pas être enfermées dans un écosystème unique — un argument qui résonne particulièrement dans le contexte de souveraineté numérique européen.

## Conclusion

Cisco Live EMEA 2026 marque un pivot stratégique pour le géant de San Jose. En intégrant l'intelligence artificielle à chaque couche de son stack — du silicium G300 à l'AgenticOps en passant par AI Defense — Cisco ne se contente pas de vendre du réseau : il vend la plateforme sur laquelle l'IA d'entreprise va tourner.

Pour les opérateurs et les DSI, le message est double. D'une part, l'infrastructure réseau traditionnelle n'est plus adaptée aux workloads AI — un refresh technologique majeur se profile. D'autre part, ce refresh est aussi une opportunité : celle de transformer le réseau d'un centre de coût en un véritable avantage compétitif.

Les annonces d'Amsterdam ne sont qu'un début. Avec une roadmap vers l'autonomie complète du réseau d'ici 2 à 3 ans, et des investissements massifs en IA ($3 milliards de revenus AI infrastructure attendus chez Cisco en 2026), le secteur est à l'aube de sa plus grande transformation depuis l'avènement d'Internet.

*La question n'est plus de savoir si votre réseau doit évoluer pour l'IA — c'est de savoir à quelle vitesse.*
