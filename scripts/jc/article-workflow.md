# Workflow article quotidien — Wifirst Tech Blog (exécution cloud)

Version cloud du workflow historiquement porté par `~/assistant/scripts/article-prompt.tmpl.md`
sur le Mac mini. La routine Claude Code cloud lit ce fichier et déroule les 8 étapes.

**Le type d'article (`tech` ou `ai`) est fourni par la routine appelante.** Partout où ce
document écrit `<TYPE>`, substitue la valeur reçue.

- `tech` → article réseau / cybersec / infra B2B opérateur
- `ai` → article IA généraliste ton « CTO visionnaire »

Tu disposes de 3 subagents déclarés dans `.claude/agents/` du repo, repris automatiquement :

- **`researcher`** — 2 modes : sourcing (Gemini + Google Search) puis brief approfondi
- **`writer`** — rédaction 1800+ mots ton CTO visionnaire à partir du brief
- **`fact-checker`** — vérification + verdict (PASS / PASS avec corrections / FAIL)

## Environnement d'exécution

Tu tournes dans une VM cloud, pas sur le Mac mini. Conséquences :

- Le repo `wifirst-tech-blog` est cloné dans ton répertoire de travail courant.
- Le repo `Claude-assistant` **peut** être cloné à côté (STEP 7). Localise-le une fois pour
  toutes, sans supposer qu'il existe :
  `ASSISTANT=$(find .. -maxdepth 2 -type d -name "Claude-assistant" 2>/dev/null | head -1)`
  S'il est vide, le workflow fonctionne quand même : seules les étapes 1 (fallback topics)
  et 7b (mémoire) le consomment, et toutes deux savent s'en passer.
- Variables d'environnement disponibles : `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_B64`.
- `uv`, `node`, `npx`, `jq`, `git`, `gh` sont préinstallés.
- Réseau : seuls les domaines de l'allowlist par défaut sont joignables. `*.googleapis.com`
  en fait partie, donc Gemini, Firestore et Cloud Storage passent. **Pas de Discord.**
- Aucun accès à `~/assistant`, `~/.openclaw` ni au disque de David.

## STEP 0/8 — AMORÇAGE

```bash
RUN_LOG=/tmp/blog-run-$(date +%Y-%m-%d-%H%M%S).log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP 0/8] STARTED — amorçage cloud" >> "$RUN_LOG"

# Le service account est injecté en base64 ; publish-article.ts attend ../service-account.json
printf '%s' "$FIREBASE_SERVICE_ACCOUNT_B64" | base64 -d > service-account.json
node -e "require('./service-account.json').project_id || process.exit(1)" \
  && echo "  - service-account.json écrit et valide" >> "$RUN_LOG"
```

⛔ `service-account.json` est dans le `.gitignore` du repo. **Ne le commite jamais**, ne
l'affiche jamais dans ton rapport, ne le recopie pas dans un autre fichier.

Vérifie les dépendances node du chemin de publication (le setup script de l'environnement
les installe déjà ; ceci n'est qu'un filet) :

```bash
node -e "require.resolve('firebase-admin')" 2>/dev/null || npm install --no-save firebase-admin @google-cloud/storage tsx
```

Logue `[STEP 0/8] DONE`.

## 🔴 Log step-by-step (OBLIGATOIRE)

Tu écris dans `$RUN_LOG` au DÉBUT et à la FIN de chaque étape :

```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP X/8] STARTED — <titre étape>" >> "$RUN_LOG"
# ... travail ...
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STEP X/8] DONE — <résumé 1 ligne avec chiffres clés>" >> "$RUN_LOG"
```

Sous-bullets `  - ...` pour tout ce qui compte : sujet retenu, scores, URLs, slugs, verdicts.
David relit ce log. **Si tu ne logges pas, tu rates ta mission.**

## STEP 1/8 — IDÉATION (sourcing actu via Gemini + Google Search)

Invoke le subagent `researcher` en **mode sourcing avec type=<TYPE>** :

> « Mode sourcing type=<TYPE>. Procédure standard : invoke `bash scripts/jc/gemini-source.sh <TYPE>`
> pour récupérer les candidats actu < 48h via Gemini + Google Search. Puis anti-redondance vs
> 60 derniers articles, re-scoring si besoin, recommandation finale. »

Attends sa réponse. **Choisis le candidat recommandé**, sauf raison forte de prendre un autre.

