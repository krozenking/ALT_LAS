# Segmentation Service (ALT_LAS)

## Overview

The Segmentation Service is a core component of the ALT_LAS project. Its primary responsibility is to take user commands (either natural language or structured input) and break them down into a series of machine-understandable tasks and sub-tasks. These segmented tasks are then typically stored in `*.alt` files, which define the actions, parameters, and dependencies for execution by the Runner Service or Workflow Engine.

This service plays a crucial role in translating human intent into actionable steps for the AI-driven automation platform.

## Current Status (May 2025)

The basic functionality of the Segmentation Service has been implemented. It now includes:

*   A FastAPI application (`src/enhanced_main.py`) serving as the main entry point.
*   Endpoints for health checks (`/health`) and command segmentation (`/segment`).
*   Basic request validation using Pydantic models.
*   Placeholder logic for generating `*.alt` files in YAML format based on incoming commands. This includes capturing the original command, mode, persona, and generating a simple task structure.
*   Logging capabilities using Loguru.
*   Basic error handling and middleware for request logging.

## Key Functionalities

*   **Command Input**: Accepts commands via a POST request to the `/segment` endpoint.
*   **Mode and Persona Handling**: Supports `mode` (Normal, Dream, Explore, Chaos) and `persona` (e.g., technical_expert) parameters to influence how commands are interpreted (currently, these are passed through to the `*.alt` file).
*   **ALT File Generation**: Creates a `*.alt` file in a predefined storage path (`/tmp/alt_files` by default). The content of this file is currently a placeholder and will be enhanced with actual NLP and task planning logic in future development iterations.
*   **API Documentation**: The FastAPI application is self-documenting via Swagger UI (typically available at `/docs`) and ReDoc (typically available at `/redoc`) when the service is running.

## How to Run (Development)

1.  **Navigate to the service directory**:
    ```bash
    cd /path/to/ALT_LAS/segmentation-service
    ```
2.  **Create and activate a Python virtual environment** (if not already done):
    ```bash
    python3.11 -m venv venv
    source venv/bin/activate
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the FastAPI application using Uvicorn**:
    ```bash
    uvicorn src.enhanced_main:app --host 0.0.0.0 --port 8002 --reload
    ```
    The service will typically be available at `http://localhost:8002`.

## API Endpoints

*   `GET /health`: Returns the health status of the service.
*   `POST /segment`: Accepts a JSON payload with a command and other parameters, processes it, and returns a response indicating the path to the generated `*.alt` file.

    **Example Request Body for `/segment`**:
    ```json
    {
        "command": "Summarize the latest news articles about AI.",
        "mode": "Normal",
        "persona": "researcher",
        "user_id": "user123",
        "metadata": {"source": "test_client"}
    }
    ```

    **Example Success Response for `/segment`**:
    ```json
    {
        "segmentation_id": "seg_xxxxxxxxxxxx",
        "status": "success",
        "alt_file_path": "/tmp/alt_files/seg_xxxxxxxxxxxx.alt",
        "message": "Command segmented successfully (placeholder logic).",
        "mode_used": "Normal",
        "persona_used": "researcher"
    }
    ```

## Future Development

*   **Implement actual NLP-based segmentation logic**: Replace placeholder `*.alt` file generation with sophisticated command parsing, intent recognition, entity extraction, and task decomposition.
*   **Integrate with AI Orchestrator**: For more complex command understanding and planning.
*   **Enhance Mod and Persona impact**: Ensure that selected modes and personas significantly alter the segmentation outcome.
*   **Improve error handling and resilience**.
*   **Add comprehensive unit and integration tests**.
*   **Integrate with the main API Gateway** for centralized access.

## Dependencies

*   FastAPI
*   Uvicorn
*   Loguru
*   PyYAML
*   Pydantic

(Refer to `requirements.txt` for specific versions.)

