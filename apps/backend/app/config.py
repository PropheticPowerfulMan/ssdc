from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    environment: str = "development"
    database_url: str = "postgresql+psycopg://ssdc:ssdc@localhost:5432/ssdc"
    oidc_issuer: str = "http://localhost:8080/realms/ssdc"
    oidc_internal_url: str = "http://localhost:8080/realms/ssdc"
    oidc_audience: str = "ssdc-api"
    oidc_client_id: str = "ssdc-api"
    oidc_client_secret: str = ""
    frontend_origin: str = "http://localhost:5173"
    development_kek: str = ""
    kms_key_id: str = ""
    aws_region: str = "eu-west-1"
    storage_path: str = "./var/objects"
    max_upload_bytes: int = 10 * 1024 * 1024
    clamav_host: str = "localhost"
    clamav_port: int = 3310


@lru_cache
def settings():
    return Settings()
