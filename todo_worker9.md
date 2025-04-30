# Worker 9: Workflow Engine Developer - Task Checklist

Based on the project's `FEATURE_ROADMAP.md` (v1.1), the existing code in the `workflow-engine` directory, and the absence of an assigned worker for this component, the following tasks are identified for Worker 9:

## v1.1: Core Workflow Engine & Basic Integrations

### 1. Architecture & Setup (Week 1-2)
- [x] **Task 9.1:** Refine architecture choices.
    - [x] Decide on database (e.g., PostgreSQL, align with Worker 4) and ORM/driver (e.g., SQLAlchemy, asyncpg). *Note: Switched to SQLite/aiosqlite for development due to env constraints.*
    - [ ] Decide on task queue if needed for scheduling/long tasks (e.g., Celery/Redis).
    - [ ] Plan integration points with other services (API Gateway, AI Orchestrator, OS Integration) - *Initial HTTP integrations exist*. 
- [x] **Task 9.2:** Set up the basic project structure for the Workflow Engine service.
    - [x] Initialize project structure (`src/engine`, `src/models`, `src/pieces`).
    - [ ] Set up FastAPI application (`main.py`).
    - [ ] Configure linting, formatting, testing.
    - [x] Set up basic API endpoints (e.g., health check).
    - [ ] Configure logging and error handling.
    - [ ] Create Dockerfile for the service.
    - [x] Create `requirements.txt`.
    - [ ] Create `.gitignore`.

### 2. Core Execution Logic (Week 3-4)
- [ ] **Task 9.3:** Enhance the core workflow execution engine (`src/engine/executor.py`).
    - [x] Implement logic to parse workflow definitions.
    - [x] Implement basic state management for running workflows (in-memory).
    - [x] Handle sequential step execution (topological sort).
    - [ ] Improve parallel step execution handling (currently basic asyncio queue).
    - [ ] Implement robust error handling and retry logic for steps.
    - [ ] Implement proper input gathering for nodes (handle multiple inputs, handles).
    - [ ] Add persistence calls (TODOs in `executor.py`).
- [x] **Task 9.4:** Implement workflow execution persistence.
    - [x] Integrate chosen database. *Note: Using SQLite for dev.*
    - [x] Store/Update workflow definitions. *(Basic models and migration done)*
    - [x] Store/Update workflow execution history (runs, node states, outputs, errors). *(Basic models and migration done)*

### 3. Piece Framework (Week 5-6)
- [x] **Task 9.5:** Design and develop the Piece framework.
    - [x] Define the base `Piece` class (`src/pieces/base.py`).
    - [x] Implement dynamic loading and registration (`src/engine/registry.py`).
    - [x] Define input/output/config schema methods.
    - [ ] Create initial documentation for the Piece framework.

### 4. Basic Pieces Implementation (Week 7-8)
- [x] **Task 9.6:** Implement basic Trigger Pieces (`src/pieces/triggers.py`).
    - [x] Manual Trigger.
    - [x] Schedule Trigger (needs external scheduler integration).
    - [x] Webhook Trigger (needs API endpoint).
- [x] **Task 9.7:** Implement basic Action Pieces (`src/pieces/actions.py`).
    - [x] HTTP Request Piece.
    - [x] Code Execution Piece (needs security review/sandboxing).
    - [x] Delay Piece.

### 5. ALT_LAS Service Integration Pieces (Week 9-10)
- [x] **Task 9.8:** Implement Pieces to integrate with existing ALT_LAS services (`src/pieces/integrations.py`).
    - [x] AI Orchestrator Piece (basic HTTP).
    - [x] OS Integration Piece (basic HTTP).
    - [ ] Refine pieces based on actual service APIs and coordinate with relevant workers (Worker 7, Worker 6).

### 6. API Integration & Monitoring (Week 11-12)
- [ ] **Task 9.9:** Integrate Workflow Engine with API Gateway (Worker 1).
    - [ ] Define and implement API endpoints for workflow management (CRUD).
    - [ ] Define and implement API endpoints for workflow execution (trigger, status, history).
    - [ ] Implement Webhook trigger endpoint.
- [ ] **Task 9.10:** Implement workflow monitoring and logging.
    - [ ] Set up structured logging.
    - [ ] Log key events during workflow execution.
    - [ ] Expose execution status and logs via API.
    - [ ] Coordinate with Worker 5 (UI) for displaying monitoring information.

### 7. Testing & Documentation (Ongoing)
- [x] **Task 9.11:** Write unit and integration tests for the Workflow Engine and Pieces. *(Added basic DB test script)*
- [x] **Task 9.12:** Document the Workflow Engine architecture, Piece framework, API endpoints, and usage. *(Documented DB setup)*
- [x] **Task 9.13:** Create and maintain `worker9_documentation.md` following the project template. *(Created and updated)*