Logue : sujet retenu, score, source primaire, raison du choix.

**Fallback** : si aucun candidat n'est suffisamment frais (tous < 18/30 OU tous rejetés pour
redondance), prends la première ligne de `Pile en cours` dans `$ASSISTANT/workspace/topics.md`.
Logue le fallback explicitement. Si `$ASSISTANT` est vide, prends le candidat le moins mauvais
du sourcing plutôt que d'échouer, et signale-le dans le rapport final.

## STEP 2/8 — BRIEF APPROFONDI

Invoke `researcher` en **mode brief** sur le sujet retenu :

> « Mode brief. Sujet : <sujet>. Produis le brief approfondi (5+ sources mixtes, angle B2B opérateur). »

Sauvegarde dans `/tmp/article-brief.md`. Logue : nombre de sources, thèse en 1 phrase.

## STEP 3/8 — RÉDACTION

Invoke `writer` :

> « Voici le brief :\n\n<contenu de /tmp/article-brief.md>\n\nRédige l'article 1800+ mots ton
> CTO visionnaire. Sauvegarde dans /tmp/article-draft.md. »

Vérifie `wc -w /tmp/article-draft.md ≥ 1800`. Sinon → log `[FAILED]`, STOP avec rapport d'échec.

**Garde anti-H1 (auto-correctif)** — la 1ère ligne non vide ne doit pas commencer par `# `
(le titre vient de la constante ARTICLE, pas du markdown) :

```bash
head -1 /tmp/article-draft.md | grep -q '^# ' && sed -i.bak '1{/^# /d;}' /tmp/article-draft.md
```

**Garde anti-`$` (auto-correctif, frontend KaTeX)** — le frontend rend les `$...$` comme du LaTeX :

```bash
sed -i.bak2 -E 's/Md\$/Md USD/g; s/([0-9]+) M\$/\1 M USD/g; s/\$([0-9]+)([BM])/\1 \2 USD/g' /tmp/article-draft.md
```

Compte les `$` restants (`grep -c '\$' /tmp/article-draft.md`). Si > 0, logue un warning avec
les lignes concernées, sans bloquer (peut être légitime dans une URL).

Récupère titre, slug, excerpt, category, tags du writer. Logue : titre, slug, word count, nb de Mermaid.

## STEP 4/8 — GÉNÉRATION D'IMAGES (1 cover + 3 inline)

⚠️ **La cover n'est PAS dans le markdown** — le frontend l'affiche via le champ `coverImage`.
Si tu trouves `![Cover](...)` dans le draft, retire-le :

```bash
awk '/!\[Cover\]\(/{skip_next=1; next} skip_next && /^\*[^*]*\*$/{skip_next=0; next} {skip_next=0; print}' \
  /tmp/article-draft.md > /tmp/article-clean.md && mv /tmp/article-clean.md /tmp/article-draft.md
```

Génération des 4 images (prompts dans le brief) :

```bash
uv run scripts/jc/generate_image.py --prompt "<prompt anglais du brief>" \
  --filename "/tmp/blog-<slug>-cover.png" --resolution 2K
```

Upload Firebase Storage (`public: true`) :

```bash
node -e "
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: 'service-account.json', projectId: 'wifirst-tech-blog' });
const bucket = storage.bucket('wifirst-tech-blog.firebasestorage.app');
bucket.upload('/tmp/blog-<slug>-cover.png', { destination: 'covers/<slug>-cover.png', public: true, metadata: { cacheControl: 'public, max-age=31536000' } }).then(([f]) => console.log('URL:', f.publicUrl()));
"
```

URLs : `https://storage.googleapis.com/wifirst-tech-blog.firebasestorage.app/covers/<slug>-cover.png`
ou `images/<slug>-inline-N.png`.

**Cover URL** : retiens-la pour la constante ARTICLE, ne la mets pas dans le markdown.
**Inline URLs** : remplace les 3 placeholders `IMAGE_INLINE_N_URL` dans le draft via `Edit`.

Si une génération échoue → retry 1 fois. Si re-échec → log `[FAILED]`, STOP.

Logue : URL cover + 3 URLs inlines.

## STEP 5/8 — FACT-CHECK (boucle correction → re-check, max 2 retries)

Invoke `fact-checker` :

> « Article dans /tmp/article-draft.md. Brief dans /tmp/article-brief.md. Procédure complète + verdict. »

