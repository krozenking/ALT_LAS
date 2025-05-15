"""
Configuration settings for AI Orchestrator.

This module provides configuration settings and utilities for the AI Orchestrator.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path

# Default configuration
DEFAULT_CONFIG = {
    "api": {
        "host": "0.0.0.0",
        "port": 8000,
        "debug": False,
        "workers": 4,
        "timeout": 60
    },
    "logging": {
        "level": "INFO",
        "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        "file": None
    },
    "models": {
        "cache_dir": "./models_cache",
        "default_llm": "llama2-7b-chat",
        "default_vision": "clip-vit-base",
        "default_voice": "whisper-small",
        "max_loaded_models": 5,
        "preload_models": ["llama2-7b-chat"]
    },
    "llm": {
        "default_temperature": 0.7,
        "default_max_tokens": 1024,
        "default_top_p": 0.9,
        "default_top_k": 40,
        "default_repetition_penalty": 1.0
    },
    "vision": {
        "default_image_size": 224,
        "enable_object_detection": True,
        "enable_ocr": True
    },
    "voice": {
        "default_language": "en",
        "enable_translation": True,
        "sample_rate": 16000
    },
    "gpu": {
        "enabled": True,
        "memory_fraction": 0.9,
        "precision": "float16",
        "warmup": {
            "enabled": True,
            "on_startup": True,
            "operations": ["matmul", "conv2d", "memory"],
            "size": "medium"  # small, medium, large
        },
        "memory_pool": {
            "enabled": True,
            "preallocate_common_sizes": True,
            "common_sizes_mb": [128, 256, 512, 1024]
        }
    },
    "os_integration": {
        "enabled": True,
        "screenshot_dir": "./screenshots",
        "resource_monitoring_interval": 5
    }
}

# Global configuration object
config: Dict[str, Any] = {}


def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load configuration from file or use default.

    Args:
        config_path: Path to configuration file (JSON)

    Returns:
        Configuration dictionary
    """
    global config

    # Start with default configuration
    config = DEFAULT_CONFIG.copy()

    # Override with environment variables
    if os.environ.get("AI_ORCHESTRATOR_CONFIG"):
        config_path = os.environ.get("AI_ORCHESTRATOR_CONFIG")

    # Override with file if provided
    if config_path and os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                file_config = json.load(f)

            # Deep merge configuration
            _deep_merge(config, file_config)

            logging.info(f"Loaded configuration from {config_path}")
        except Exception as e:
            logging.error(f"Error loading configuration from {config_path}: {str(e)}")

    # Create cache directory if it doesn't exist
    os.makedirs(config["models"]["cache_dir"], exist_ok=True)

    # Create screenshot directory if it doesn't exist and OS integration is enabled
    if config["os_integration"]["enabled"]:
        os.makedirs(config["os_integration"]["screenshot_dir"], exist_ok=True)

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, config["logging"]["level"]),
        format=config["logging"]["format"],
        filename=config["logging"]["file"]
    )

    return config


def _deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> None:
    """
    Deep merge override dictionary into base dictionary.

    Args:
        base: Base dictionary to merge into
        override: Dictionary with values to override
    """
    for key, value in override.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            _deep_merge(base[key], value)
        else:
            base[key] = value


def get_model_path(model_name: str, model_type: str) -> str:
    """
    Get the path to a model file.

    Args:
        model_name: Name of the model
        model_type: Type of the model (llm, vision, voice)

    Returns:
        Path to the model file
    """
    cache_dir = Path(config["models"]["cache_dir"])
    return str(cache_dir / model_type / model_name)


def get_available_models(model_type: Optional[str] = None) -> Dict[str, List[str]]:
    """
    Get available models from the cache directory.

    Args:
        model_type: Type of models to get (llm, vision, voice) or None for all

    Returns:
        Dictionary of model types and lists of model names
    """
    cache_dir = Path(config["models"]["cache_dir"])
    result = {}

    # Define model types to check
    model_types = ["llm", "vision", "voice"] if model_type is None else [model_type]

    for mt in model_types:
        model_dir = cache_dir / mt
        if model_dir.exists() and model_dir.is_dir():
            result[mt] = [d.name for d in model_dir.iterdir() if d.is_dir()]
        else:
            result[mt] = []

    return result


# Load configuration on module import
load_config()
