En janvier 2026, la Commission européenne a franchi un cap décisif : après des années de recommandations non contraignantes, Bruxelles prépare désormais une législation imposant le retrait des équipements Huawei et ZTE des réseaux 5G européens sous trois ans. Ce n'est plus une question de "si", mais de "quand". Pour les opérateurs réseau, cette accélération réglementaire transforme la souveraineté numérique d'un concept abstrait en impératif opérationnel.

## La dépendance européenne : un constat sans appel

![Dépendance géopolitique des réseaux européens](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/souverainete-dependance-geopolitique.png)

L'infrastructure télécoms européenne repose massivement sur des technologies non-européennes. Côté entreprise, le marché WLAN est dominé par Cisco, Aruba (HPE) et Juniper — tous américains. Côté mobile, Huawei et ZTE représentaient encore 60% des équipements 5G RAN en Allemagne fin 2022.

Cette dépendance pose un double problème. D'abord, la sécurité : les États-Unis et plusieurs pays européens considèrent les équipementiers chinois comme des risques pour la sécurité nationale, citant des lois chinoises obligeant les entreprises à coopérer avec les services de renseignement. Ensuite, la résilience : la crise des semi-conducteurs de 2021-2023 a démontré la fragilité des chaînes d'approvisionnement mondialisées.

Les réponses nationales divergent. La Suède a opté pour un ban total de Huawei et ZTE dès 2020. L'Allemagne, après des années d'hésitation, a signé en juillet 2024 un accord imposant le retrait des équipements chinois des cœurs de réseau 5G d'ici fin 2026. Deutsche Telekom, Vodafone Germany et Telefónica Deutschland sont directement concernés — un chantier estimé en milliards d'euros.

La France a choisi une voie médiane avec sa loi "anti-Huawei" de 2020, administrée par l'ANSSI. Entre juillet 2023 et 2024, l'agence a accordé 209 autorisations pour des équipements Huawei, contre seulement 10 refus. Ces autorisations sont temporaires (3 à 8 ans), créant une transition progressive mais certaine. Orange, notamment, fait face à un défi majeur sur son réseau fixe où de nombreux NRO sont équipés en Huawei.

## Les champions européens se positionnent

Face à ce vide stratégique, l'Europe dispose-t-elle d'alternatives crédibles ? La réponse est nuancée.

Sur le segment télécom mobile, Nokia (Finlande) et Ericsson (Suède) sont les deux acteurs européens de poids mondial. Nokia est devenu le partenaire privilégié pour le remplacement de Huawei en Allemagne, avec un projet ambitieux de 30 000 sites en Open RAN prévu pour 2026. Ericsson a sécurisé des contrats majeurs, notamment avec OTE en Grèce qui a choisi le suédois plutôt que Huawei dès 2020.

Sur le segment cybersécurité, la France dispose d'acteurs reconnus. Stormshield, filiale d'Airbus, propose des firewalls nouvelle génération 100% développés en France, avec des certifications ANSSI, OTAN et même la classification TEMPEST pour le secteur Défense obtenue en décembre 2025. Eviden (ex-Atos) a obtenu la qualification Standard ANSSI pour sa solution Trustway IP Protect en avril 2025. Ces solutions permettent de sécuriser les flux réseau avec des équipements souverains.

Le cloud souverain progresse également. S3NS, joint-venture entre Thales et Google, a décroché la qualification SecNumCloud 3.2 en décembre 2025. Ce modèle hybride — technologie américaine, opération française, immunité au CLOUD Act — représente un compromis pragmatique pour les organisations soumises à des exigences de souveraineté.

Cependant, un angle mort subsiste : le marché WiFi enterprise. Aucun acteur européen majeur ne propose aujourd'hui d'alternative crédible à Cisco, Aruba ou Meraki. Nokia et Ericsson se positionnent sur le carrier WiFi, pas sur l'infrastructure indoor d'entreprise. C'est un segment où la dépendance américaine reste quasi-totale.

## Open RAN : désagrégation et autonomie

![Architecture Open RAN et désagrégation](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/souverainete-open-ran.png)

L'Open RAN représente peut-être le levier le plus prometteur pour réduire la dépendance européenne. Cette approche, standardisée par l'O-RAN Alliance depuis 2018, repose sur trois principes : interfaces ouvertes entre composants, séparation hardware/software, et possibilité de mixer des équipements de différents fournisseurs.

Deutsche Telekom mène le plus grand déploiement Open RAN d'Europe. Après un pilote réussi avec Nokia sur 3 000 sites, l'opérateur allemand prépare un appel d'offres pour 30 000 sites en 2026. L'approche est radicale : DT développe son propre software pour la configuration des antennes et du transport, réduisant sa dépendance aux couches logicielles propriétaires.

Orange adopte une stratégie plus prudente mais déterminée. L'opérateur français impose désormais des interfaces Open RAN dans ses achats depuis 2025, avec l'objectif d'atteindre un TCO compétitif à l'échelle européenne d'ici 2030. Un field trial a été complété avec succès en juillet 2025.

Les avantages pour la souveraineté sont réels. Plus de lock-in vendor unique, diversification de la supply chain, opportunité pour des acteurs locaux sur certaines briques logicielles, et visibilité accrue sur le code grâce à la virtualisation. Mais les défis restent importants : maturité limitée des déploiements commerciaux, complexité d'intégration multi-vendor, et paradoxalement, une dépendance subsistante aux composants vRAN souvent américains.

