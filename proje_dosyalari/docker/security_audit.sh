#!/bin/bash

# Security audit script for ALT_LAS
# This script performs basic security checks on the project

echo "Running ALT_LAS Security Audit..."
echo "=================================="

# Check for sensitive information in the codebase
echo -e "\n[1/5] Checking for sensitive information..."
grep -r --include="*.{js,py,rs,go,yml,yaml,json,md}" "password\|secret\|key\|token" --exclude-dir=node_modules ../

# Check Docker security
echo -e "\n[2/5] Checking Docker security..."
if [ -f ../api-gateway/Dockerfile ]; then
    echo "Analyzing api-gateway Dockerfile..."
    grep -i "user" ../api-gateway/Dockerfile || echo "WARNING: No USER instruction found in api-gateway Dockerfile"
fi

if [ -f ../segmentation-service/Dockerfile ]; then
    echo "Analyzing segmentation-service Dockerfile..."
    grep -i "user" ../segmentation-service/Dockerfile || echo "WARNING: No USER instruction found in segmentation-service Dockerfile"
fi

if [ -f ../runner-service/Dockerfile ]; then
    echo "Analyzing runner-service Dockerfile..."
    grep -i "user" ../runner-service/Dockerfile || echo "WARNING: No USER instruction found in runner-service Dockerfile"
fi

if [ -f ../archive-service/Dockerfile ]; then
    echo "Analyzing archive-service Dockerfile..."
    grep -i "user" ../archive-service/Dockerfile || echo "WARNING: No USER instruction found in archive-service Dockerfile"
fi

# Check for GitHub Actions security
echo -e "\n[3/5] Checking GitHub Actions security..."
if [ -d ../.github/workflows ]; then
    echo "GitHub Actions workflows found. Checking for security best practices..."
    grep -r "secrets" ../.github/workflows/
else
    echo "No GitHub Actions workflows found."
fi

# Check for exposed ports
echo -e "\n[4/5] Checking for exposed ports in docker-compose.yml..."
grep -A 2 "ports:" ../docker/docker-compose.yml

# Check for health checks
echo -e "\n[5/5] Checking for health checks in docker-compose.yml..."
grep -A 5 "healthcheck:" ../docker/docker-compose.yml

echo -e "\nSecurity audit completed."
echo "Please review the findings and address any security concerns."
