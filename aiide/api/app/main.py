from __future__ import annotations

import os
import shlex
import contextlib
import shutil
import tempfile
import uuid
from typing import Any

import docker
import requests
from docker.errors import DockerException
from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .deps import Settings, get_docker_client, get_settings
from .models import ChatRequest, ChatResponse, RunRequest, RunResponse

ALLOWED_IMAGES: dict[str, str] = {
    "python": "python:3.12-alpine",
    "node": "node:20-alpine",
}


def sanitize_command(command: str) -> None:
    forbidden_tokens = [";", "&&", "||", "|", "`"]
    if any(token in command for token in forbidden_tokens):
        raise HTTPException(status_code=400, detail="invalid_command")


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(title="AIIDE API")

    allowed = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed or ["http://localhost:4300"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, bool]:
        return {"ok": True}

    @app.post("/run", response_model=RunResponse)
    def run_code(
        request: RunRequest = Body(...),
        client: docker.DockerClient = Depends(get_docker_client),
    ) -> RunResponse:
        if request.lang not in ALLOWED_IMAGES:
            raise HTTPException(status_code=400, detail="lang_not_supported")

        sanitize_command(request.cmd)

        try:
            args = shlex.split(request.cmd)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="invalid_command") from exc
        if not args:
            raise HTTPException(status_code=400, detail="invalid_command")

        workdir = tempfile.mkdtemp(prefix="aiide-")
        container: Any | None = None
        try:
            container = client.containers.run(
                ALLOWED_IMAGES[request.lang],
                args,
                working_dir="/workspace",
                volumes={workdir: {"bind": "/workspace", "mode": "ro"}},
                network_disabled=True,
                mem_limit="512m",
                nano_cpus=1_000_000_000,
                detach=True,
                stdout=True,
                stderr=True,
                tty=False,
                security_opt=["no-new-privileges:true", "seccomp=/seccomp/profile.json"],
                read_only=True,
                name=f"aiide-run-{uuid.uuid4()}",
            )
            result = container.wait(timeout=12)
            exit_code = int(result.get("StatusCode", 1))
            output = container.logs(stdout=True, stderr=True)[:100_000]
            try:
                text_output = output.decode("utf-8", "ignore")
            except AttributeError:
                text_output = str(output)
            return RunResponse(exit_code=exit_code, output=text_output)
        except DockerException as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        finally:
            if container is not None:
                with contextlib.suppress(DockerException):
                    container.remove(force=True)
            shutil.rmtree(workdir, ignore_errors=True)

    @app.post("/chat", response_model=ChatResponse)
    def chat(request: ChatRequest = Body(...)) -> ChatResponse:
        payload = {
            "model": os.getenv("OLLAMA_MODEL", "llama3"),
            "prompt": request.prompt,
            "stream": False,
        }
        try:
            response = requests.post(
                f"{settings.ollama_url}/api/generate",
                json=payload,
                timeout=120,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        data = response.json()
        return ChatResponse(response=data.get("response"), output=data.get("output"))

    return app


app = create_app(get_settings())
