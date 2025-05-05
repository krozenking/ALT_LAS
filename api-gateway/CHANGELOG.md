## [Unreleased] - 2025-05-05

### Added
- **Session Management API:** Implemented endpoints for managing user sessions in `sessionRoutes.ts`:
  - `GET /api/v1/sessions`: List active sessions for the authenticated user.
  - `DELETE /api/v1/sessions/:sessionId`: Terminate a specific session.
  - `DELETE /api/v1/sessions/all`: Terminate all sessions for the authenticated user.
- **Session Route Permissions:** Added route permissions for the new session management endpoints in `sessionRoutes.ts` using `routeAuthManager`.

### Fixed
- **Open Handles in Tests:** Resolved open handles detected by `jest --detectOpenHandles`:
  - Modified `sessionService.ts` and `rateLimiter.ts` to conditionally create `setInterval` timers only when `NODE_ENV` is not `test`, and added cleanup functions.
  - Modified `index.ts` to conditionally start the HTTP server only when `NODE_ENV` is not `test`, and implemented graceful shutdown logic to close the server and clean up resources.
- **Session API Test Failures:** Addressed multiple issues causing session management tests to fail:
  - Fixed 404 errors by implementing the missing session routes (`sessionRoutes.ts`) and integrating them into the application (`index.ts`).
  - Fixed 403 errors by correcting the path matching logic in `routeAuthMiddleware.ts` and ensuring correct full paths were used when adding route permissions in `sessionRoutes.ts`.
  - Fixed routing issue where `DELETE /api/v1/sessions/all` was incorrectly matched by `DELETE /api/v1/sessions/:sessionId` by reordering the route definitions in `sessionRoutes.ts`.
  - Fixed TypeScript errors in `sessionRoutes.ts` related to incorrect error handling syntax and duplicate default exports.
- **TypeScript Errors:** Resolved multiple TypeScript compilation errors in `healthRoutes.ts`, `passwordRoutes.ts`, and `passwordResetService.ts` related to return types, unknown error types, type mismatches, null/undefined checks, and incorrect method usage.
- **Redis Test Environment:** Implemented a mock Redis client in `redisClient.ts` for the `NODE_ENV=test` environment. This prevents tests from attempting to connect to a real Redis instance, resolving timeout issues and open handle warnings related to Redis during testing.

### Changed
- **Route Authorization Middleware:** Updated `routeAuthMiddleware.ts` to construct the full path pattern (`basePath + routePattern`) for more accurate permission checking against registered routes.
- **Pushed Current Progress:** Committed and pushed the current state of the API Gateway codebase to GitHub before addressing outstanding issues.
- **Prepared for Fixes:** Set up the environment to address TypeScript compilation errors in the authorization service and implement the Redis connection fix for the test environment.

## [Unreleased] - 2025-05-02

### Added
- **User Management API:** Implemented basic CRUD operations for users via `/api/v1/users` endpoints.
  - Added `userService.ts` with in-memory user storage and logic for create, get all, get by ID, update, delete, and get details for auth.
  - Added `userRoutes.ts` to define Express routes for user management.
  - Integrated `userRoutes` into `index.ts`, applying JWT authentication.
- **User Service Tests:** Added unit tests (`userService.test.ts`) covering the functionality of `userService.ts`.
- **Test Configuration:** Created a dedicated TypeScript configuration for tests (`tsconfig.test.json`) to ensure correct compilation during testing.

### Fixed
- **TypeScript Syntax Errors:** Resolved persistent TypeScript syntax errors encountered during testing, primarily caused by an invalid regex pattern (containing newline characters) used for email validation in `userService.ts`.
- **Jest Configuration:** Updated `jest.config.js` to explicitly use `tsconfig.test.json` and define the transformation for `.ts` files, resolving issues with `ts-jest` processing.

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



