## Introduction : La fin d'une ère

WPA2 a tenu quinze ans. Respectable pour un protocole de sécurité. Mais en octobre 2017, Mathy Vanhoef a publié KRACK — et soudain, chaque appareil Wi-Fi de la planète était vulnérable. La réponse de la Wi-Fi Alliance : WPA3, annoncé en juin 2018, obligatoire depuis juillet 2020 pour toute certification.

Ce n'est pas un patch. C'est une refonte architecturale. Voici ce qui change vraiment.

## SAE : la mort des attaques par dictionnaire

Le talon d'Achille de WPA2-Personal ? Le 4-way handshake. Un attaquant capture l'échange, rentre chez lui, et lance une attaque par dictionnaire offline. Avec une bonne carte graphique et un mot de passe faible, c'est plié en quelques heures.

WPA3 remplace ce mécanisme par **SAE** (Simultaneous Authentication of Equals), basé sur le protocole Dragonfly. La différence fondamentale : chaque tentative de mot de passe nécessite une interaction avec le point d'accès.

| Aspect | WPA2-PSK | WPA3-SAE |
|--------|----------|----------|
| Type d'échange | 4-way handshake passif | Handshake interactif |
| Attaque offline | Possible | Impossible |
| Forward Secrecy | Non | Oui |
| Mot de passe faible | Vulnérable | Protégé |

### Forward Secrecy : une clé par session

Avec WPA2, si quelqu'un récupère votre PSK, il peut déchiffrer tout le trafic passé qu'il aurait capturé. SAE génère des clés de session éphémères via cryptographie à courbe elliptique. Compromission d'une session ≠ compromission de l'historique.

## PMF : fini les deauth attacks

Les trames de gestion Wi-Fi (association, désauthentification, désassociation) circulaient en clair avec WPA2. Résultat : n'importe qui avec un dongle à 20€ pouvait éjecter tous les clients d'un réseau.

WPA3 rend **PMF** (Protected Management Frames, IEEE 802.11w) obligatoire. Ces trames sont désormais chiffrées et authentifiées. Les attaques de déauthentification forcée ? Terminées.

C'est particulièrement critique pour :
- Les environnements industriels où une déconnexion = arrêt de production
- Les hôpitaux où les équipements médicaux dépendent du Wi-Fi
- Les déploiements IoT massifs

## WPA3-Enterprise 192-bit : le mode paranoïa

Pour les environnements sensibles (gouvernement, finance, santé), WPA3-Enterprise propose un mode 192 bits aligné sur la suite CNSA (Commercial National Security Algorithm) de la NSA.

| Composant | Algorithme |
|-----------|------------|
| Chiffrement | AES-256-GCM |
| Intégrité | SHA-384 HMAC |
| Échange de clés | ECDH/ECDSA P-384 |
| Authentification | EAP-TLS 1.3 |

Ce mode est optionnel — le WPA3-Enterprise standard utilise AES-128. Mais pour qui manipule des données classifiées ou des transactions financières, c'est la baseline.

## OWE : les réseaux ouverts ne sont plus nus

Les hotspots publics (hôtels, aéroports, cafés) ont toujours été un cauchemar sécurité. Trafic en clair, sniffing trivial, man-in-the-middle à portée de main.

**Wi-Fi Enhanced Open** (basé sur OWE — Opportunistic Wireless Encryption) change la donne. Le principe : un échange Diffie-Hellman à l'association génère une clé unique par client. Pas de mot de passe, mais chiffrement systématique.

### Limites importantes

OWE ne fait pas de miracles :
- **Pas d'authentification** : vulnérable aux evil twin attacks
- **Pas de protection contre les rogue AP** : un attaquant peut toujours monter un faux hotspot
- **Complément, pas remplacement** : HTTPS reste indispensable

C'est mieux que rien. Beaucoup mieux. Mais ce n'est pas un VPN.

## KRACK : l'exploit qui a tout changé

Retour sur la vulnérabilité qui a précipité WPA3. KRACK (Key Reinstallation Attacks) exploitait une faille dans le 4-way handshake de WPA2 : en rejouant certains messages, un attaquant forçait la réinstallation d'une clé déjà utilisée, réinitialisant le nonce.

