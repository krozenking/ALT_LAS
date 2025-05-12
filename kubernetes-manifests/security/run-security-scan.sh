#!/bin/bash
set -e

NAMESPACE="alt-las"

echo "Starting security scan for namespace: ${NAMESPACE}"

# Apply security scan resources
echo "Applying security scan resources..."
kubectl apply -f trivy-cronjob.yaml
kubectl apply -f kubesec-job.yaml
kubectl apply -f kube-bench-job.yaml
kubectl apply -f security-report-job.yaml

# Run Trivy scan
echo "Running Trivy vulnerability scan..."
kubectl create job --from=cronjob/trivy-scanner trivy-scanner-manual -n ${NAMESPACE}

# Wait for Trivy scan to complete
echo "Waiting for Trivy scan to complete..."
kubectl wait --for=condition=complete job/trivy-scanner-manual -n ${NAMESPACE} --timeout=15m

# Run Kubesec scan
echo "Running Kubesec manifest scan..."
kubectl apply -f kubesec-job.yaml

# Wait for Kubesec scan to complete
echo "Waiting for Kubesec scan to complete..."
kubectl wait --for=condition=complete job/kubesec-scanner -n ${NAMESPACE} --timeout=15m

# Run Kube-bench scan
echo "Running Kube-bench cluster scan..."
kubectl apply -f kube-bench-job.yaml

# Wait for Kube-bench scan to complete
echo "Waiting for Kube-bench scan to complete..."
kubectl wait --for=condition=complete job/kube-bench -n ${NAMESPACE} --timeout=15m

# Generate security report
echo "Generating security report..."
kubectl apply -f security-report-job.yaml

# Wait for report generation to complete
echo "Waiting for report generation to complete..."
kubectl wait --for=condition=complete job/security-report-generator -n ${NAMESPACE} --timeout=5m

# Copy security report to local directory
echo "Copying security report to local directory..."
POD=$(kubectl get pod -l job-name=security-report-generator -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
kubectl cp ${NAMESPACE}/${POD}:/reports/security-report-*.md ./security-report.md

echo "Security scan completed. Report saved to: ./security-report.md"
