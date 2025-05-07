# AI Adapter Service

This service is responsible for providing a unified interface to various AI models, including OpenAI, Anthropic, Mistral AI, and local models (e.g., via llama.cpp).

## Features

-   Standardized API for text generation, chat, and embeddings across different models.
-   Configuration management for API keys and model parameters.
-   Performance monitoring and logging.

## Project Structure

```
ai_adapter_service/
├── docs/               # Documentation files (research, metrics)
│   ├── ai_model_api_research.md
│   └── ai_model_performance_metrics.md
├── src/                # Source code
│   ├── adapters/       # Adapters for specific AI models
│   │   └── __init__.py
│   ├── core/           # Core logic, interfaces
│   │   ├── __init__.py
│   │   └── base_adapter.py
│   └── __init__.py
│   #└── main.py         # Main application entry point (e.g., FastAPI app) - To be added
├── tests/              # Unit and integration tests
│   ├── core/
│   │   └── test_base_adapter.py
│   └── conftest.py
├── venv/               # Python virtual environment
├── .gitignore          # Git ignore file
├── Dockerfile          # Docker configuration
├── README.md           # This file
└── requirements.txt    # Python dependencies
```

## Setup

1.  Clone the repository (if applicable).
2.  Navigate to the `ai_adapter_service` directory.
3.  Create and activate a virtual environment:
    ```bash
    python3.11 -m venv venv
    source venv/bin/activate
    ```
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Service

(Instructions to be added once the main application entry point, e.g., a FastAPI app, is developed in `src/main.py`)

## Running Tests

To run the tests, ensure you are in the `ai_adapter_service` directory and the virtual environment is activated.

```bash
PYTHONPATH=. pytest
```

This command will discover and run all tests within the `tests` directory.

## Worker 6 Task Summary

For details on Worker 6's tasks and progress, refer to the main project documentation or `worker6_task_summary.md` in the root of the ALT_LAS project.

