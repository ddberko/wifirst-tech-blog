#!/bin/bash
# gemini-source.sh — Sourcing actu via Gemini 2.5 Flash + Google Search Grounding
#
# Usage :
#   gemini-source.sh tech    # actualité réseau / cybersec / infra B2B
#   gemini-source.sh ai      # actualité IA (modèles, agents, papers, régulation)
#
# Output (stdout) : JSON structuré avec candidats sourcés via Google Search
#
# Requis : GEMINI_API_KEY dans l'env (variable d'environnement cloud)

set -euo pipefail

TYPE="${1:-tech}"
if [ "$TYPE" != "tech" ] && [ "$TYPE" != "ai" ]; then
  echo "Usage: $0 <tech|ai>" >&2
  exit 2
fi

# GEMINI_API_KEY vient des variables d'environnement cloud
[ -z "${GEMINI_API_KEY:-}" ] && { echo "GEMINI_API_KEY manquante" >&2; exit 1; }

TODAY=$(date '+%A %d %B %Y' | tr '[:upper:]' '[:lower:]')

# Prompt template via fichier externe pour éviter les pièges bash heredoc avec ()
TMPL="$(dirname "$0")/gemini-source-${TYPE}.tmpl.md"
[ -f "$TMPL" ] || { echo "Template manquant : $TMPL" >&2; exit 1; }

PROMPT=$(cat "$TMPL")
PROMPT="${PROMPT//__TODAY__/$TODAY}"
PROMPT="${PROMPT//__TYPE__/$TYPE}"

PAYLOAD=$(jq -n --arg p "$PROMPT" '{
  contents: [{parts: [{text: $p}]}],
  tools: [{google_search: {}}],
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 8192
  }
}')

RESP=$(curl -sS -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

CONTENT=$(echo "$RESP" | jq -r '.candidates[0].content.parts[0].text // empty')

if [ -z "$CONTENT" ]; then
  echo "ERREUR Gemini : pas de contenu retourné. Réponse brute :" >&2
  echo "$RESP" | jq '.' >&2 2>/dev/null || echo "$RESP" >&2
  exit 1
fi

# Nettoyer les ```json ... ``` wrappers éventuels
CLEAN=$(echo "$CONTENT" | sed -E 's/^[[:space:]]*```(json)?[[:space:]]*//; s/[[:space:]]*```[[:space:]]*$//')

# Tenter jq, sinon imprimer brut (le researcher Claude peut parser du JSON imparfait)
if echo "$CLEAN" | jq '.' >/dev/null 2>&1; then
  echo "$CLEAN" | jq '.'
else
  echo "# WARNING: JSON Gemini imparfait (jq parse failed), contenu brut ci-dessous —" >&2
  echo "# Le researcher doit l'interpréter (escape quotes manquants, etc.)" >&2
  echo "$CLEAN"
fi
