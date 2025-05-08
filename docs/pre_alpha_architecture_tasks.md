# ALT_LAS Pre-Alpha Architectural Task Sequence

This document outlines the architectural task sequence for the Pre-Alpha phase of the ALT_LAS project. The goal of the Pre-Alpha phase is to establish a functional end-to-end workflow with core components.

**Workflow Principle:** Tasks in this sequence are architectural and component-focused. Workers will address specific micro-tasks within these architectural areas. To ensure coordination and avoid conflicts, **only one worker should actively work on a given architectural task or its sub-components at a time.** The Project Manager will coordinate the assignment of these architectural tasks or their sub-parts to individual workers.

**Documentation and Version Control:**
*   Workers must update all relevant documentation (service READMEs, general docs) upon completion of their assigned micro/macro tasks.
*   Workers must push their changes to GitHub after completing each macro task.

## Pre-Alpha Architectural Task List

The following tasks are to be addressed in the order presented to build the core functionality of ALT_LAS:

1.  **Foundational Infrastructure (Project-wide)**
    *   Objective: Establish and verify common development, logging, monitoring, and deployment (Docker) standards across all services.
    *   Key Components: Docker, CI/CD (initial setup), Logging libraries, Monitoring tools (placeholders if necessary).
    *   Manager Note: This is a prerequisite for all subsequent component development.

2.  **API Gateway (Core Functionality)**
    *   Objective: Implement essential request handling, basic authentication/authorization (can be simplified for Pre-Alpha), and routing to upcoming core services.
    *   Key Features: Health checks, core service discovery (static for Pre-Alpha if needed), basic security middleware.
    *   Relevant Worker(s): Worker 1 (API Gateway specialist).

3.  **Segmentation Service (Core Logic Implementation)**
    *   Objective: Develop the primary logic for receiving commands (via API Gateway) and breaking them into manageable sub-tasks. Define the initial `*.alt` task format.
    *   Key Features: Command parsing, sub-task generation logic, interface with Runner Service.
    *   Relevant Worker(s): Worker 2 (Segmentation specialist).

4.  **Runner Service (Basic Task Execution Engine)**
    *   Objective: Implement the capability to receive sub-tasks from the Segmentation Service and execute them. Initial execution can be simplified (e.g., mock execution or simple script running).
    *   Key Features: Sub-task consumption, basic execution environment, result generation, interface with Archive Service.
    *   Relevant Worker(s): Worker 3 (Runner specialist).

5.  **Archive Service (Core Data Persistence)**
    *   Objective: Develop the basic functionality to receive and store the results from the Runner Service. Define the initial `*.last` result format.
    *   Key Features: Result reception, basic storage mechanism (e.g., file system or simple DB for Pre-Alpha), retrieval API (if needed for early testing).
    *   Relevant Worker(s): Worker 4 (Archive specialist).

6.  **AI Orchestrator (Initial Integration & Core Model Adapters)**
    *   Objective: Integrate the AI Adapter Service (developed by Worker 6) to provide foundational AI capabilities to other services (e.g., Segmentation or Runner if they require AI for task processing). Focus on one or two key AI model integrations.
    *   Key Features: Service interface for AI model access, basic AI task processing.
    *   Relevant Worker(s): Worker 5 (AI Orchestration) and Worker 6 (AI Adapter Service - for support and integration).

7.  **UI - Desktop (Minimal Viable Workflow Interface)**
    *   Objective: Create a basic desktop interface to submit a command and view the overall status/result, testing the end-to-end flow from API Gateway through Segmentation, Runner, and Archive.
    *   Key Features: Command input, status display, result viewing.
    *   Relevant Worker(s): Worker 7 (UI Desktop specialist).

8.  **Security Layer (Fundamental Protections)**
    *   Objective: Implement initial security measures for the core services that are now operational. This includes basic input validation, securing inter-service communication (e.g., internal network, basic tokens).
    *   Key Features: Review of service endpoints, basic hardening.
    *   Relevant Worker(s): Worker 9 (Security specialist).

9.  **OS Integration (Critical Feature Prototyping)**
    *   Objective: If any core Pre-Alpha workflow depends on specific OS-level interactions, prototype and integrate these critical features.
    *   Key Features: Defined by the specific OS integration needs for the core loop.
    *   Relevant Worker(s): Worker 8 (OS Integration specialist).

10. **End-to-End Workflow Testing and Refinement**
    *   Objective: Conduct comprehensive testing of the integrated Pre-Alpha system. Identify bottlenecks, bugs, and areas for immediate refinement.
    *   Key Components: All services integrated so far.
    *   Manager Note: This involves all relevant workers and the manager.

**Next Steps after Pre-Alpha:**
*   Expand feature sets for each component.
*   Develop Web and Mobile UIs.
*   Enhance security, monitoring, and scalability.
*   Implement advanced AI features.

This list will be maintained by the Project Manager and updated as the Pre-Alpha phase progresses. Workers should consult this document for the current architectural focus.

