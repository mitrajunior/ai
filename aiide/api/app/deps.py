from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
import docker


class Settings(BaseSettings):
    database_url: str | None = None
    redis_url: str | None = None
    s3_endpoint: str | None = None
    s3_bucket: str | None = None
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    ollama_url: str = "http://ollama:11434"
    allowed_origins: str = "http://localhost:4300"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_docker_client() -> docker.DockerClient:
    return docker.from_env()
