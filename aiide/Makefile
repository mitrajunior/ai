SHELL := /bin/bash

bootstrap:
	chmod +x scripts/install.sh && ./scripts/install.sh

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

pull-model:
	docker exec aiide-ollama ollama pull $(or $(MODEL),llama3)

reset:
	docker compose down -v
