from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database URL
    DATABASE_URL: str = "sqlite+aiosqlite:///./alt_las_workflow.db" # Using SQLite for development

    # Service URLs (should come from environment variables in production)
    AI_ORCHESTRATOR_URL: str = "http://ai-orchestrator:8000"
    OS_INTEGRATION_URL: str = "http://os-integration-service:8000"

    # Logging Level
    LOGGING_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", extra='ignore') # Ignore extra fields from .env

settings = Settings()

