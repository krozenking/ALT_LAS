# Policy Enforcement Service

This service is responsible for managing and evaluating security policies within the ALT_LAS ecosystem.

## Current Status

- Basic CRUD operations for policies (Create, Read, List) are implemented.
- A health check endpoint is available.
- An evaluation endpoint is available but currently returns a placeholder response.
- The service is built with Rust and Actix-web.

## Running the Service

1.  Navigate to the service directory: `cd /home/ubuntu/ALT_LAS/security/policy-enforcement-service`
2.  Build the service: `cargo build`
3.  Run the service: `./target/debug/policy-enforcement-service`
    The service will run on `0.0.0.0:8003` by default.

## API Endpoints

- `GET /health`:
    - Description: Checks the health of the service.
    - Response: `{"status":"ok","service":"Policy Enforcement Service","version":"0.1.0"}`
- `POST /policies`:
    - Description: Creates a new policy.
    - Request Body: `{"name": "string", "rules": ["string"], "is_active": boolean}`
    - Response: The created policy object including its new `id`.
      `{"id":"uuid","name":"string","rules":["string"],"is_active":boolean}`
- `GET /policies`:
    - Description: Retrieves a list of all policies.
    - Response: An array of policy objects.
      `[{"id":"uuid","name":"string","rules":["string"],"is_active":boolean}, ...]`
- `GET /policies/{policy_id}`:
    - Description: Retrieves a specific policy by its ID.
    - Path Parameter: `policy_id` (string, UUID format)
    - Response: The requested policy object or a 404 error if not found.
      `{"id":"uuid","name":"string","rules":["string"],"is_active":boolean}`
- `POST /evaluate`:
    - Description: Evaluates a request against defined policies (currently a placeholder).
    - Request Body: `{"context": "string"}`
    - Response: `{"decision":"Permit","reason":"Policy evaluation is a placeholder."}`

## Future Development

- Implement actual policy evaluation logic in the `/evaluate` endpoint.
- Integrate with other ALT_LAS services (e.g., Sandbox Manager, Audit Service).
- Enhance policy rule definition and storage (e.g., using a database instead of in-memory).

