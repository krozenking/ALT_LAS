#!/bin/bash

# Sandbox isolation script for ALT_LAS
# This script sets up isolation for running services in a more secure environment

echo "Setting up ALT_LAS Sandbox Environment..."
echo "========================================"

# Create sandbox user if it doesn't exist
if ! id -u altlas_sandbox > /dev/null 2>&1; then
    echo "Creating sandbox user..."
    sudo useradd -m -s /bin/bash altlas_sandbox
else
    echo "Sandbox user already exists."
fi

# Create sandbox directories
echo "Creating sandbox directories..."
sudo mkdir -p /var/altlas/sandbox
sudo mkdir -p /var/altlas/sandbox/data
sudo mkdir -p /var/altlas/sandbox/logs
sudo mkdir -p /var/altlas/sandbox/tmp

# Set proper permissions
echo "Setting permissions..."
sudo chown -R altlas_sandbox:altlas_sandbox /var/altlas/sandbox
sudo chmod -R 750 /var/altlas/sandbox

# Create policy file
echo "Creating security policy file..."
cat > /tmp/altlas_security_policy.json << EOF
{
  "default_action": "deny",
  "allowed_actions": {
    "filesystem": {
      "read": [
        "/var/altlas/sandbox/data",
        "/var/altlas/sandbox/tmp"
      ],
      "write": [
        "/var/altlas/sandbox/data",
        "/var/altlas/sandbox/logs",
        "/var/altlas/sandbox/tmp"
      ]
    },
    "network": {
      "listen": [
        "127.0.0.1:*"
      ],
      "connect": [
        "127.0.0.1:*",
        "api-gateway:3000",
        "segmentation-service:8000",
        "runner-service:8080",
        "archive-service:9000",
        "postgres:5432",
        "nats:4222"
      ]
    },
    "process": {
      "max_cpu": 80,
      "max_memory": "1G",
      "max_processes": 10
    }
  }
}
EOF

sudo mv /tmp/altlas_security_policy.json /var/altlas/sandbox/security_policy.json
sudo chown altlas_sandbox:altlas_sandbox /var/altlas/sandbox/security_policy.json
sudo chmod 640 /var/altlas/sandbox/security_policy.json

echo "Sandbox environment setup completed."
echo "To run a service in the sandbox: sudo -u altlas_sandbox [command]"
