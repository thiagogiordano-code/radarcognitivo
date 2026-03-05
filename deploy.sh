#!/usr/bin/env bash
# deploy.sh — execução manual na VPS (idêntico ao step do GitHub Actions)
# Uso: FRONTEND_IMAGE=... BACKEND_IMAGE=... DB_PASSWORD=... bash deploy.sh
set -euo pipefail

PROJECT=radarcognitivo
WORKDIR=/opt/radarcognitivo
BRANCH=main
PRIMARY_PORT=3000
FALLBACK_PORT=3001

: "${FRONTEND_IMAGE:?Variável FRONTEND_IMAGE não definida}"
: "${BACKEND_IMAGE:?Variável BACKEND_IMAGE não definida}"
: "${DB_PASSWORD:?Variável DB_PASSWORD não definida}"

echo "== Deploy starting | project=${PROJECT} workdir=${WORKDIR} branch=${BRANCH} =="

# ── Git sync ──────────────────────────────────────────────────────────────
if [ -d "$WORKDIR/.git" ]; then
  cd "$WORKDIR"
  git fetch --all
  git reset --hard "origin/${BRANCH}"
else
  echo "ERRO: $WORKDIR não é um repositório git. Clone primeiro:"
  echo "  git clone https://github.com/thiagogiordano-code/radarcognitivo.git $WORKDIR"
  exit 1
fi
echo "== Git: $(git log -1 --format='%h %s') =="

# ── Garantir COMPOSE_PROJECT_NAME no .env (sem clobber) ──────────────────
ENVFILE="$WORKDIR/.env"
touch "$ENVFILE"
if grep -q '^COMPOSE_PROJECT_NAME=' "$ENVFILE"; then
  sed -i "s/^COMPOSE_PROJECT_NAME=.*/COMPOSE_PROJECT_NAME=${PROJECT}/" "$ENVFILE"
else
  echo "COMPOSE_PROJECT_NAME=${PROJECT}" >> "$ENVFILE"
fi
echo "== .env: $(grep COMPOSE_PROJECT_NAME $ENVFILE) =="

echo "== docker compose version: $(docker compose version) =="

# ── [1] Compose down ─────────────────────────────────────────────────────
echo ">>> [1] Compose down --remove-orphans..."
FRONTEND_IMAGE="$FRONTEND_IMAGE" BACKEND_IMAGE="$BACKEND_IMAGE" DB_PASSWORD="$DB_PASSWORD" \
  docker compose -p "$PROJECT" down --remove-orphans --timeout 30 || true

# ── [2] Remover containers publicando PRIMARY_PORT ────────────────────────
echo ">>> [2] Verificando containers na porta ${PRIMARY_PORT}..."
CID=$(docker ps -q --filter "publish=${PRIMARY_PORT}" || true)
if [ -n "$CID" ]; then
  echo "    Containers na porta ${PRIMARY_PORT}: $CID — removendo..."
  docker stop $CID || true
  docker rm -f $CID || true
else
  echo "    Nenhum container publicando ${PRIMARY_PORT}."
fi

# ── [3] Loop aguardando porta livre ──────────────────────────────────────
echo ">>> [3] Aguardando liberacao da porta ${PRIMARY_PORT}..."
TARGET_PORT="${PRIMARY_PORT}"
for i in $(seq 1 10); do
  if ! ss -ltn | grep -q ":${PRIMARY_PORT} "; then
    echo "    Porta ${PRIMARY_PORT} livre (tentativa ${i})."
    break
  fi
  echo "    Tentativa ${i}/10: porta ${PRIMARY_PORT} ainda ocupada..."
  CID=$(docker ps -q --filter "publish=${PRIMARY_PORT}" || true)
  if [ -n "$CID" ]; then
    echo "    Container Docker $CID ainda na porta — removendo..."
    docker stop $CID || true
    docker rm -f $CID || true
  fi
  sleep 2
done

# ── [4] Decidir: livre | fallback ─────────────────────────────────────────
if ss -ltn | grep -q ":${PRIMARY_PORT} "; then
  CID=$(docker ps -q --filter "publish=${PRIMARY_PORT}" || true)
  if [ -n "$CID" ]; then
    echo "ERRO FATAL: container $CID ainda publica ${PRIMARY_PORT} apos 10 tentativas."
    docker ps --filter "publish=${PRIMARY_PORT}" --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"
    exit 1
  fi
  echo ">>> AVISO: porta ${PRIMARY_PORT} ocupada por processo host (nao Docker)."
  echo "    --- ss -ltnp ---"
  ss -ltnp | grep ":${PRIMARY_PORT} " || true
  echo "    --- lsof ---"
  lsof -iTCP:${PRIMARY_PORT} -sTCP:LISTEN -n -P 2>/dev/null || true
  echo "    Ativando fallback: TARGET_PORT=${FALLBACK_PORT}"
  TARGET_PORT="${FALLBACK_PORT}"
fi

echo ">>> [4] FRONTEND_HOST_PORT=${TARGET_PORT}"

# ── [5] Pull ──────────────────────────────────────────────────────────────
echo ">>> [5] docker compose pull..."
FRONTEND_IMAGE="$FRONTEND_IMAGE" BACKEND_IMAGE="$BACKEND_IMAGE" DB_PASSWORD="$DB_PASSWORD" \
  docker compose -p "$PROJECT" pull

# ── [6] Up ────────────────────────────────────────────────────────────────
echo ">>> [6] docker compose up (FRONTEND_HOST_PORT=${TARGET_PORT})..."
if ! FRONTEND_IMAGE="$FRONTEND_IMAGE" BACKEND_IMAGE="$BACKEND_IMAGE" DB_PASSWORD="$DB_PASSWORD" \
  FRONTEND_HOST_PORT="$TARGET_PORT" \
  docker compose -p "$PROJECT" up -d --force-recreate --remove-orphans; then
  echo "=== COMPOSE UP FALHOU — Diagnostico ==="
  echo "--- compose config (200 linhas) ---"
  FRONTEND_IMAGE="$FRONTEND_IMAGE" BACKEND_IMAGE="$BACKEND_IMAGE" DB_PASSWORD="$DB_PASSWORD" \
    FRONTEND_HOST_PORT="$TARGET_PORT" \
    docker compose -p "$PROJECT" config 2>&1 | head -200 || true
  echo "--- compose logs --tail=200 ---"
  docker compose -p "$PROJECT" logs --tail=200 || true
  echo "--- ss -ltnp porta ${PRIMARY_PORT} e ${FALLBACK_PORT} ---"
  ss -ltnp | grep -E ":${PRIMARY_PORT} |:${FALLBACK_PORT} " || true
  echo "--- docker ps publish=3000 ---"
  docker ps --filter "publish=3000" --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" || true
  echo "--- docker ps publish=3001 ---"
  docker ps --filter "publish=3001" --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" || true
  echo "--- docker compose version ---"
  docker compose version || true
  echo "--- pwd / ls ---"
  pwd && ls -la
  echo "--- docker info ---"
  docker info 2>&1 | head -40 || true
  exit 1
fi

# ── [7] Pós-deploy ────────────────────────────────────────────────────────
echo ">>> [7] Status pos-deploy:"
sleep 3
docker compose -p "$PROJECT" ps
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | sed -n '1,80p'
echo "== Deploy concluido. FRONTEND_HOST_PORT=${TARGET_PORT} =="
