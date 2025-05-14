"""
Deployment Configuration for ALT_LAS Segmentation Service

This module provides deployment configuration for the Segmentation Service,
including Docker Compose and Kubernetes manifests.
"""

import os
import sys
import logging
import argparse
import yaml
import json
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("deployment_config")

# Docker Compose template
DOCKER_COMPOSE_TEMPLATE = """
version: '3.8'

services:
  segmentation-service:
    image: {registry}/{image_name}:{tag}
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "{external_port}:{internal_port}"
    environment:
      - LOG_LEVEL={log_level}
      - PORT={internal_port}
      - MEMORY_THRESHOLD_MB=500
      - HIGH_MEMORY_THRESHOLD_MB=1000
      - GC_INTERVAL=60
      - MAX_CACHE_SIZE=100
    volumes:
      - segmentation_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:{internal_port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - alt-las-network

volumes:
  segmentation_data:

networks:
  alt-las-network:
    external: true
"""

# Kubernetes Deployment template
K8S_DEPLOYMENT_TEMPLATE = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: segmentation-service
  namespace: {namespace}
  labels:
    app: segmentation-service
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: segmentation-service
  template:
    metadata:
      labels:
        app: segmentation-service
    spec:
      containers:
      - name: segmentation-service
        image: {registry}/{image_name}:{tag}
        ports:
        - containerPort: {internal_port}
        env:
        - name: LOG_LEVEL
          value: "{log_level}"
        - name: PORT
          value: "{internal_port}"
        - name: MEMORY_THRESHOLD_MB
          value: "500"
        - name: HIGH_MEMORY_THRESHOLD_MB
          value: "1000"
        - name: GC_INTERVAL
          value: "60"
        - name: MAX_CACHE_SIZE
          value: "100"
        resources:
          limits:
            cpu: "{cpu_limit}"
            memory: "{memory_limit}"
          requests:
            cpu: "{cpu_request}"
            memory: "{memory_request}"
        livenessProbe:
          httpGet:
            path: /health
            port: {internal_port}
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: {internal_port}
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        volumeMounts:
        - name: segmentation-data
          mountPath: /app/data
      volumes:
      - name: segmentation-data
        persistentVolumeClaim:
          claimName: segmentation-data-pvc
"""

# Kubernetes Service template
K8S_SERVICE_TEMPLATE = """
apiVersion: v1
kind: Service
metadata:
  name: segmentation-service
  namespace: {namespace}
  labels:
    app: segmentation-service
spec:
  selector:
    app: segmentation-service
  ports:
  - port: {external_port}
    targetPort: {internal_port}
    protocol: TCP
  type: ClusterIP
"""

# Kubernetes PVC template
K8S_PVC_TEMPLATE = """
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: segmentation-data-pvc
  namespace: {namespace}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: {storage_size}
  storageClassName: standard
"""

def generate_docker_compose(config: Dict[str, Any]) -> str:
    """
    Generate Docker Compose configuration

    Args:
        config: Configuration dictionary

    Returns:
        Docker Compose configuration as string
    """
    return DOCKER_COMPOSE_TEMPLATE.format(
        registry=config.get("registry", "ghcr.io/krozenking"),
        image_name=config.get("image_name", "alt-las/segmentation-service"),
        tag=config.get("tag", "latest"),
        external_port=config.get("external_port", 8000),
        internal_port=config.get("internal_port", 8000),
        log_level=config.get("log_level", "INFO")
    )

def generate_kubernetes_manifests(config: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate Kubernetes manifests

    Args:
        config: Configuration dictionary

    Returns:
        Dictionary of Kubernetes manifests
    """
    namespace = config.get("namespace", "default")

    deployment = K8S_DEPLOYMENT_TEMPLATE.format(
        namespace=namespace,
        replicas=config.get("replicas", 3),
        registry=config.get("registry", "ghcr.io/krozenking"),
        image_name=config.get("image_name", "alt-las/segmentation-service"),
        tag=config.get("tag", "latest"),
        internal_port=config.get("internal_port", 8000),
        log_level=config.get("log_level", "INFO"),
        cpu_limit=config.get("cpu_limit", "1"),
        memory_limit=config.get("memory_limit", "1Gi"),
        cpu_request=config.get("cpu_request", "500m"),
        memory_request=config.get("memory_request", "512Mi")
    )

    service = K8S_SERVICE_TEMPLATE.format(
        namespace=namespace,
        external_port=config.get("external_port", 8000),
        internal_port=config.get("internal_port", 8000)
    )

    pvc = K8S_PVC_TEMPLATE.format(
        namespace=namespace,
        storage_size=config.get("storage_size", "1Gi")
    )

    return {
        "deployment.yaml": deployment,
        "service.yaml": service,
        "pvc.yaml": pvc
    }

def load_config(config_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Load configuration from file

    Args:
        config_file: Path to configuration file

    Returns:
        Configuration dictionary
    """
    default_config = {
        "registry": "ghcr.io/krozenking",
        "image_name": "alt-las/segmentation-service",
        "tag": "latest",
        "external_port": 8000,
        "internal_port": 8000,
        "log_level": "INFO",
        "namespace": "default",
        "replicas": 3,
        "cpu_limit": "1.5",
        "memory_limit": "1.5Gi",  # Increased memory limit to accommodate NLP models
        "cpu_request": "750m",    # Increased CPU request for better performance
        "memory_request": "768Mi", # Increased memory request to ensure enough memory is allocated
        "storage_size": "2Gi"     # Increased storage size for caching and model storage
    }

    if not config_file:
        logger.info("No configuration file provided, using default configuration")
        return default_config

    try:
        with open(config_file, "r") as f:
            if config_file.endswith(".json"):
                config = json.load(f)
            elif config_file.endswith((".yaml", ".yml")):
                config = yaml.safe_load(f)
            else:
                logger.warning(f"Unsupported configuration file format: {config_file}")
                return default_config

        logger.info(f"Loaded configuration from {config_file}")

        # Merge with default config
        merged_config = default_config.copy()
        merged_config.update(config)

        return merged_config
    except Exception as e:
        logger.error(f"Error loading configuration: {str(e)}")
        return default_config

def write_file(content: str, output_file: str) -> bool:
    """
    Write content to file

    Args:
        content: Content to write
        output_file: Output file path

    Returns:
        True if successful, False otherwise
    """
    try:
        with open(output_file, "w") as f:
            f.write(content)

        logger.info(f"Wrote content to {output_file}")
        return True
    except Exception as e:
        logger.error(f"Error writing to {output_file}: {str(e)}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Deployment configuration for Segmentation Service")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--output-dir", default=".", help="Output directory")
    parser.add_argument("--format", choices=["docker-compose", "kubernetes", "all"], default="all", help="Output format")

    args = parser.parse_args()

    # Load configuration
    config = load_config(args.config)

    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)

    # Generate and write configurations
    if args.format in ["docker-compose", "all"]:
        docker_compose = generate_docker_compose(config)
        write_file(docker_compose, os.path.join(args.output_dir, "docker-compose.yml"))

    if args.format in ["kubernetes", "all"]:
        k8s_manifests = generate_kubernetes_manifests(config)
        for filename, content in k8s_manifests.items():
            write_file(content, os.path.join(args.output_dir, filename))

if __name__ == "__main__":
    main()
