#!/bin/bash

# Secret Scanner for ALT_LAS
# This script scans the codebase for potential secrets and sensitive information

echo "Running ALT_LAS Secret Scanner..."
echo "================================="

# Define patterns to search for
PATTERNS=(
  "password"
  "secret"
  "token"
  "key"
  "api[_-]key"
  "auth"
  "credential"
  "BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY"
  "access[_-]key"
)

# Define files to exclude
EXCLUDE_DIRS=(
  "node_modules"
  ".git"
  "target"
  "__pycache__"
)

# Create exclude pattern for grep
EXCLUDE_PATTERN=""
for dir in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_PATTERN="$EXCLUDE_PATTERN --exclude-dir=$dir"
done

# Create output directory
REPORT_DIR="../security_reports"
mkdir -p $REPORT_DIR

# Get current date for report filename
DATE=$(date +"%Y-%m-%d")
REPORT_FILE="$REPORT_DIR/secret_scan_$DATE.txt"

echo "Scanning repository for potential secrets..."
echo "Results will be saved to $REPORT_FILE"
echo "" > $REPORT_FILE

# Scan for each pattern
for pattern in "${PATTERNS[@]}"; do
  echo -e "\nSearching for pattern: $pattern" | tee -a $REPORT_FILE
  grep -r -i -n $EXCLUDE_PATTERN "$pattern" ../ | grep -v "secret_scanner.sh" | tee -a $REPORT_FILE
done

# Check for high entropy strings (potential keys/tokens)
echo -e "\nSearching for high entropy strings (potential keys/tokens)..." | tee -a $REPORT_FILE
find ../ -type f -not -path "*/\.*" -not -path "*/node_modules/*" -not -path "*/__pycache__/*" -not -path "*/target/*" | xargs grep -l -E "[A-Za-z0-9/+]{40,}" | tee -a $REPORT_FILE

echo -e "\nSecret scan completed. Please review $REPORT_FILE for potential secrets."
echo "WARNING: This is an automated scan and may contain false positives."
echo "Review each finding manually before taking action."
echo "Consider using a secret management solution like HashiCorp Vault or AWS Secrets Manager."