Variables internes : `RETRY_COUNT=0`, `MAX_RETRIES=2`. Boucle :

- **PASS** → continue STEP 6.
- **PASS avec corrections** → applique chaque correction via `Edit`, logue
  `  - corrections PASS appliquées (N items)`, continue STEP 6.
- **FAIL** :
  - Lis `/tmp/fact-check-result.json`. Pour chaque hallucination `severity: BLOQUANT`, applique
    la correction en t'appuyant sur le champ `finding` (la réalité vérifiée par Gemini). Citation
    non vérifiable → la retirer ou la paraphraser sans guillemets. Chiffre faux → le bon chiffre
    + reformuler la phrase voisine si la rhétorique perd son sens. Attribution erronée → retirer
    ou remplacer par la vraie entité du `finding`.
  - Logue `  - retry N/2 : N corrections appliquées sur hallucinations bloquantes`.
  - Si `RETRY_COUNT < MAX_RETRIES` : incrémente, **relance le fact-checker** sur le draft corrigé
    (mention « Re-check après corrections retry N »), retourne en haut de la boucle.
  - Si `RETRY_COUNT == MAX_RETRIES` et verdict toujours FAIL → log `[BLOCKED]` avec les
    hallucinations résiduelles, **NE PUBLIE PAS**, STOP avec rapport d'échec.

Logue le récap : verdict initial → final, retries, scores Gemini, hallucinations corrigées vs résiduelles.

## STEP 6/8 — PUBLICATION

Édite UNIQUEMENT la constante `ARTICLE` dans `scripts/publish-article.ts` :

- `slug` : kebab-case du writer, max 60 chars
- `title`, `excerpt`, `category`, `tags` : du writer
- `readTime` : `Math.ceil(wc / 200)`
- `coverImage` : URL Firebase cover
- `contentFile` : `/tmp/article-draft.md`
- `featured` : `true`
- `skipNewsletter` : **`true` si TYPE=ai**, **`false` si TYPE=tech** (règle David, 2026-05-12)
- `analysis` : construit depuis `/tmp/fact-check-result.json`, au **schéma enrichi** suivant —
  la constante `ARTICLE` déjà commitée en montre un exemple complet, respecte-la champ pour champ :

  | Champ | Contenu |
  | --- | --- |
  | `technicalScore` | note technique /10 du fact-checker |
  | `editorialScore` | note éditoriale /10 |
  | `geminiFactCheckPassed` | booléen brut renvoyé par Gemini |
  | `geminiModelVersion` | modèle Gemini utilisé (ex. `gemini-3.8-flash`) |
  | `geminiComment` | commentaire brut de Gemini |
  | `finalVerdict` | `PASS` / `PASS avec corrections` / `FAIL` — ton verdict, qui prime sur Gemini |
  | `verdictNote` | justification détaillée : périmètre exact de chaque chiffre, re-vérifications, ce qui est balisé comme analyse d'auteur |
  | `hallucinations` | tableau des hallucinations détectées (vide si aucune) |
  | `corrections` | tableau des corrections appliquées |
  | `residualHallucinations` | tableau de ce qui reste non résolu après les retries |
  | `validatedClaims` | tableau des affirmations validées, une chaîne par affirmation avec sa source et sa date |

  ⚠️ Un `geminiFactCheckPassed: false` peut être un faux négatif dû au knowledge cutoff de
  Gemini. Dans ce cas, `finalVerdict` reste `PASS` si ton cross-check web indépendant confirme,
  et tu l'expliques dans `verdictNote`.

⛔ **NE JAMAIS** modifier la constante `AUTHOR` (David Berkowicz, pas Jean-Claude).

```bash
NODE_PATH=./node_modules npx tsx scripts/publish-article.ts
```

Si la publication échoue → log `[FAILED]` avec stderr, STOP.

Logue l'URL publique `https://wifirst-tech-blog.web.app/post?slug=<slug>`.

## STEP 7/8 — ARCHIVE (commits git, pas de disque local)

C'est ici que le cloud diffère le plus du Mac mini : l'archive passe par git.

**7a — draft dans ce repo**, sur `main` de préférence.

Tu tournes sur une branche `claude/<...>` créée pour ce run. Si tu y archives le draft,
il y reste : personne ne va le chercher, et une branche s'accumule à chaque run. Vise donc
`main`, avec repli sur ta branche si le push est refusé.

