from fastapi import FastAPI
from contextlib import asynccontextmanager

# Import routers later when API endpoints are defined
# from .api import workflows, runs, pieces

# Import registry and load pieces
from .engine.registry import registry, get_registry
from .pieces.actions import CodeExecutor, HttpRequest, Delay
from .pieces.triggers import ManualTrigger, ScheduleTrigger, WebhookTrigger
from .pieces.integrations import AiOrchestrator, OsIntegration

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load pieces into the registry on startup
    print("Loading workflow pieces...")
    piece_registry = get_registry()
    # Action Pieces
    piece_registry.register("code_executor", CodeExecutor)
    piece_registry.register("http_request", HttpRequest)
    piece_registry.register("delay", Delay)
    # Trigger Pieces
    piece_registry.register("manual_trigger", ManualTrigger)
    piece_registry.register("schedule_trigger", ScheduleTrigger)
    piece_registry.register("webhook_trigger", WebhookTrigger)
    # Integration Pieces
    piece_registry.register("ai_orchestrator", AiOrchestrator)
    piece_registry.register("os_integration", OsIntegration)
    print(f"Loaded pieces: {list(piece_registry.list_pieces().keys())}")
    yield
    # Clean up resources on shutdown if needed
    print("Shutting down Workflow Engine...")

app = FastAPI(
    title="ALT_LAS Workflow Engine",
    description="Service for defining, executing, and monitoring workflows.",
    version="1.1.0",
    lifespan=lifespan
)

@app.get("/health", tags=["Status"])
async def health_check():
    """Check the health of the service."""
    # TODO: Add checks for database connection, etc.
    return {"status": "ok"}

# TODO: Include API routers
# app.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
# app.include_router(runs.router, prefix="/runs", tags=["Workflow Runs"])
# app.include_router(pieces.router, prefix="/pieces", tags=["Pieces"])

# Placeholder for running with uvicorn directly (for development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True) # Use a different port, e.g., 8001

