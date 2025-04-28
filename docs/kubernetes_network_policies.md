# Kubernetes Network Policy Documentation

This document describes the network policy implementation for the ALT_LAS project, explaining the security measures implemented to control pod-to-pod communication within the Kubernetes cluster.

## Overview

Network Policies in Kubernetes act as a firewall for controlling traffic between pods. The ALT_LAS project implements a comprehensive set of network policies following the principle of least privilege, where all traffic is denied by default and only explicitly allowed traffic is permitted.

## Default Deny Policies

Each namespace in the ALT_LAS project has a default deny policy for ingress traffic. This ensures that all incoming traffic to pods is blocked unless explicitly allowed by other network policies.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress-prod
  namespace: alt-las-prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

## Service-Specific Policies

### API Gateway Access

The API Gateway is the entry point for external traffic. Only traffic from the ingress controller is allowed to reach the API Gateway.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-api-gateway-prod
  namespace: alt-las-prod
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: ingress-nginx
      podSelector:
        matchLabels:
          app.kubernetes.io/name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
```

### Backend Services Access

Backend services are only accessible from the API Gateway, enforcing the architecture where all client requests must go through the API Gateway.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway-to-backend-services-prod
  namespace: alt-las-prod
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/component: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8000  # For AI Orchestrator
    - protocol: TCP
      port: 8080  # For Runner Service
```

### Service-to-Service Communication

Specific policies control communication between backend services, allowing only the necessary traffic flows based on the application architecture:

1. AI Orchestrator to Segmentation Service
2. AI Orchestrator to Runner Service
3. Runner Service to Archive Service

Each policy specifies the exact source, destination, and ports allowed.

### Monitoring Access

A separate policy allows monitoring tools (like Prometheus) to access metrics endpoints on all services.

## Environment-Specific Configurations

Network policies are implemented for all environments:
- Development (alt-las-dev)
- Testing (alt-las-test)
- Staging (alt-las-staging)
- Production (alt-las-prod)

Each environment has its own set of policies with appropriate restrictions.

## Security Considerations

1. **Principle of Least Privilege**: Only necessary communication paths are allowed
2. **Defense in Depth**: Multiple layers of network controls
3. **Namespace Isolation**: Traffic between namespaces is controlled
4. **Port Specificity**: Only required ports are exposed
5. **Label-Based Selection**: Policies target pods based on their labels

## Implementation Notes

1. All policies use the Kubernetes NetworkPolicy API (networking.k8s.io/v1)
2. Pod labels must be consistently applied across all deployments
3. The ingress controller namespace must have the appropriate labels
4. Monitoring tools must be deployed in a namespace with the correct labels

## Verification

To verify that network policies are working correctly:
1. Deploy a test pod and attempt to access services that should be blocked
2. Ensure legitimate traffic paths work as expected
3. Use network policy visualization tools to validate the configuration

## Future Enhancements

1. Implement egress policies to control outbound traffic
2. Add more granular policies for specific API endpoints
3. Implement time-based policies for maintenance windows
