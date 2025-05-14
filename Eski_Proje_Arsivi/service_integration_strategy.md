# Service Integration Strategy (Makro Görev 1.3)

This document outlines the strategy for integrating backend microservices (Segmentation, Runner, Archive) with the API Gateway in the ALT_LAS project.

## 1. Communication Protocol

- **Primary Protocol:** HTTP/REST will be used for synchronous request/response communication between the API Gateway and the backend services.
- **Data Format:** JSON will be the standard format for request and response bodies.
- **Schema Definition:** OpenAPI/Swagger specifications will be used to define the API contracts between the API Gateway and backend services, ensuring clear communication and enabling validation.

## 2. Service Discovery

- **Initial Approach:** A configuration-based approach will be implemented initially. Service locations (hostnames/IPs and ports) will be stored in the API Gateway's configuration files or environment variables.
- **Future Enhancement:** Implement dynamic service discovery using a service registry (e.g., Consul, etcd) or leverage platform capabilities (e.g., Kubernetes services) as the project scales.

## 3. API Routing

- **Mechanism:** The API Gateway (Node.js/Express) will act as a reverse proxy.
- **Implementation:** Utilize middleware like `http-proxy-middleware` to route incoming API requests to the appropriate backend service based on URL paths (e.g., `/api/v1/segmentation/*` routes to Segmentation Service).
- **Path Rewriting:** Configure path rewriting as necessary to match the backend service's API structure.

## 4. Load Balancing

- **Initial Approach:** If multiple instances of a service are configured, implement simple round-robin load balancing within the API Gateway's proxy logic.
- **Future Enhancement:** Integrate with more sophisticated load balancing strategies or external load balancers as needed.

## 5. Health Checks

- **Backend Services:** Each backend service (Segmentation, Runner, Archive) should expose a standardized health check endpoint (e.g., `/health`).
- **API Gateway:** The API Gateway will periodically poll these health check endpoints.
- **Integration with Load Balancing:** Unhealthy service instances will be temporarily removed from the load balancing pool.

## 6. Fault Tolerance

- **Retries:** Implement configurable retry mechanisms in the API Gateway for transient network errors when communicating with backend services.
- **Circuit Breaker:** Implement the circuit breaker pattern (e.g., using the `opossum` library) in the API Gateway. This will prevent repeated calls to failing services, allowing them time to recover and preventing cascading failures.
- **Timeouts:** Configure appropriate timeouts for requests to backend services.

## 7. Implementation Steps (API Gateway - Node.js/Express)

1.  **Configuration:** Define service locations in environment variables or a configuration file.
2.  **Proxy Middleware:** Install and configure `http-proxy-middleware` for routing to Segmentation, Runner, and Archive services.
3.  **Service Discovery (Basic):** Implement logic to read service locations from configuration.
4.  **Load Balancing (Basic):** Implement round-robin logic if multiple instances are configured.
5.  **Health Checks:** Implement polling of backend `/health` endpoints and integrate with load balancing logic.
6.  **Circuit Breaker:** Install and configure `opossum` for backend service calls.
7.  **Testing:** Implement integration tests to verify routing, load balancing, health checks, and fault tolerance mechanisms.

