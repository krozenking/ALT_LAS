# Worker 9: Workflow Engine Developer - Task Checklist

Based on the project's `FEATURE_ROADMAP.md` (v1.1), the existing code in the `workflow-engine` directory, and the absence of an assigned worker for this component, the following tasks are identified for Worker 9:

**Note:** Following the deletion of all non-main branches (Apr 30, 2025), tasks previously marked as complete based on work in those branches have been reset to incomplete `[ ]`. All future work must be done directly on the `main` branch.

## v1.1: Core Workflow Engine & Basic Integrations

### 1. Architecture & Setup (Week 1-2)
- [x] **Task 9.1:** Refine architecture choices.
    - [x] Decide on database (e.g., PostgreSQL, align with Worker 4) and ORM/driver (e.g., SQLAlchemy, asyncpg). *Note: Switched to SQLite/aiosqlite for development due to env constraints.*
    - [ ] Decide on task queue if needed for scheduling/long tasks (e.g., Celery/Redis).
    - [ ] Plan integration points with other services (API Gateway, AI Orchestrator, OS Integration) - *Initial HTTP integrations exist*. 
- [ ] **Task 9.2:** Set up the basic project structure for the Workflow Engine service.
    - [x] Initialize project structure (`src/engine`, `src/models`, `src/pieces`).
    - [ ] Set up FastAPI application (`main.py`).
    - [ ] Configure linting, formatting, testing.
    - [x] Set up basic API endpoints (e.g., health check).
    - [ ] Configure logging and error handling.
    - [ ] Create Dockerfile for the service.
    - [x] Create `requirements.txt`.
    - [x] Create `.gitignore`.

### 2. Core Execution Logic (Week 3-4)
- [ ] **Task 9.3:** Enhance the core workflow execution engine (`src/engine/executor.py`).
    - [ ] Implement logic to parse workflow definitions.
    - [ ] Implement basic state management for running workflows (in-memory).
    - [ ] Handle sequential step execution (topological sort).
    - [ ] Improve parallel step execution handling (using asyncio.Semaphore).
    - [ ] Implement robust error handling and retry logic for steps.
    - [ ] Implement proper input gathering for nodes (handle multiple inputs, handles).
    - [ ] Add persistence calls (integrated DB session, status/state updates).
- [ ] **Task 9.4:** Implement workflow execution persistence.
    - [ ] Integrate chosen database. *Note: Using SQLite for dev.*
    - [ ] Store/Update workflow definitions. *(Basic models and migration done)*
    - [ ] Store/Update workflow execution history (runs, node states, outputs, errors). *(Basic models and migration done)*

### 3. Piece Framework (Week 5-6)
- [ ] **Task 9.5:** Design and develop the Piece framework.
    - [ ] Define the base `Piece` class (`src/pieces/base.py`).
    - [ ] Implement dynamic loading and registration (`src/engine/registry.py`).
    - [ ] Define input/output/config schema methods.
    - [ ] Create initial documentation for the Piece framework.

### 4. Basic Pieces Implementation (Week 7-8)
- [ ] **Task 9.6:** Implement basic Trigger Pieces (`src/pieces/triggers.py`).
    - [ ] Manual Trigger.
    - [ ] Schedule Trigger (needs external scheduler integration).
    - [ ] Webhook Trigger (needs API endpoint).
- [ ] **Task 9.7:** Implement basic Action Pieces (`src/pieces/actions.py`).
    - [ ] HTTP Request Piece.
    - [ ] Code Execution Piece (needs security review/sandboxing).
    - [ ] Delay Piece.

### 5. ALT_LAS Service Integration Pieces (Week 9-10)
- [ ] **Task 9.8:** Implement Pieces to integrate with existing ALT_LAS services (`src/pieces/integrations.py`).
    - [ ] AI Orchestrator Piece (basic HTTP).
    - [ ] OS Integration Piece (basic HTTP).
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
- [ ] **Task 9.11:** Write unit and integration tests for the Workflow Engine and Pieces. *(Added basic DB test script)*
- [ ] **Task 9.12:** Document the Workflow Engine architecture, Piece framework, API endpoints, and usage. *(Documented DB setup)*
- [x] **Task 9.13:** Create and maintain `worker9_documentation.md` following the project template. *(Created and updated with new rules)*

