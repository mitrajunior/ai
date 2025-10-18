#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null; then
  echo "Instale o Docker antes de continuar."; exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Instale docker compose v2."; exit 1
fi

cp -n .env.example .env || true
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
echo "Arquivo .env pronto. Ajuste variáveis se quiser."

# cria rede dedicada (evita conflitos)
docker network create aiide-net >/dev/null 2>&1 || true

# sobe serviços base e cria bucket MinIO
docker compose up -d db redis minio ollama
echo "Aguardando MinIO..."
sleep 5
docker run --rm --network container:aiide-minio minio/mc \
  alias set local http://localhost:9000 ${MINIO_ROOT_USER:-aiide} ${MINIO_ROOT_PASSWORD:-aiide123} || true
docker run --rm --network container:aiide-minio minio/mc mb -p local/${MINIO_BUCKET:-projects} || true

# baixa modelo no Ollama
docker exec aiide-ollama ollama pull ${OLLAMA_MODEL:-llama3} || true

# sobe todo o stack
docker compose up -d
echo "✅ Tudo no ar:
- Web:        http://localhost:${WEB_PORT:-4300}
- API:        http://localhost:${API_PORT:-8188}/docs
- MinIO UI:   http://localhost:${MINIO_CONSOLE_PORT:-9101}
- Grafana:    http://localhost:${GRAFANA_PORT:-3040}
"
