# AI Adapter Service

This service is responsible for providing a unified interface to various AI models, including OpenAI, Anthropic, Mistral AI, and local models (e.g., via llama.cpp).

## Features

-   Standardized API for text generation, chat, and embeddings across different models.
-   Configuration management for API keys and model parameters.
-   Performance monitoring and logging.

## Project Structure

```
ai_adapter_service/
├── docs/               # Documentation files
│   ├── ai_model_api_research.md
│   ├── ai_model_performance_metrics.md
│   ├── prompt_engineering_strategies.md
│   └── openai_anthropic_performance_comparison.md
├── src/                # Source code
│   ├── adapters/
│   │   ├── __init__.py
│   │   ├── openai_adapter.py
│   │   └── anthropic_adapter.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── base_adapter.py
│   └── __init__.py
│   #└── main.py         # Main application entry point (e.g., FastAPI app) - To be added
├── tests/
│   ├── adapters/
│   │   ├── test_openai_adapter.py
│   │   └── test_anthropic_adapter.py
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
5.  **API Keys:** Ensure you have a `.env` file in the `ai_adapter_service` directory with your API keys:
    ```env
    OPENAI_API_KEY="your_openai_api_key_here"
    ANTHROPIC_API_KEY="your_anthropic_api_key_here"
    # MISTRAL_API_KEY="your_mistral_api_key_here" # For future adapters
    ```
    The adapters will attempt to load these keys. Tests requiring API keys will be skipped if the corresponding key is not found.

## Running the Service

(Instructions to be added once the main application entry point, e.g., a FastAPI app, is developed in `src/main.py`)

## Running Tests

To run the tests, ensure you are in the `ai_adapter_service` directory and the virtual environment is activated. Set the `PYTHONPATH` to include the project root for imports to work correctly:

```bash
PYTHONPATH=. pytest
```

This command will discover and run all tests within the `tests` directory. Tests that require API keys (e.g., live API calls) will be skipped if the keys are not provided in the `.env` file or as environment variables.

## Worker 6 Task Summary

For details on Worker 6's tasks and progress, refer to the main project documentation or `worker6_task_summary.md` in the root of the ALT_LAS project.

