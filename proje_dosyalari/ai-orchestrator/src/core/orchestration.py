#!/usr/bin/env python3
"""
Core orchestration logic for AI models.
Updated by Worker 1 to integrate OSIntegrationClient.
"""

import logging
from typing import Dict, Any, List, Optional

from .model_selection import select_model
from .model_adapters import load_model, run_model
from .config import load_config
from ..clients.os_integration_client import OSIntegrationClient # Added by Worker 1

logger = logging.getLogger(__name__)

class AIOrchestrator:
    """Orchestrates AI model selection, loading, and execution."""

    def __init__(self, config_path: str = "config.yaml"):
        self.config = load_config(config_path)
        self.loaded_models: Dict[str, Any] = {}
        # Initialize OS Integration Client (Added by Worker 1)
        os_integration_url = self.config.get("services", {}).get("os_integration_service_url", "http://os-integration-service:8083")
        self.os_client = OSIntegrationClient(base_url=os_integration_url)
        logger.info("AI Orchestrator initialized.")
        # Log platform info using the client (Added by Worker 1)
        platform_info = self.os_client.get_platform_info()
        if platform_info:
            logger.info(f"Detected Platform: {platform_info.get('os_name')} {platform_info.get('os_version')}")
        else:
            logger.warning("Could not retrieve platform info from OS Integration Service.")

    def process_task(self, task_description: str, data: Any) -> Optional[Any]:
        """Processes an AI task by selecting, loading, and running a suitable model."""
        logger.info(f"Received task: {task_description}")

        # --- OS Integration Example: Take screenshot before task (Added by Worker 1) ---
        screenshot_path = f"/tmp/before_task_{task_description.replace(' ', '_')}.png"
        screenshot_result = self.os_client.take_screenshot(output_path=screenshot_path)
        if screenshot_result:
            logger.info(f"Screenshot taken before task: {screenshot_path}")
        else:
            logger.warning("Failed to take screenshot before task.")
        # --- End OS Integration Example ---

        # 1. Select Model
        model_id = select_model(task_description, self.config.get("models", []))
        if not model_id:
            logger.error("No suitable model found for the task.")
            return None
        logger.info(f"Selected model: {model_id}")

        # 2. Load Model (if not already loaded)
        if model_id not in self.loaded_models:
            model_config = next((m for m in self.config.get("models", []) if m["id"] == model_id), None)
            if not model_config:
                logger.error(f"Configuration not found for model: {model_id}")
                return None
            
            logger.info(f"Loading model: {model_id}...")
            model_instance = load_model(model_config)
            if not model_instance:
                logger.error(f"Failed to load model: {model_id}")
                return None
            self.loaded_models[model_id] = model_instance
            logger.info(f"Model {model_id} loaded successfully.")
        else:
            logger.info(f"Using already loaded model: {model_id}")
            model_instance = self.loaded_models[model_id]

        # 3. Run Model
        try:
            logger.info(f"Running model {model_id} for task: {task_description}")
            result = run_model(model_instance, data)
            logger.info(f"Model {model_id} execution completed.")
            return result
        except Exception as e:
            logger.error(f"Error running model {model_id}: {e}", exc_info=True)
            return None

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Returns the list of configured models."""
        return self.config.get("models", [])

# Example usage:
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    orchestrator = AIOrchestrator()
    
    # Example task
    task = "Summarize the following text"
    text_data = "This is a long piece of text that needs summarization..."
    
    summary = orchestrator.process_task(task, text_data)
    
    if summary:
        print("\nSummary Result:")
        print(summary)
    else:
        print("\nTask processing failed.")

