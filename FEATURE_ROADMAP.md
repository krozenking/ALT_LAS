# ALT_LAS Feature Roadmap & Versioning Plan

This document outlines the planned features and versioning strategy for the continued development of the ALT_LAS project, starting from v1.1. The plan incorporates ideas gathered from researching the needs of various professions and analyzing popular open-source workflow automation and AI agent platforms.

## Guiding Principles

*   **Modularity:** Build upon the existing microservice architecture.
*   **Extensibility:** Create frameworks that allow easy addition of new features and integrations.
*   **AI-Centric:** Leverage AI capabilities for automation, assistance, and agentic workflows.
*   **User Experience:** Provide an intuitive interface for building and managing workflows.
*   **Versioning:** Follow Semantic Versioning and maintain a clear changelog.

## Versioning Plan

### v1.1: Core Workflow Engine & Basic Integrations

**Goal:** Establish the foundation for workflow automation within ALT_LAS.

*   **Features:**
    *   **Visual Workflow Builder:** Implement a basic visual workflow builder UI component.
    *   **Workflow Execution Engine:** Develop a core service to interpret and run workflows.
    *   **Piece Framework:** Create a simple framework (TypeScript/Python) for defining workflow nodes.
    *   **Basic Trigger Nodes:** Implement Manual, Schedule, and Webhook triggers.
    *   **Basic Action Nodes:** Implement HTTP Request, Code Execution (Python/JS), and Delay nodes.
    *   **ALT_LAS Service Integration:** Integrate existing AI Orchestrator and OS Integration services as workflow nodes.
    *   **Basic Monitoring:** Implement basic workflow logging and status monitoring in the UI.
*   **Documentation:** Update architecture diagrams, add initial workflow builder user guide.
*   **Target Release:** TBD

### v1.2: Enhanced Integrations & AI Capabilities

**Goal:** Expand the library of integrations and introduce core AI functionalities into workflows.

*   **Features:**
    *   **More Integrations (Pieces):** Add nodes for common tasks (File System, Email, Data Transformation, Simple APIs).
    *   **RAG Integration:** Integrate Retrieval-Augmented Generation capabilities via the AI Orchestrator service, exposed as a workflow node (document upload, query).
    *   **LLM Prompt Node:** Add a dedicated node for easy interaction with configured LLMs.
    *   **Workflow Versioning:** Implement basic version control for workflows.
    *   **Workflow Management UI:** Improve the UI for listing, searching, and managing workflows.
*   **Documentation:** Update integration list, add RAG node guide.
*   **Target Release:** TBD

### v1.3: Agent Framework & Advanced Features

**Goal:** Introduce AI agent capabilities and more sophisticated workflow control.

*   **Features:**
    *   **AI Agent Framework:** Implement a framework for defining AI agents with goals, tools (workflow nodes), and memory.
    *   **Agent Tool Nodes:** Develop specific nodes for agents (e.g., Web Search, Calculator, File I/O).
    *   **Human-in-the-Loop Nodes:** Add nodes for manual approval steps and form inputs.
    *   **Branching Logic:** Implement conditional branching (If/Else) in the workflow builder.
    *   **Enhanced Observability:** Provide detailed logs, execution history, and basic analytics.
*   **Documentation:** Add Agent framework guide, Human-in-the-loop node guide.
*   **Target Release:** TBD

### v1.4 and Beyond: Specialization & Expansion

**Goal:** Deepen functionality with profession-specific tools, advanced AI, enterprise features, and community engagement.

*   **Potential Features:**
    *   **Profession Packs:** Bundles of workflows and integrations tailored for specific professions (e.g., "Developer Pack", "Marketing Pack", "Researcher Pack").
    *   **Advanced AI Agents:** Multi-agent collaboration, autonomous task decomposition and execution.
    *   **Enterprise Features:** Single Sign-On (SSO), Role-Based Access Control (RBAC), detailed Audit Logs.
    *   **Community Marketplace:** A platform for users to share custom Pieces and Workflow Templates.
    *   **Enhanced Model Management:** Support for fine-tuning models, model comparison.
    *   **Advanced Monitoring & Alerting:** More sophisticated monitoring dashboards and alerting capabilities.
*   **Target Release:** Ongoing

## Next Steps

1.  Commit `CHANGELOG.md` and `FEATURE_ROADMAP.md`.
2.  Begin implementation of features planned for v1.1.
