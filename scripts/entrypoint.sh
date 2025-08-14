#!/usr/bin/env bash
set -euo pipefail

cd /app

ENV_FILE="/app/.env"
# Some repos keep it at /app/backend/.env; support both
if [[ ! -f "$ENV_FILE" && -f "/app/backend/.env" ]]; then
  ENV_FILE="/app/backend/.env"
fi

# Build a cleaned env to avoid duplicates/rubbish
CLEAN_ENV="$(mktemp)"
if [[ -f "$ENV_FILE" ]]; then
  # Keep everything except GIT_SHA/BUILT_AT, then append our authoritative values
  grep -vE '^(GIT_SHA|BUILT_AT)=' "$ENV_FILE" > "$CLEAN_ENV" || true
fi

# Prefer container env (from Docker ARG/ENV); else fall back to file; else compute defaults
GIT_SHA_VAL="${GIT_SHA:-}"
BUILT_AT_VAL="${BUILT_AT:-}"

if [[ -z "${GIT_SHA_VAL}" && -f "$ENV_FILE" ]]; then
  GIT_SHA_VAL="$(grep -m1 '^GIT_SHA=' "$ENV_FILE" | cut -d '=' -f2- || true)"
fi
if [[ -z "${GIT_SHA_VAL}" ]]; then
  GIT_SHA_VAL="$(git rev-parse --short=12 HEAD 2>/dev/null || echo unknown)"
fi

if [[ -z "${BUILT_AT_VAL}" && -f "$ENV_FILE" ]]; then
  BUILT_AT_VAL="$(grep -m1 '^BUILT_AT=' "$ENV_FILE" | cut -d '=' -f2- || true)"
fi
if [[ -z "${BUILT_AT_VAL}" ]]; then
  BUILT_AT_VAL="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
fi

{
  echo "GIT_SHA=$GIT_SHA_VAL"
  echo "BUILT_AT=$BUILT_AT_VAL"
} >> "$CLEAN_ENV"

# Export everything from the clean env
set -a
# shellcheck disable=SC1090
source "$CLEAN_ENV"
set +a

echo "[entrypoint] Using GIT_SHA=$GIT_SHA BUILT_AT=$BUILT_AT"

# Start supervisor since we're using it for orchestration
if command -v supervisord >/dev/null 2>&1; then
  exec supervisord -c /etc/supervisor/supervisord.conf
else
  # Fallback to direct uvicorn start
  cd /app/backend
  exec uvicorn server:app --host 0.0.0.0 --port 8001
fi