## NIS2 et Cyber Resilience Act : le nouveau cadre réglementaire

![Réglementations européennes NIS2 et Cyber Resilience Act](https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/images/images/souverainete-regulation-nis2.png)

Au-delà des bans d'équipementiers, c'est tout le cadre réglementaire européen qui se durcit. Deux textes majeurs redéfinissent les règles du jeu.

La directive NIS2, entrée en vigueur le 17 octobre 2024, élargit considérablement le périmètre des organisations concernées. Les opérateurs de réseaux managés pour entreprises tombent désormais dans le scope. Les exigences sont concrètes : gestion des risques cyber obligatoire, évaluation de la sécurité des fournisseurs, notification d'incidents sous 24 à 72 heures, et responsabilité personnelle du management avec des amendes pouvant atteindre 10 millions d'euros ou 2% du chiffre d'affaires mondial.

L'obligation d'évaluer la sécurité de la supply chain est particulièrement structurante. Un opérateur B2B devra documenter ses choix technologiques, cartographier sa chaîne d'approvisionnement, et intégrer des critères de sécurité dans ses appels d'offres. La conformité NIS2 impose de fait une réflexion sur l'origine des équipements déployés.

Le Cyber Resilience Act (CRA), règlement européen entré en vigueur en décembre 2024, va plus loin encore. Il impose des exigences de cybersécurité "by design" à tout produit comportant des éléments numériques : routeurs, switches, points d'accès WiFi, firewalls, contrôleurs industriels. Les fabricants devront assurer des mises à jour de sécurité pendant une durée minimale de 5 ans et signaler les vulnérabilités découvertes.

Les équipements réseau les plus critiques (routeurs, firewalls) tombent dans la catégorie "Classe II" nécessitant un audit tiers obligatoire. L'application complète est prévue pour décembre 2027, mais les obligations de reporting débutent dès septembre 2026. Les opérateurs qui déploient ces équipements chez leurs clients doivent anticiper ces changements.

En France, les certifications ANSSI prennent une importance croissante. La CSPN (Certification de Sécurité de Premier Niveau) offre une évaluation rapide en 2-3 mois. La Qualification ANSSI, plus exigeante, devient obligatoire pour certains usages auprès des OIV et des administrations. Ces certifications, historiquement perçues comme un surcoût, deviennent un différenciateur commercial sur les marchés réglementés.

## L'équation économique pour les opérateurs B2B

Pour un opérateur WiFi B2B comme Wifirst, la souveraineté pose une équation économique complexe. Le surcoût est réel : les équipements européens coûtent 20 à 30% plus cher que les alternatives chinoises. Le remplacement de Huawei en Allemagne mobilise des subventions publiques de plusieurs milliards. Une certification ANSSI représente un investissement de 50 000 à 150 000 euros par produit.

Mais l'analyse coût-bénéfice doit intégrer d'autres paramètres. Le risque réglementaire d'abord : déployer aujourd'hui des équipements qui pourraient être bannis demain n'est pas gratuit. L'accès aux marchés ensuite : les administrations, les OIV et les OSE exigent de plus en plus des garanties sur l'origine des équipements. La différenciation commerciale enfin : un positionnement "souverain" peut justifier un premium tarifaire auprès de clients sensibles.

Le tableau de décision se clarifie quand on croise les critères. Les équipementiers américains offrent les meilleures performances et fonctionnalités, avec un risque réglementaire faible mais une exposition au CLOUD Act. Les équipementiers européens garantissent la souveraineté avec un excellent support local, mais à un coût supérieur et avec des fonctionnalités parfois en retrait. Les équipementiers chinois restent compétitifs sur le prix, mais le risque réglementaire est désormais élevé et croissant.

Pour les opérateurs B2B ciblant des clients réglementés (santé, finance, secteur public), l'investissement souverain prend tout son sens. Pour les marchés moins contraints, une approche hybride — infrastructure souveraine pour le cœur de réseau, équipements américains pour le edge — peut offrir un compromis acceptable.

## Conclusion : transformer la contrainte en avantage

La souveraineté des équipements réseau n'est plus un débat théorique. Les bans se concrétisent, les réglementations se durcissent, les certifications deviennent des prérequis commerciaux. Pour les opérateurs B2B, cette transformation est à la fois une contrainte et une opportunité.

La contrainte est claire : auditer les équipements déployés, documenter la supply chain, anticiper les évolutions réglementaires, investir dans la conformité. L'opportunité l'est tout autant : accompagner les clients sur ces sujets complexes, proposer des solutions certifiées, se différencier par l'expertise et la confiance.

Les choix technologiques d'aujourd'hui conditionnent la conformité de demain. L'expertise française en cybersécurité — ANSSI, Stormshield, Eviden, Thales — constitue un atout que peu de pays européens peuvent revendiquer. Pour les opérateurs qui sauront l'exploiter, la souveraineté peut devenir un véritable avantage compétitif.

---

*Cet article a été rédigé en février 2026. Les réglementations citées évoluent rapidement — consultez les sources officielles pour les informations les plus récentes.*

## Références

- Commission européenne, "ICT Supply Chain Toolbox", janvier 2026
- Bloomberg, "EU Eyes Banning Huawei From Mobile Networks", novembre 2025
- ANSSI, Guide des certifications et qualifications, 2025
- O-RAN Alliance, Specifications 2025
- Deutsche Telekom, "Open RAN Deployment Strategy", 2025-2026