```bash
D=$(date +%Y-%m-%d); S=<slug>
cp /tmp/article-draft.md "drafts/$D-$S.md"
git add "drafts/$D-$S.md"
git commit -m "docs(blog): archive draft $S"

# Tentative sur main, en rebasant pour absorber un run concurrent
BRANCHE=$(git branch --show-current)
if git fetch origin main && git rebase origin/main && git push origin HEAD:main; then
  echo "draft archivé sur main"
else
  git push -u origin "$BRANCHE" && echo "push main refusé — draft archivé sur $BRANCHE"
fi
```

⚠️ Ne commite **que** ce fichier. `git add -A` embarquerait `service-account.json`,
les PNG générés et l'état mutable de `scripts/publish-article.ts`. Reste chirurgical.

⚠️ **Ne change pas l'identité git.** Laisse la configuration par défaut : Claude Code refuse
qu'une routine pousse sur une branche portant des commits d'un autre auteur. Un commit signé
d'un nom personnalisé sur `main` bloquerait tous les runs suivants.

⚠️ **N'archive pas la constante `ARTICLE`** de `scripts/publish-article.ts`. C'est un
brouillon réécrit à chaque run ; sa version commitée sur `main` ne sert que d'exemple de
schéma. Si un hook de fin de session réclame un arbre de travail propre, laisse-la modifiée
plutôt que de la pousser.

**7b — mémoire dans le repo `Claude-assistant`** (`$ASSISTANT`) :

⚠️ **Étape conditionnelle.** Si `$ASSISTANT` est vide — le repo n'est pas attaché à la
routine — **saute entièrement 7b**, logue `  - 7b sautée : repo Claude-assistant absent`
et signale-le dans le rapport final. Ne tente pas de cloner le repo toi-même, ne cherche
pas `~/assistant` (il n'existe pas dans la VM), et surtout ne considère pas le run en échec :
l'article est publié, c'est ce qui compte.

Append une ligne à `$ASSISTANT/workspace/memory.md` :

```
<DATE> - Article publié: <TITRE> [slug: <slug>, score tech: <X>/10, edito: <Y>/10]
```

Si le sujet vient du fallback `topics.md`, retire aussi la première ligne de « Pile en cours »
dans `$ASSISTANT/workspace/topics.md`. Si le sujet vient du sourcing actu, n'y touche pas.

Puis commit + push dans ce repo-là :

```bash
cd "$ASSISTANT" && git add workspace/memory.md workspace/topics.md && \
  git commit -m "chore(memory): article <slug>" && git push && cd -
```

Si un `git push` est rejeté, **ne bloque pas le run** : l'article est déjà publié, ce qui
compte. Logue l'échec du push et signale-le dans le rapport final.

Logue : chemin du draft commité + statut memory.md/topics.md.

## STEP 8/8 — RAPPORT FINAL

Il n'y a pas de webhook Discord dans la VM. Ton **message final de session** est le rapport :
David le lit sur claude.ai/code. Max 10 lignes :

```
📝 <Titre>
🔗 https://wifirst-tech-blog.web.app/post?slug=<slug>
📊 <N> mots, <N> images, <N> schémas Mermaid
✅ Fact-check : tech <X>/10, edito <Y>/10
🗂 Draft commité : drafts/<DATE>-<slug>.md
🧠 memory.md : <mis à jour | push échoué>
🏖️
```

Termine en collant les lignes `[STEP x/8] DONE` de `$RUN_LOG`, pour que le log structuré
survive à la destruction de la VM.

## Règles d'or

- **Logue à CHAQUE étape**, START et DONE, avec les chiffres clés.
- **Subagents séquentiels** : un seul Task en vol (researcher×2 → writer → fact-checker).
- **AUCUNE décision humaine intermédiaire** : la routine tourne sans supervision.
- **Fact-check : correction → re-check (max 2 retries)**. Un FAIL initial n'est jamais terminal.
- **Images publiques** (`public: true`) sur storage.googleapis.com, jamais `firebasestorage.app/...?alt=media`.
- **AUTHOR fixé** = David Berkowicz, jamais Jean-Claude.
- **Ne commite jamais `service-account.json`**, ne l'affiche jamais.
- **Sujets régulation** (Digital Networks Act, NIS2, DORA, AI Act, RGPD) → fact-checker en
  vigilance MAX. Un article « Digital Networks Act » a déjà été rejeté pour confabulation législative.

C'est parti. 🏖️
