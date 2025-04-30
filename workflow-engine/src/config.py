from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Default to a local PostgreSQL instance for development
    # In a real deployment, this would come from environment variables
    DATABASE_URL: str = "sqlite+aiosqlite:///./alt_las_workflow.db" # Using SQLite for development

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

