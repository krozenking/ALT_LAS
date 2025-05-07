# AI Adapter Service

This service is responsible for providing a unified interface to various AI models, including OpenAI, Anthropic, Mistral AI, and local models (e.g., via llama.cpp).

## Features

-   Standardized API for text generation, chat, and embeddings across different models.
-   Configuration management for API keys and model parameters.
-   Performance monitoring and logging.

## Project Structure

```
ai_adapter_service/
├── src/                # Source code
│   ├── adapters/       # Adapters for specific AI models
│   ├── core/           # Core logic, interfaces
│   └── main.py         # Main application entry point (e.g., FastAPI app)
├── tests/              # Unit and integration tests
├── venv/               # Python virtual environment
├── .gitignore          # Git ignore file
├── Dockerfile          # Docker configuration
├── README.md           # This file
└── requirements.txt    # Python dependencies
```

## Setup

1.  Clone the repository (if applicable).
2.  Create and activate a virtual environment:
    ```bash
    python3.11 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Service

(Instructions to be added once the service is developed, e.g., using uvicorn for a FastAPI app)

## Running Tests

(Instructions to be added, e.g., using pytest)

