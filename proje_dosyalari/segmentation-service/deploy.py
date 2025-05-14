"""
Deployment Script for ALT_LAS Segmentation Service

This script automates the deployment of the Segmentation Service to various environments.
"""

import os
import sys
import subprocess
import logging
import argparse
import yaml
import json
import time
from typing import Dict, Any, List, Optional

# Import deployment configuration
from deployment_config import load_config, generate_docker_compose, generate_kubernetes_manifests, write_file

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("deploy")

def build_docker_image(config: Dict[str, Any]) -> bool:
    """
    Build Docker image
    
    Args:
        config: Configuration dictionary
        
    Returns:
        True if successful, False otherwise
    """
    try:
        image_name = f"{config['registry']}/{config['image_name']}:{config['tag']}"
        
        # Build command
        cmd = ["docker", "build", "-t", image_name, "."]
        
        # Run command
        logger.info(f"Building Docker image: {image_name}")
        subprocess.run(cmd, check=True)
        
        logger.info(f"Successfully built Docker image: {image_name}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error building Docker image: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error building Docker image: {str(e)}")
        return False

def push_docker_image(config: Dict[str, Any]) -> bool:
    """
    Push Docker image to registry
    
    Args:
        config: Configuration dictionary
        
    Returns:
        True if successful, False otherwise
    """
    try:
        image_name = f"{config['registry']}/{config['image_name']}:{config['tag']}"
        
        # Push command
        cmd = ["docker", "push", image_name]
        
        # Run command
        logger.info(f"Pushing Docker image: {image_name}")
        subprocess.run(cmd, check=True)
        
        logger.info(f"Successfully pushed Docker image: {image_name}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error pushing Docker image: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error pushing Docker image: {str(e)}")
        return False

def deploy_docker_compose(config: Dict[str, Any], compose_file: str) -> bool:
    """
    Deploy using Docker Compose
    
    Args:
        config: Configuration dictionary
        compose_file: Path to Docker Compose file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Deploy command
        cmd = ["docker-compose", "-f", compose_file, "up", "-d"]
        
        # Run command
        logger.info(f"Deploying using Docker Compose: {compose_file}")
        subprocess.run(cmd, check=True)
        
        logger.info(f"Successfully deployed using Docker Compose")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error deploying using Docker Compose: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error deploying using Docker Compose: {str(e)}")
        return False

def deploy_kubernetes(config: Dict[str, Any], manifest_dir: str) -> bool:
    """
    Deploy to Kubernetes
    
    Args:
        config: Configuration dictionary
        manifest_dir: Directory containing Kubernetes manifests
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create namespace if it doesn't exist
        namespace = config.get("namespace", "default")
        if namespace != "default":
            cmd = ["kubectl", "create", "namespace", namespace, "--dry-run=client", "-o", "yaml", "|", "kubectl", "apply", "-f", "-"]
            logger.info(f"Creating namespace: {namespace}")
            subprocess.run(" ".join(cmd), shell=True, check=True)
        
        # Apply manifests
        manifest_files = [os.path.join(manifest_dir, f) for f in os.listdir(manifest_dir) if f.endswith(".yaml")]
        
        for manifest_file in manifest_files:
            cmd = ["kubectl", "apply", "-f", manifest_file]
            logger.info(f"Applying Kubernetes manifest: {manifest_file}")
            subprocess.run(cmd, check=True)
        
        logger.info(f"Successfully deployed to Kubernetes")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error deploying to Kubernetes: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error deploying to Kubernetes: {str(e)}")
        return False

def run_tests() -> bool:
    """
    Run tests
    
    Returns:
        True if all tests pass, False otherwise
    """
    try:
        # Run unit tests
        cmd = ["python", "-m", "pytest", "test_*.py", "-v"]
        
        # Run command
        logger.info("Running tests")
        subprocess.run(cmd, check=True)
        
        logger.info("All tests passed")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Tests failed: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error running tests: {str(e)}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Deploy Segmentation Service")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--environment", choices=["development", "staging", "production"], default="development", help="Deployment environment")
    parser.add_argument("--skip-tests", action="store_true", help="Skip running tests")
    parser.add_argument("--skip-build", action="store_true", help="Skip building Docker image")
    parser.add_argument("--skip-push", action="store_true", help="Skip pushing Docker image")
    parser.add_argument("--deployment-type", choices=["docker-compose", "kubernetes"], default="docker-compose", help="Deployment type")
    parser.add_argument("--output-dir", default="./deploy", help="Output directory for deployment files")
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Update configuration based on environment
    if args.environment == "development":
        config["tag"] = "dev"
        config["log_level"] = "DEBUG"
        config["replicas"] = 1
    elif args.environment == "staging":
        config["tag"] = "staging"
        config["log_level"] = "INFO"
        config["replicas"] = 2
    elif args.environment == "production":
        config["tag"] = "latest"
        config["log_level"] = "WARNING"
        config["replicas"] = 3
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Run tests
    if not args.skip_tests:
        if not run_tests():
            logger.error("Tests failed, aborting deployment")
            sys.exit(1)
    
    # Build Docker image
    if not args.skip_build:
        if not build_docker_image(config):
            logger.error("Failed to build Docker image, aborting deployment")
            sys.exit(1)
    
    # Push Docker image
    if not args.skip_push:
        if not push_docker_image(config):
            logger.error("Failed to push Docker image, aborting deployment")
            sys.exit(1)
    
    # Generate deployment files
    if args.deployment_type == "docker-compose":
        # Generate Docker Compose configuration
        docker_compose = generate_docker_compose(config)
        compose_file = os.path.join(args.output_dir, "docker-compose.yml")
        write_file(docker_compose, compose_file)
        
        # Deploy using Docker Compose
        if not deploy_docker_compose(config, compose_file):
            logger.error("Failed to deploy using Docker Compose")
            sys.exit(1)
    elif args.deployment_type == "kubernetes":
        # Generate Kubernetes manifests
        k8s_manifests = generate_kubernetes_manifests(config)
        for filename, content in k8s_manifests.items():
            write_file(content, os.path.join(args.output_dir, filename))
        
        # Deploy to Kubernetes
        if not deploy_kubernetes(config, args.output_dir):
            logger.error("Failed to deploy to Kubernetes")
            sys.exit(1)
    
    logger.info(f"Successfully deployed Segmentation Service to {args.environment} environment")

if __name__ == "__main__":
    main()
