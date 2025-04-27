# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial setup for changelog.
- Created `workflow-engine` microservice directory and basic structure.
- Defined core data models for workflows, nodes, edges, and runs (`workflow-engine/src/models/workflow.py`).
- Implemented base `Piece` class for workflow nodes (`workflow-engine/src/pieces/base.py`).
- Developed initial `WorkflowExecutor` for running workflows (`workflow-engine/src/engine/executor.py`).
- Created `PieceRegistry` for managing available workflow pieces (`workflow-engine/src/engine/registry.py`).
- Added basic `ManualTrigger` piece (`workflow-engine/src/pieces/triggers.py`).
- Added basic `CodeExecutor` action piece (`workflow-engine/src/pieces/actions.py`).
- Added `HttpRequest` action piece (`workflow-engine/src/pieces/actions.py`).
- Added `Delay` action piece (`workflow-engine/src/pieces/actions.py`).
- Added `ScheduleTrigger` piece (`workflow-engine/src/pieces/triggers.py`).
- Added `WebhookTrigger` piece (`workflow-engine/src/pieces/triggers.py`).
- Added `AiOrchestrator` integration piece (`workflow-engine/src/pieces/integrations.py`).
- Added `OsIntegration` integration piece (`workflow-engine/src/pieces/integrations.py`).
## [1.0.0] - YYYY-MM-DD

### Added
- Initial project structure and core services.
- Security enhancements by Worker 8 (Dockerfiles, K8s policies, CI/CD security, documentation).

[Unreleased]: https://github.com/krozenking/ALT_LAS/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/krozenking/ALT_LAS/releases/tag/v1.0.0
