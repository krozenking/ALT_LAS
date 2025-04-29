"""
Configuration settings for AI Orchestrator.
"""
import os
from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """
    Application settings.
    """
    # API settings
    API_PREFIX: str = "/api"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Logging settings
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Model settings
    MODEL_DIR: str = Field(default="./models", env="MODEL_DIR")
    DEFAULT_MODEL: str = Field(default="llama2-7b-q4", env="DEFAULT_MODEL")
    
    # GPU settings
    USE_GPU: bool = Field(default=True, env="USE_GPU")
    GPU_MEMORY_LIMIT: Optional[int] = Field(default=None, env="GPU_MEMORY_LIMIT")
    
    # Cache settings
    CACHE_DIR: str = Field(default="./cache", env="CACHE_DIR")
    CACHE_SIZE_LIMIT: int = Field(default=1024, env="CACHE_SIZE_LIMIT")  # MB
    
    # Service integration
    RUNNER_SERVICE_URL: str = Field(default="http://localhost:8001", env="RUNNER_SERVICE_URL")
    SEGMENTATION_SERVICE_URL: str = Field(default="http://localhost:8002", env="SEGMENTATION_SERVICE_URL")
    
    # Model configurations
    MODEL_CONFIGS: Dict[str, Dict[str, Any]] = {
        "llama2-7b-q4": {
            "type": "llama.cpp",
            "path": "llama-2-7b-chat.Q4_K_M.gguf",
            "context_length": 4096,
            "max_tokens": 2048,
        },
        "whisper-small": {
            "type": "whisper",
            "path": "whisper-small",
            "language": "en",
        },
        "yolo-v8": {
            "type": "yolo",
            "path": "yolov8n.pt",
            "confidence": 0.5,
        },
    }
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Create global settings object
settings = Settings()
