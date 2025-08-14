#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"

GIT_SHA="${GIT_SHA:-$(git -C "$ROOT_DIR" rev-parse --short=12 HEAD)}"
BUILT_AT="${BUILT_AT:-$(date -u +'%Y-%m-%dT%H:%M:%SZ')}"

# Make a clean .env (no duplicates)
tmp="$(mktemp)"
# Preserve any existing keys except GIT_SHA/BUILT_AT
grep -vE '^(GIT_SHA|BUILT_AT)=' "$ENV_FILE" 2>/dev/null > "$tmp" || true

{
  echo "GIT_SHA=$GIT_SHA"
  echo "BUILT_AT=$BUILT_AT"
} >> "$tmp"

mv "$tmp" "$ENV_FILE"
echo "[write-build-env] Set GIT_SHA=$GIT_SHA BUILT_AT=$BUILT_AT in $ENV_FILE"