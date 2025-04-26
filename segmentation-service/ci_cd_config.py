"""
CI/CD Configuration for ALT_LAS Segmentation Service

This module provides CI/CD configuration for the Segmentation Service,
including Docker Compose setup and deployment scripts.
"""

import os
import sys
import subprocess
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
logger = logging.getLogger("ci_cd_config")

class CICDConfig:
    """CI/CD configuration for Segmentation Service"""
    
    def __init__(self, config_file: Optional[str] = None):
        """
        Initialize CI/CD configuration
        
        Args:
            config_file: Path to configuration file
        """
        self.config_file = config_file
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from file
        
        Returns:
            Configuration dictionary
        """
        default_config = {
            "service_name": "segmentation-service",
            "docker": {
                "image_name": "alt-las/segmentation-service",
                "registry": "ghcr.io/krozenking",
                "build_args": {},
                "ports": {
                    "internal": 8000,
                    "external": 8000
                }
            },
            "environments": {
                "development": {
                    "replicas": 1,
                    "resources": {
                        "cpu": "0.5",
                        "memory": "512Mi"
                    },
                    "env_vars": {
                        "LOG_LEVEL": "DEBUG"
                    }
                },
                "staging": {
                    "replicas": 2,
                    "resources": {
                        "cpu": "1",
                        "memory": "1Gi"
                    },
                    "env_vars": {
                        "LOG_LEVEL": "INFO"
                    }
                },
                "production": {
                    "replicas": 3,
                    "resources": {
                        "cpu": "2",
                        "memory": "2Gi"
                    },
                    "env_vars": {
                        "LOG_LEVEL": "WARNING"
                    }
                }
            }
        }
        
        if not self.config_file:
            logger.info("No configuration file provided, using default configuration")
            return default_config
        
        try:
            with open(self.config_file, "r") as f:
                if self.config_file.endswith(".json"):
                    config = json.load(f)
                elif self.config_file.endswith((".yaml", ".yml")):
                    config = yaml.safe_load(f)
                else:
                    logger.warning(f"Unsupported configuration file format: {self.config_file}")
                    return default_config
            
            logger.info(f"Loaded configuration from {self.config_file}")
            return config
        except Exception as e:
            logger.error(f"Error loading configuration: {str(e)}")
            return default_config
    
    def generate_docker_compose(self, environment: str = "development") -> str:
        """
        Generate Docker Compose configuration
        
        Args:
            environment: Environment name
            
        Returns:
            Docker Compose configuration as YAML string
        """
        if environment not in self.config["environments"]:
            logger.warning(f"Environment {environment} not found in configuration, using development")
            environment = "development"
        
        env_config = self.config["environments"][environment]
        
        compose_config = {
            "version": "3.8",
            "services": {
                self.config["service_name"]: {
                    "image": f"{self.config['docker']['registry']}/{self.config['docker']['image_name']}:latest",
                    "build": {
                        "context": ".",
                        "dockerfile": "Dockerfile",
                        "args": self.config["docker"]["build_args"]
                    },
                    "ports": [
                        f"{self.config['docker']['ports']['external']}:{self.config['docker']['ports']['internal']}"
                    ],
                    "environment": env_config["env_vars"],
                    "deploy": {
                        "replicas": env_config["replicas"],
                        "resources": {
                            "limits": {
                                "cpus": env_config["resources"]["cpu"],
                                "memory": env_config["resources"]["memory"]
                            }
                        }
                    },
                    "healthcheck": {
                        "test": ["CMD", "curl", "-f", f"http://localhost:{self.config['docker']['ports']['internal']}/health"],
                        "interval": "30s",
                        "timeout": "10s",
                        "retries": 3,
                        "start_period": "30s"
                    },
                    "restart": "unless-stopped"
                }
            }
        }
        
        return yaml.dump(compose_config, default_flow_style=False)
    
    def generate_kubernetes_config(self, environment: str = "development") -> str:
        """
        Generate Kubernetes configuration
        
        Args:
            environment: Environment name
            
        Returns:
            Kubernetes configuration as YAML string
        """
        if environment not in self.config["environments"]:
            logger.warning(f"Environment {environment} not found in configuration, using development")
            environment = "development"
        
        env_config = self.config["environments"][environment]
        
        # Create environment variables list
        env_vars = []
        for key, value in env_config["env_vars"].items():
            env_vars.append({
                "name": key,
                "value": str(value)
            })
        
        # Create deployment
        deployment = {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {
                "name": self.config["service_name"],
                "namespace": environment,
                "labels": {
                    "app": self.config["service_name"]
                }
            },
            "spec": {
                "replicas": env_config["replicas"],
                "selector": {
                    "matchLabels": {
                        "app": self.config["service_name"]
                    }
                },
                "template": {
                    "metadata": {
                        "labels": {
                            "app": self.config["service_name"]
                        }
                    },
                    "spec": {
                        "containers": [
                            {
                                "name": self.config["service_name"],
                                "image": f"{self.config['docker']['registry']}/{self.config['docker']['image_name']}:latest",
                                "ports": [
                                    {
                                        "containerPort": self.config["docker"]["ports"]["internal"]
                                    }
                                ],
                                "env": env_vars,
                                "resources": {
                                    "limits": {
                                        "cpu": env_config["resources"]["cpu"],
                                        "memory": env_config["resources"]["memory"]
                                    },
                                    "requests": {
                                        "cpu": str(float(env_config["resources"]["cpu"]) / 2),
                                        "memory": str(int(env_config["resources"]["memory"].replace("Gi", "")) * 512) + "Mi"
                                    }
                                },
                                "livenessProbe": {
                                    "httpGet": {
                                        "path": "/health",
                                        "port": self.config["docker"]["ports"]["internal"]
                                    },
                                    "initialDelaySeconds": 30,
                                    "periodSeconds": 30,
                                    "timeoutSeconds": 10,
                                    "failureThreshold": 3
                                },
                                "readinessProbe": {
                                    "httpGet": {
                                        "path": "/health",
                                        "port": self.config["docker"]["ports"]["internal"]
                                    },
                                    "initialDelaySeconds": 10,
                                    "periodSeconds": 10,
                                    "timeoutSeconds": 5,
                                    "failureThreshold": 3
                                }
                            }
                        ]
                    }
                }
            }
        }
        
        # Create service
        service = {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
                "name": self.config["service_name"],
                "namespace": environment,
                "labels": {
                    "app": self.config["service_name"]
                }
            },
            "spec": {
                "selector": {
                    "app": self.config["service_name"]
                },
                "ports": [
                    {
                        "port": self.config["docker"]["ports"]["external"],
                        "targetPort": self.config["docker"]["ports"]["internal"],
                        "protocol": "TCP"
                    }
                ],
                "type": "ClusterIP"
            }
        }
        
        # Combine deployment and service
        k8s_config = yaml.dump_all([deployment, service], default_flow_style=False)
        
        return k8s_config
    
    def build_docker_image(self) -> bool:
        """
        Build Docker image
        
        Returns:
            True if successful, False otherwise
        """
        try:
            image_name = f"{self.config['docker']['registry']}/{self.config['docker']['image_name']}:latest"
            
            # Build command
            cmd = ["docker", "build", "-t", image_name, "."]
            
            # Add build args
            for key, value in self.config["docker"]["build_args"].items():
                cmd.extend(["--build-arg", f"{key}={value}"])
            
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
    
    def push_docker_image(self) -> bool:
        """
        Push Docker image to registry
        
        Returns:
            True if successful, False otherwise
        """
        try:
            image_name = f"{self.config['docker']['registry']}/{self.config['docker']['image_name']}:latest"
            
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
    
    def deploy(self, environment: str = "development") -> bool:
        """
        Deploy to environment
        
        Args:
            environment: Environment name
            
        Returns:
            True if successful, False otherwise
        """
        if environment not in self.config["environments"]:
            logger.warning(f"Environment {environment} not found in configuration, using development")
            environment = "development"
        
        try:
            # Generate Docker Compose configuration
            compose_config = self.generate_docker_compose(environment)
            
            # Write Docker Compose configuration to file
            compose_file = f"docker-compose.{environment}.yml"
            with open(compose_file, "w") as f:
                f.write(compose_config)
            
            # Deploy command
            cmd = ["docker-compose", "-f", compose_file, "up", "-d"]
            
            # Run command
            logger.info(f"Deploying to {environment} environment")
            subprocess.run(cmd, check=True)
            
            logger.info(f"Successfully deployed to {environment} environment")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Error deploying to {environment} environment: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deploying to {environment} environment: {str(e)}")
            return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="CI/CD configuration for Segmentation Service")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--environment", default="development", help="Environment name")
    parser.add_argument("--action", choices=["generate", "build", "push", "deploy"], default="generate", help="Action to perform")
    parser.add_argument("--output", help="Output file")
    
    args = parser.parse_args()
    
    # Create CI/CD configuration
    ci_cd_config = CICDConfig(args.config)
    
    # Perform action
    if args.action == "generate":
        # Generate Docker Compose configuration
        compose_config = ci_cd_config.generate_docker_compose(args.environment)
        
        # Generate Kubernetes configuration
        k8s_config = ci_cd_config.generate_kubernetes_config(args.environment)
        
        # Write configurations to files
        if args.output:
            with open(f"{args.output}.docker-compose.yml", "w") as f:
                f.write(compose_config)
            
            with open(f"{args.output}.kubernetes.yml", "w") as f:
                f.write(k8s_config)
            
            logger.info(f"Wrote Docker Compose configuration to {args.output}.docker-compose.yml")
            logger.info(f"Wrote Kubernetes configuration to {args.output}.kubernetes.yml")
        else:
            print("Docker Compose configuration:")
            print(compose_config)
            print("\nKubernetes configuration:")
            print(k8s_config)
    elif args.action == "build":
        # Build Docker image
        ci_cd_config.build_docker_image()
    elif args.action == "push":
        # Push Docker image
        ci_cd_config.push_docker_image()
    elif args.action == "deploy":
        # Deploy to environment
        ci_cd_config.deploy(args.environment)

if __name__ == "__main__":
    main()
