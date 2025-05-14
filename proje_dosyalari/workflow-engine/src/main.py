from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from loguru import logger

from .logging_config import setup_logging  # Import logging setup

# Setup logging as the first step to ensure all subsequent logs are captured correctly.
setup_logging()

# Import routers for different API groups.
# These are imported after logging setup to ensure their initial logs are also captured.
from .api import workflows, runs, pieces

# Import the central registry and specific workflow pieces to be registered.
from .engine.registry import registry, get_registry
from .pieces.actions import CodeExecutor, HttpRequest, Delay
from .pieces.triggers import ManualTrigger, ScheduleTrigger, WebhookTrigger
from .pieces.integrations import AiOrchestrator, OsIntegration

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages the application's lifespan events, such as startup and shutdown.

    During startup, it loads all defined workflow pieces into the central registry,
    making them available for use in workflows.
    """
    logger.info("Workflow Engine starting up...")
    logger.info("Loading workflow pieces into the registry...")
    piece_registry = get_registry()  # Get the singleton registry instance.

    # Register Action Pieces: These perform specific operations.
    piece_registry.register("code_executor", CodeExecutor)  # Executes arbitrary code.
    piece_registry.register("http_request", HttpRequest)    # Makes HTTP requests.
    piece_registry.register("delay", Delay)                # Pauses workflow execution.

    # Register Trigger Pieces: These initiate workflow runs.
    piece_registry.register("manual_trigger", ManualTrigger)      # Manually triggered workflows.
    piece_registry.register("schedule_trigger", ScheduleTrigger)  # Time-based scheduled workflows.
    piece_registry.register("webhook_trigger", WebhookTrigger)    # Workflows triggered by HTTP webhooks.

    # Register Integration Pieces: These connect to other ALT_LAS services.
    piece_registry.register("ai_orchestrator", AiOrchestrator) # Interacts with AI Orchestrator.
    piece_registry.register("os_integration", OsIntegration)    # Interacts with OS Integration Service.

    logger.info(f"Successfully loaded pieces: {list(piece_registry.list_pieces().keys())}")
    yield  # Application runs after this point.
    # Clean up resources on shutdown if needed.
    logger.info("Workflow Engine shutting down...")

# Initialize the FastAPI application instance.
app = FastAPI(
    title="ALT_LAS Workflow Engine",
    description="This service is responsible for defining, executing, and monitoring automated workflows within the ALT_LAS platform. It allows users to connect various pieces (triggers, actions, integrations) to create complex automation sequences.",
    version="1.1.0",  # Current version of the Workflow Engine.
    lifespan=lifespan  # Manage startup and shutdown events using the lifespan context manager.
)

@app.get("/health", tags=["Status"], summary="Health Check Endpoint")
async def health_check():
    """Provides a simple health check endpoint to verify if the service is running and responsive.
    
    In a production environment, this could be expanded to check dependencies like database connections.
    """
    # TODO: Add more comprehensive health checks, e.g., database connectivity, NATS connection.
    return {"status": "ok", "service": "Workflow Engine"}

# Include API routers for different functionalities, organizing endpoints under specific tags.
app.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])  # Endpoints for managing workflows.
app.include_router(runs.router, prefix="/runs", tags=["Workflow Runs"])        # Endpoints for managing workflow executions (runs).
app.include_router(pieces.router, prefix="/pieces", tags=["Pieces"])            # Endpoints for listing and inspecting available workflow pieces.

# This block allows running the FastAPI application directly using Uvicorn for development purposes.
# It's typically not used in production where a Gunicorn/Uvicorn setup with a process manager is preferred.
if __name__ == "__main__":
    import uvicorn
    logger.info("Running Workflow Engine in development mode with Uvicorn.")
    # Use a different port (e.g., 8001) to avoid conflicts with other services like API Gateway (often on 3000 or 8000).
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)

# --- Exception Handlers ---
# These handlers ensure that errors are caught પાણીand returned in a standardized JSON format,
# which is helpful for API clients.

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handles FastAPI request validation errors (e.g., invalid input data).

    Logs the detailed validation errors and returns a 422 Unprocessable Entity response.
    """
    logger.error(f"Validation error for request {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed", "errors": exc.errors(), "body": exc.body},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handles any other unhandled exceptions that occur during request processing.

    Logs the full exception traceback and returns a 500 Internal Server Error response
    to prevent leaking sensitive information.
    """
    logger.exception(f"Unhandled exception for request {request.method} {request.url}") # Use logger.exception to include traceback
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "error_type": type(exc).__name__},
    )

# --- Middleware ---
# Middleware functions are processed for every request.

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Logs incoming requests and their corresponding response statuses.
    
    This provides a basic audit trail of API interactions.
    """
    logger.info(f"Incoming request: {request.method} {request.url} from {request.client.host}")
    response = await call_next(request)
    logger.info(f"Outgoing response: {request.method} {request.url} - Status {response.status_code}")
    return response

