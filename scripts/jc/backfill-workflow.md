# Rattrapage des traductions — articles déjà publiés

Workflow de la routine `blog-backfill`. Les articles publiés avant la mise en place du
multilingue n'existent qu'en français. Cette routine les rattrape **par petits lots**, en
commençant par ce qui compte : les articles `featured`, puis les plus récents.

Ce n'est pas un rattrapage exhaustif. 398 articles × 3 langues ne se justifient pas : on
veut une vitrine multilingue crédible, pas une traduction de l'intégralité des archives.

## STEP 0 — AMORÇAGE

Identique au workflow article : le service account arrive en base64.

```bash
RUN_LOG=/tmp/backfill-run-$(date +%Y-%m-%d-%H%M%S).log
echo "$RUN_LOG" > /tmp/current-backfill-log
printf '%s' "$FIREBASE_SERVICE_ACCOUNT_B64" | base64 -d > service-account.json
node -e "require('./service-account.json').project_id || process.exit(1)"
node -e "require.resolve('firebase-admin')" 2>/dev/null || npm install --no-save firebase-admin tsx
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 0] amorçage OK" >> "$RUN_LOG"
```

⛔ `service-account.json` est gitignored. Ne le commite jamais, ne l'affiche jamais.

## STEP 1 — SÉLECTION DU LOT

```bash
NODE_PATH=./node_modules npx tsx scripts/jc/translate-backfill.ts list 2
```

Le script écrit le contenu français de chaque article dans `/tmp/backfill/<slug>.fr.md` et
affiche, pour chacun : le slug, le titre, les langues manquantes et les chemins cibles.

**Deux articles par run**, soit jusqu'à 6 traductions. C'est le bon compromis : au-delà, le
run s'allonge et la fenêtre de contexte se charge inutilement.

S'il n'y a rien à rattraper, logue-le et va directement au rapport final.

## STEP 2 — TRADUCTIONS

Pour chaque article du lot, pour chaque langue manquante, invoke le subagent `translator`
**séquentiellement** — un seul Task en vol à la fois :

> « Traduis `/tmp/backfill/<slug>.fr.md` en `<en|es|de>`. Écris le résultat dans
> `/tmp/backfill/<slug>.<lang>.md`. Rends les quatre lignes TITLE / EXCERPT / TAGS / WORDS. »

Note bien le `TITLE` et l'`EXCERPT` rendus : ils sont obligatoires à l'étape suivante.

Contrôle après chaque traduction, avant de l'appliquer :

```bash
F=/tmp/backfill/<slug>.<lang>.md
echo "  $(wc -w < $F) mots, $(grep -c '\$' $F) dollars, $(grep -c '^# ' $F) H1, $(grep -c '!\[' $F) images"
```

Attendu : **0 `$`**, **0 `# `**, autant d'images que le français. Un `$` résiduel se corrige
sans relancer l'agent :

```bash
sed -i -E 's/Md\$/Md USD/g; s/([0-9]+) M\$/\1 M USD/g; s/\$([0-9]+)([BM])/\1 \2 USD/g' "$F"
```

## STEP 3 — ÉCRITURE

Une langue à la fois, seulement après son contrôle :

```bash
NODE_PATH=./node_modules npx tsx scripts/jc/translate-backfill.ts apply \
  "<slug>" "<lang>" "/tmp/backfill/<slug>.<lang>.md" "<TITLE rendu>" "<EXCERPT rendu>"
```

Le script refuse d'écrire une traduction dont le volume s'écarte de plus de 60 % du
français : c'est le garde-fou contre une sortie tronquée. S'il refuse, **ne contourne pas** —
relance le `translator` une fois sur cette langue, et si ça recommence, passe à la suivante
en le signalant dans le rapport.

`availableLocales` est recalculé par le script, tu n'as rien à faire.

## STEP 4 — VÉRIFICATION (obligatoire avant le rapport)

Ne rédige **jamais** le rapport sur la foi de ce que tu crois avoir fait. Redemande l'état
réel à Firestore :

```bash
NODE_PATH=./node_modules npx tsx scripts/jc/translate-backfill.ts list 1
```

- S'il te ressort **le même article** que celui que tu viens de traiter, c'est qu'il lui
  manque encore au moins une langue. **Retourne au STEP 2** pour cette langue. C'est le cas
  le plus fréquent : la dernière langue d'un lot saute quand le tour se termine trop tôt.
- S'il ressort un **autre article**, ton lot est terminé : passe au rapport.
- S'il ne ressort **rien**, il n'y a plus rien à rattraper : passe au rapport.

Au maximum **deux** retours au STEP 2. Au-delà, rapporte l'échec plutôt que de boucler.

## STEP 5 — RAPPORT FINAL

Aucun commit, aucun push : ce workflow n'écrit que dans Firestore, jamais dans le repo.
Ton message final de session est le rapport. Format :

```
🌍 Rattrapage traductions — <N> articles, <M> traductions écrites

<slug 1> — en ✓ / es ✓ / de ✓
<slug 2> — en ✓ / es ✗ (volume refusé) / de ✓

Reste à rattraper : <nombre> articles
🏖️
```

Termine par les lignes du `$RUN_LOG`, pour que le log survive à la destruction de la VM.

## Règles d'or

- ⚠️ **Ne rends jamais la main avant le rapport final.** Dans une routine, terminer ton tour
  termine le run : la VM est détruite et tout subagent encore en vol est perdu avec elle.
  Un `Task` peut partir en arrière-plan — dans ce cas **attends son retour dans le même
  tour** au lieu de conclure par « j'attends son retour ». Tant qu'il reste une langue ou un
  article à traiter, tu continues. Le seul message qui termine ce run est le STEP 4.
- **Subagents séquentiels** : un seul Task en vol.
- **Ne jamais réécrire l'article français.** Ce workflow n'ajoute que des traductions.
- **Ne jamais commiter quoi que ce soit** — pas de `git add`, pas de `git push`.
- **Ne pas forcer une traduction refusée** par le garde-fou de volume.
- Une langue qui échoue n'interrompt pas le lot : on la signale et on continue.