Sur Android 6.0+, c'était catastrophique : le système installait une clé composée uniquement de zéros. Déchiffrement total du trafic.

SAE élimine cette classe de vulnérabilités par conception. Plus de 4-way handshake, plus de réinstallation de clé possible.

## Dragonblood : WPA3 n'est pas parfait

Six mois après le lancement, les mêmes chercheurs (Vanhoef et Ronen) ont publié Dragonblood. Mauvaise nouvelle : WPA3 aussi a des failles.

### Attaques par canal auxiliaire

Le handshake Dragonfly fuit des informations via :
- **Timing** : le temps de réponse révèle des bits du mot de passe
- **Cache** : les patterns d'accès mémoire sont observables

Coût estimé pour casser un mot de passe via ces side-channels : environ 1$ en instances Amazon EC2.

### Downgrade attacks

En mode transition (WPA2/WPA3), un attaquant peut forcer un client vers WPA2 et capturer le handshake vulnérable. La rétrocompatibilité a un prix.

### Déni de service

16 trames forgées par seconde suffisent à saturer le CPU d'un point d'accès. Le mécanisme anti-DoS (cookie exchange) est contournable.

### Mitigations

La Wi-Fi Alliance a publié des correctifs. Microsoft recommande de n'accepter que le groupe cryptographique 19 et d'implémenter strictement l'algorithme hunting-and-pecking. Les mises à jour firmware sont critiques.

## Adoption 2025-2026 : où en est-on ?

### Chiffres clés

- **Juillet 2020** : WPA3 obligatoire pour certification Wi-Fi CERTIFIED™
- **2026** : 1.1 milliard d'appareils Wi-Fi 7 prévus (tous WPA3 natifs)
- **2026** : 2.7 milliards d'appareils Wi-Fi 6/6E

### Ce qui accélère l'adoption

- Wi-Fi 6E et Wi-Fi 7 **requièrent** WPA3
- Réglementations enterprise (PCI-DSS 4.0, HIPAA)
- Fin de vie des équipements pre-2020

### Ce qui freine

- Parc IoT legacy (capteurs, caméras, équipements industriels)
- Mode transition nécessaire pendant plusieurs années
- Coût de mise à niveau infrastructure

Cisco, Aruba et Ruckus ont tous annoncé le support WPA3 via mise à jour firmware sur leurs gammes récentes. Le matériel enterprise est prêt. Le défi, c'est le legacy.

## Recommandations pour un déploiement Wifirst

### Court terme

1. **Activer WPA3-Transition** sur tous les SSID compatibles
2. **Forcer PMF** même sur les réseaux WPA2
3. **Déployer OWE** sur les réseaux guest/hotspot
4. **Mettre à jour les firmwares** — les correctifs Dragonblood sont critiques

### Moyen terme

1. **Inventorier le parc client** : identifier les devices WPA2-only
2. **Planifier la fin du mode transition** : horizon 2027-2028
3. **Évaluer WPA3-Enterprise 192-bit** pour les segments sensibles

### Ce qu'il ne faut pas faire

- Désactiver WPA2 brutalement (casse la compatibilité)
- Ignorer les mises à jour firmware (Dragonblood)
- Considérer OWE comme suffisant pour la sécurité guest

## Conclusion

WPA3 n'est pas une révolution marketing. C'est une réponse technique à des vulnérabilités réelles. SAE élimine les attaques par dictionnaire offline. PMF protège les trames de gestion. OWE chiffre enfin les réseaux ouverts.

Est-ce parfait ? Non. Dragonblood l'a prouvé. Mais c'est significativement plus robuste que WPA2, et l'adoption est désormais inévitable avec Wi-Fi 6E/7.

Pour les opérateurs comme Wifirst, la question n'est plus "faut-il migrer ?" mais "comment migrer sans casser le legacy ?". La réponse : mode transition, PMF forcé, et patience.

Le Wi-Fi sécurisé par défaut, c'est enfin possible. Il était temps.
