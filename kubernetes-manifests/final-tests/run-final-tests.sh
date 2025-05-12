#!/bin/bash
set -e

NAMESPACE="alt-las"

echo "Starting Final Tests and Alpha Transition..."

# Apply test resources
echo "Applying test resources..."
kubectl apply -f integration-tests.yaml
kubectl apply -f load-tests.yaml
kubectl apply -f security-tests.yaml
kubectl apply -f acceptance-tests.yaml
kubectl apply -f alpha-transition.yaml

# Run Integration Tests
echo "Running Integration Tests..."
kubectl delete job integration-tests -n ${NAMESPACE} --ignore-not-found
kubectl apply -f integration-tests.yaml

# Wait for Integration Tests to complete
echo "Waiting for Integration Tests to complete..."
kubectl wait --for=condition=complete job/integration-tests -n ${NAMESPACE} --timeout=30m

# Check Integration Tests status
INTEGRATION_TESTS_STATUS=$(kubectl get job integration-tests -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}')
if [ "$INTEGRATION_TESTS_STATUS" != "True" ]; then
  echo "Integration Tests failed. Aborting Alpha transition."
  exit 1
fi

echo "Integration Tests passed!"

# Run Load Tests
echo "Running Load Tests..."
kubectl delete job load-tests -n ${NAMESPACE} --ignore-not-found
kubectl apply -f load-tests.yaml

# Wait for Load Tests to complete
echo "Waiting for Load Tests to complete..."
kubectl wait --for=condition=complete job/load-tests -n ${NAMESPACE} --timeout=30m

# Check Load Tests status
LOAD_TESTS_STATUS=$(kubectl get job load-tests -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}')
if [ "$LOAD_TESTS_STATUS" != "True" ]; then
  echo "Load Tests failed. Aborting Alpha transition."
  exit 1
fi

echo "Load Tests passed!"

# Run Security Tests
echo "Running Security Tests..."
kubectl delete job security-tests -n ${NAMESPACE} --ignore-not-found
kubectl apply -f security-tests.yaml

# Wait for Security Tests to complete
echo "Waiting for Security Tests to complete..."
kubectl wait --for=condition=complete job/security-tests -n ${NAMESPACE} --timeout=30m

# Check Security Tests status
SECURITY_TESTS_STATUS=$(kubectl get job security-tests -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}')
if [ "$SECURITY_TESTS_STATUS" != "True" ]; then
  echo "Security Tests failed. Aborting Alpha transition."
  exit 1
fi

echo "Security Tests passed!"

# Run Acceptance Tests
echo "Running Acceptance Tests..."
kubectl delete job acceptance-tests -n ${NAMESPACE} --ignore-not-found
kubectl apply -f acceptance-tests.yaml

# Wait for Acceptance Tests to complete
echo "Waiting for Acceptance Tests to complete..."
kubectl wait --for=condition=complete job/acceptance-tests -n ${NAMESPACE} --timeout=30m

# Check Acceptance Tests status
ACCEPTANCE_TESTS_STATUS=$(kubectl get job acceptance-tests -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}')
if [ "$ACCEPTANCE_TESTS_STATUS" != "True" ]; then
  echo "Acceptance Tests failed. Aborting Alpha transition."
  exit 1
fi

echo "Acceptance Tests passed!"

# Run Alpha Transition
echo "Running Alpha Transition..."
kubectl delete job alpha-transition -n ${NAMESPACE} --ignore-not-found
kubectl apply -f alpha-transition.yaml

# Wait for Alpha Transition to complete
echo "Waiting for Alpha Transition to complete..."
kubectl wait --for=condition=complete job/alpha-transition -n ${NAMESPACE} --timeout=30m

# Check Alpha Transition status
ALPHA_TRANSITION_STATUS=$(kubectl get job alpha-transition -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}')
if [ "$ALPHA_TRANSITION_STATUS" != "True" ]; then
  echo "Alpha Transition failed."
  exit 1
fi

echo "Alpha Transition completed successfully!"

# Verify Alpha status
ALPHA_STATUS=$(kubectl get configmap alpha-status -n ${NAMESPACE} -o jsonpath='{.data.status}')
if [ "$ALPHA_STATUS" != "active" ]; then
  echo "Alpha status is not active. Alpha transition failed."
  exit 1
fi

echo "Alpha status is active. Alpha transition completed successfully!"

# Get Alpha version
ALPHA_VERSION=$(kubectl get configmap alpha-status -n ${NAMESPACE} -o jsonpath='{.data.version}')
echo "Alpha version: $ALPHA_VERSION"

# Get Alpha transition date
ALPHA_TRANSITION_DATE=$(kubectl get configmap alpha-status -n ${NAMESPACE} -o jsonpath='{.data.transition-date}')
echo "Alpha transition date: $ALPHA_TRANSITION_DATE"

echo "Final Tests and Alpha Transition completed successfully!"
