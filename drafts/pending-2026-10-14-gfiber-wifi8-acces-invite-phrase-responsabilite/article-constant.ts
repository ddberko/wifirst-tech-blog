const ARTICLE = {
  "slug": "gfiber-wifi8-acces-invite-phrase-responsabilite",
  "title": "gFiber Wi-Fi 8 : l'accès invité devient une phrase, la responsabilité reste un contrat",
  "excerpt": "gFiber, Qualcomm et Gemtek ont montré une box Wi-Fi 8 qui ouvre un accès invité sur une simple phrase. L'IA locale déplace la décision, pas la responsabilité : cinq conditions pour l'accepter sur un réseau exploité.",
  "category": "Réseaux",
  "tags": [
    "Wi-Fi 8",
    "gFiber",
    "Qualcomm",
    "Edge AI",
    "Accès invité",
    "Gouvernance IA",
    "Cyber Resilience Act",
    "Hospitality"
  ],
  "readTime": 17,
  "coverImage": "https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers/gfiber-wifi8-acces-invite-phrase-responsabilite-cover.png",
  "contentFile": "/tmp/article-draft.md",
  "translations": {
    "en": {
      "title": "gFiber Wi-Fi 8: guest access becomes a sentence, liability stays a contract",
      "excerpt": "gFiber, Qualcomm and Gemtek showed a Wi-Fi 8 gateway that opens guest access from a single spoken sentence. Local AI moves the decision, not the responsibility: five conditions for accepting it on an operated network.",
      "tags": [
        "Wi-Fi 8",
        "gFiber",
        "Qualcomm",
        "Edge AI",
        "Guest access",
        "AI governance",
        "Cyber Resilience Act",
        "Hospitality"
      ],
      "contentFile": "/tmp/article-en.md"
    },
    "es": {
      "title": "gFiber Wi-Fi 8: el acceso de invitados se pide con una frase, la responsabilidad sigue estando en el contrato",
      "excerpt": "gFiber, Qualcomm y Gemtek han mostrado un router Wi-Fi 8 que abre un acceso de invitados con una simple frase. La IA local desplaza la decisión, no la responsabilidad: cinco condiciones para aceptarla en una red en explotación.",
      "tags": [
        "Wi-Fi 8",
        "gFiber",
        "Qualcomm",
        "Edge AI",
        "Acceso de invitados",
        "Gobernanza de la IA",
        "Cyber Resilience Act",
        "Hostelería"
      ],
      "contentFile": "/tmp/article-es.md"
    },
    "de": {
      "title": "gFiber Wi-Fi 8: Der Gastzugang wird zum Satz, die Verantwortung bleibt Vertragssache",
      "excerpt": "gFiber, Qualcomm und Gemtek haben eine Wi-Fi-8-Box gezeigt, die auf einen einzigen Satz hin einen Gastzugang öffnet. Lokale KI verschiebt die Entscheidung, nicht die Verantwortung: fünf Bedingungen, unter denen sie in einem produktiv betriebenen Netz akzeptabel ist.",
      "tags": [
        "Wi-Fi 8",
        "gFiber",
        "Qualcomm",
        "Edge AI",
        "Gastzugang",
        "KI-Governance",
        "Cyber Resilience Act",
        "Hospitality"
      ],
      "contentFile": "/tmp/article-de.md"
    }
  },
  "featured": true,
  "skipNewsletter": false,
  "analysis": {
    "technicalScore": 10,
    "editorialScore": 10,
    "geminiFactCheckPassed": true,
    "geminiModelVersion": "gemini-3.8-flash",
    "geminiComment": "L'analyse technique est rigoureuse, cohérente et parfaitement documentée sur les aspects réseau, IA locale et réglementaires (notamment le calendrier CRA et le standard 802.11bn). Le propos éditorial pose avec justesse les limites opérationnelles et contractuelles entre commande vocale usager et politique d'accès opérateur.",
    "finalVerdict": "PASS avec corrections",
    "verdictNote": "PASS avec corrections au premier passage, zéro hallucination, zéro retry. Périmètre des chiffres respecté : le 20G est le débit de l'abonnement fibre (WAN, 25G-PON), pas un débit Wi-Fi ; les 33 Gbit/s sont le PHY crête théorique de la plateforme Dragonwing NPro A8 Elite et l'article dit explicitement qu'ils ne décrivent pas la box ; aucun TOPS ni débit mesuré n'est avancé faute de fiche technique. L'écart quatre bandes (box, Light Reading) / cinq bandes (plateforme, CNX) est signalé. Dragonwing SAM est présenté comme un produit distinct et un simple indice du modèle de gouvernance Qualcomm : aucune source ne l'associe à la box. Le rôle de fabricant de Gemtek reste non confirmé et rédigé comme tel. La transposition hospitality (hôtellerie, résidences étudiantes) est balisée comme analyse de l'auteur, le produit étant résidentiel. Trois corrections appliquées : l'annonce est datée du 12/10 et rattachée au salon Network X (13-15/10) sans affirmer que la démo s'y est tenue le 12 ; le délai d'un mois du rapport final CRA court après la notification d'incident grave ; la plateforme unique transmet au CSIRT coordinateur et à l'ENISA. CRA re-vérifié multi-sources (Commission européenne, McCann FitzGerald, Mondaq, CSA) : obligations de notification applicables depuis le 11/09/2026, reste du règlement au 11/12/2027. Wi-Fi 8 : 802.11bn en brouillon, certification « vers janvier 2028 » (Wi-Fi NOW ; Evezone évoque fin 2027). Conservation des logs d'accès invité : aucune durée chiffrée, renvoi au juriste. URL du communiqué Qualcomm vérifiée HTTP 200 ; article du 16/09 cité (baie-technique-noeud-inference-npu-wifi8) confirmé en base. Aucune citation guillemetée : propos des industriels paraphrasés.",
    "hallucinations": [],
    "corrections": [
      "C'est la démonstration que gFiber (l'ex-Google Fiber), Qualcomm et Gemtek ont donnée le 12 octobre 2026 au salon Network X, autour d'une future passerelle → C'est la démonstration que gFiber (l'ex-Google Fiber), Qualcomm et Gemtek ont annoncée le 12 octobre 2026, à l'occasion du salon Network X, autour d'une future passerelle",
      "rapport final 14 jours après la disponibilité d'un correctif, ou un mois pour un incident grave. → rapport final 14 jours après la disponibilité d'un correctif pour une vulnérabilité exploitée, ou un mois après la notification pour un incident grave.",
      "via la plateforme unique de l'ENISA, l'agence européenne de cybersécurité [7] → via la plateforme unique de notification, qui transmet au CSIRT national coordinateur et à l'ENISA, l'agence européenne de cybersécurité [7]"
    ],
    "residualHallucinations": [],
    "validatedClaims": [
      "gFiber, Qualcomm, Gemtek, gFiber Wi-Fi 8 Premium Gateway, annonce 12/10/2026 (Light Reading [1], recoupé WebSearch, 2026-10-12)",
      "Plateforme NPro A8 Elite, Wi-Fi 8 quad-band, NPU Hexagon, CPU penta-core, écran tactile (Light Reading [1], communiqué Qualcomm [2] via WebSearch, 2026-10-12)",
      "Trois démos (contrôle parental, invités voix + QR, domotique/diagnostic), IA locale (Light Reading [1], 2026-10-12)",
      "20G = abonnement symétrique WAN, 25G-PON, pas un débit Wi-Fi (Light Reading [1] ; périmètre conforme au brief, 2026-10-12)",
      "33 Gbit/s = PHY crête théorique de la plateforme, non associé à la box ; quatre vs cinq bandes (CNX Software [5], 2026-03-03)",
      "Calendrier gFiber : abonnés 20G existants d'abord, migration après certification ; pas de prix ni date (Light Reading [1], 2026-10-12)",
      "Pas d'affirmation que la box embarque SAM ; SAM = agent télémétrie, politiques cloud vers passerelle, RDK-B/prplOS/OpenWrt, natif ou conteneur (Qualcomm SAM brief [3], 2026-10)",
      "CRA : notification applicable depuis le 11/09/2026 ; 24 h / 72 h / 14 jours après correctif / 1 mois incident grave ; plateforme unique ; reste du règlement au 11/12/2027 (Commission européenne [7], recoupé McCann FitzGerald, Mondaq, CSA via WebSearch, 2026-09-11)",
      "802.11bn en brouillon, certification Wi-Fi Alliance vers janvier 2028 (Wi-Fi NOW / TechSpot [8] (Evezone : fin 2027, d'où le 'vers'), 2026)",
      "Gemtek : stratégie Wi-Fi 8 avec passerelles IA au MWC 2026 ; fabrication non confirmée (rédigé comme tel) (EverythingRF [9], Gemtek MWC release, 2026-02/03)",
      "Renvois blog : disjoncteur NOC, agents/traces, RFC 10065 (12/10), Nokia/Inseego FastMile (Dépôt /drafts, 2026-09-26 à 2026-10-12)",
      "Conservation des données de connexion hôtelier : formulée avec réserve, sans durée chiffrée, à revalider juridiquement (L'Hôtellerie Restauration [10], brief, 2006-2018)"
    ]
  }
};
