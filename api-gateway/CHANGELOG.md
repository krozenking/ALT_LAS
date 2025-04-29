# Changelog

## [Unreleased] - 2025-04-29

### Added
- **Enhanced Authentication:** Implemented JWT token refresh mechanism (`/api/auth/refresh`) and logout functionality (`/api/auth/logout`) in `authService.js` and `index.js`.
- **Role-Based Access Control (RBAC):** Added basic role checks (`authorize` function in `authService.js`) for specific endpoints (e.g., service management, metrics).
- **Enhanced Service Discovery:** Implemented `enhancedServiceDiscovery.js` with service registration, health checks (HTTP GET /health), and unhealthy instance filtering. Integrated into `index.js` for routing requests to microservices.
- **Performance Monitoring:** Added `performanceMonitor.js` service to track request counts, response times (min, max, average), status codes, and errors. Integrated as middleware in `index.js` and exposed metrics endpoints (`/api/metrics`, `/api/metrics/summary`) for admin access.
- **Admin Endpoints:** Added endpoints for viewing service registry (`/api/services`), service health status (`/api/status`), and performance metrics (`/api/metrics`, `/api/metrics/summary`), protected with admin role authorization.
- **API Gateway Health Check:** Added a basic `/health` endpoint for the gateway itself.

### Changed
- **Updated `index.js`:** Refactored to integrate new authentication features, enhanced service discovery (replacing the old one), and performance monitoring middleware and routes.
- **Updated `swagger.yaml`:** Significantly expanded API documentation to include new authentication endpoints, service discovery endpoints, metrics endpoints, detailed request/response schemas, security definitions (bearerAuth), and examples.
- **Refactored Service Integration:** Updated `serviceIntegration.ts` to handle `unknown` error types more safely using type guards (`isAxiosErrorWithResponse`) and helper functions (`getErrorMessage`). Replaced missing `ServiceError` with `InternalServerError`.
- **Placeholder Circuit Breaker:** Added a placeholder `CircuitBreaker` class in `serviceIntegration.ts` to allow compilation, as the original module was missing.

### Fixed
- **TypeScript Errors:** Resolved numerous TypeScript errors across various route files (`segmentationRoutes.ts`, `runnerRoutes.ts`, `archiveRoutes.ts`, `serviceRoutes.ts`) by adding explicit `Request` and `Response` type annotations and correcting method name mismatches when calling service integration methods.
- **Dependency Issues:** Resolved initial `npm install` failures by removing `node_modules` and reinstalling dependencies.

### Removed
- **Old Service Discovery:** Commented out the import and usage of the basic `serviceDiscovery.js` in favor of the enhanced version.
- **Heartbeat Endpoint:** Removed the dedicated `/api/services/:serviceId/heartbeat` endpoint as health checks in the enhanced service discovery serve a similar purpose.

