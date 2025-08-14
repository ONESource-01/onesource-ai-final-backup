#!/usr/bin/env bash
set -euo pipefail

# ---------- CONFIG ----------
: "${PREVIEW_BASE:=https://ai-response-hub-3.preview.emergentagent.com}"
: "${PROD_BASE:=https://app.onesource-ai.com}"

# Test questions (add more as needed)
QUESTIONS=(
  "What fire compartment requirements apply to warehouses?"
  "What are the NCC requirements for swimming pool barriers?"
)

# Length gates
MIN_TECH=1000   # substantial technical content
MIN_MENTOR=80
MIN_STEPS=2

# ---------- HELPERS ----------
hr() { printf '%*s\n' "${COLUMNS:-80}" '' | tr ' ' -; }
fail() { echo -e "\n❌ $1"; exit 1; }
ok() { echo "✅ $1"; }

get_json() {
  local url="$1"
  curl -fsSL "$url" | jq .
}

post_chat() {
  local base="$1" q="$2"
  curl -fsSL -H "Content-Type: application/json" \
    -X POST "$base/api/chat/ask" \
    -d "{\"question\":\"$q\",\"tier\":\"starter\",\"topics\":{}}"
}

assert_v2_shape() {
  local json="$1" env="$2" q="$3"

  local schema tokens session tech mentor steps
  schema=$(jq -r '.meta.schema // empty' <<<"$json")
  tokens=$(jq -r '.meta.tokens_used // empty' <<<"$json")
  session=$(jq -r '.meta.session_id // empty' <<<"$json")
  tech=$(jq -r '.response.technical // empty' <<<"$json")
  mentor=$(jq -r '.response.mentoring // empty' <<<"$json")
  steps=$(jq -r '.response.nextSteps | length' <<<"$json" 2>/dev/null || echo 0)

  [[ "$schema" == "v2" ]] || fail "$env: schema != v2 for question: $q"
  [[ -n "$session" ]] || fail "$env: session_id missing for: $q"
  [[ "${#tech}" -ge "$MIN_TECH" ]] || fail "$env: technical too short (${#tech} < $MIN_TECH) for: $q"
  [[ "${#mentor}" -ge "$MIN_MENTOR" ]] || fail "$env: mentoring too short (${#mentor} < $MIN_MENTOR) for: $q"
  [[ "$steps" -ge "$MIN_STEPS" ]] || fail "$env: nextSteps length $steps < $MIN_STEPS for: $q"

  echo "   • $env OK → tokens_used=${tokens:-n/a}, session_id=${session:0:8}…"
}

# ---------- RUN ----------
echo "🔍 Comparing environments"
echo "   PREVIEW: $PREVIEW_BASE"
echo "   PROD   : $PROD_BASE"
hr

echo "1) /api/version"
pv_version=$(curl -fsSL "$PREVIEW_BASE/api/version")
pd_version=$(curl -fsSL "$PROD_BASE/api/version")
pv_sha=$(jq -r '.version // empty' <<<"$pv_version")
pd_sha=$(jq -r '.version // empty' <<<"$pd_version")
echo "   preview SHA: $pv_sha"
echo "   prod   SHA: $pd_sha"
[[ -n "$pv_sha" && -n "$pd_sha" ]] || fail "version endpoint missing version fields"
[[ "$pd_sha" == "$pv_sha" ]] || echo "⚠️  SHA differs (prod != preview). Ensure this is expected."
hr

echo "2) /api/prompt-info"
pv_prompt=$(curl -fsSL "$PREVIEW_BASE/api/prompt-info")
pd_prompt=$(curl -fsSL "$PROD_BASE/api/prompt-info")
pv_bytes=$(jq -r '.bytes // 0' <<<"$pv_prompt")
pd_bytes=$(jq -r '.bytes // 0' <<<"$pd_prompt")
pv_hash=$(jq -r '.sha256 // empty' <<<"$pv_prompt")
pd_hash=$(jq -r '.sha256 // empty' <<<"$pd_prompt")
echo "   preview bytes/hash: $pv_bytes / ${pv_hash:0:8}…"
echo "   prod    bytes/hash: $pd_bytes / ${pd_hash:0:8}…"
[[ "$pd_bytes" -ge 2000 ]] || fail "prod prompt bytes < 2000 (file missing or not copied)"
[[ -n "$pd_hash" ]] || fail "prod prompt sha256 missing"
hr

echo "3) /api/chat/ask (V2 schema + length gates)"
for q in "${QUESTIONS[@]}"; do
  echo " - Q: $q"
  pv_chat_json=$(post_chat "$PREVIEW_BASE" "$q")
  pd_chat_json=$(post_chat "$PROD_BASE" "$q")

  # Ensure both returned JSON with response fields
  [[ -n "$pv_chat_json" ]] || fail "preview chat response empty"
  [[ -n "$pd_chat_json" ]] || fail "prod chat response empty"

  assert_v2_shape "$pv_chat_json" "preview" "$q"
  assert_v2_shape "$pd_chat_json" "prod" "$q"
done
hr

ok "Preview and Production match contract & gates 🎉"
exit 0