#!/usr/bin/env python3
"""
CI/CD Integration for Docker Security Scanning
Created by Worker 8 (Security and DevOps Specialist)

This script integrates Docker security scanning into CI/CD pipelines
for GitHub Actions, GitLab CI, and Jenkins.
"""

import os
import sys
import argparse
import yaml
import json
from pathlib import Path

def create_github_workflow(output_dir):
    """Create GitHub Actions workflow for Docker security scanning"""
    
    workflow = {
        "name": "Docker Security Scan",
        "on": {
            "push": {
                "branches": ["main", "master"],
                "paths": ["**/Dockerfile*", "docker-compose*.yml", "**/docker/**"]
            },
            "pull_request": {
                "branches": ["main", "master"],
                "paths": ["**/Dockerfile*", "docker-compose*.yml", "**/docker/**"]
            },
            "workflow_dispatch": {}
        },
        "jobs": {
            "security-scan": {
                "runs-on": "ubuntu-latest",
                "steps": [
                    {
                        "name": "Checkout code",
                        "uses": "actions/checkout@v3"
                    },
                    {
                        "name": "Set up Docker Buildx",
                        "uses": "docker/setup-buildx-action@v2"
                    },
                    {
                        "name": "Build Docker image",
                        "uses": "docker/build-push-action@v4",
                        "with": {
                            "context": ".",
                            "push": False,
                            "load": True,
                            "tags": "altlas/security-scan:${{ github.sha }}"
                        }
                    },
                    {
                        "name": "Install security scanning tools",
                        "run": "sudo apt-get update && sudo apt-get install -y curl git"
                    },
                    {
                        "name": "Run Trivy vulnerability scanner",
                        "uses": "aquasecurity/trivy-action@master",
                        "with": {
                            "image-ref": "altlas/security-scan:${{ github.sha }}",
                            "format": "table",
                            "exit-code": "1",
                            "ignore-unfixed": True,
                            "vuln-type": "os,library",
                            "severity": "CRITICAL,HIGH"
                        }
                    },
                    {
                        "name": "Run Hadolint Dockerfile linter",
                        "uses": "hadolint/hadolint-action@v3.1.0",
                        "with": {
                            "dockerfile": "Dockerfile"
                        }
                    },
                    {
                        "name": "Run Dockle container linter",
                        "run": """
                        curl -L -o dockle.deb https://github.com/goodwithtech/dockle/releases/latest/download/dockle_Linux-64bit.deb
                        sudo dpkg -i dockle.deb
                        dockle --exit-code 1 --exit-level fatal altlas/security-scan:${{ github.sha }}
                        """
                    },
                    {
                        "name": "Run Docker Bench Security",
                        "run": """
                        git clone https://github.com/docker/docker-bench-security.git
                        cd docker-bench-security
                        sudo sh docker-bench-security.sh -c container_images
                        """
                    },
                    {
                        "name": "Generate security report",
                        "if": "always()",
                        "run": """
                        mkdir -p security-reports
                        echo "# Docker Security Scan Report" > security-reports/report.md
                        echo "Date: $(date)" >> security-reports/report.md
                        echo "Commit: ${{ github.sha }}" >> security-reports/report.md
                        echo "" >> security-reports/report.md
                        echo "## Scan Results" >> security-reports/report.md
                        echo "" >> security-reports/report.md
                        echo "See job logs for detailed results." >> security-reports/report.md
                        """
                    },
                    {
                        "name": "Upload security report",
                        "if": "always()",
                        "uses": "actions/upload-artifact@v3",
                        "with": {
                            "name": "security-reports",
                            "path": "security-reports/"
                        }
                    }
                ]
            }
        }
    }
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Write GitHub Actions workflow file
    with open(os.path.join(output_dir, "docker-security-scan.yml"), "w") as f:
        yaml.dump(workflow, f, sort_keys=False)
    
    print(f"GitHub Actions workflow created: {os.path.join(output_dir, 'docker-security-scan.yml')}")

def create_gitlab_ci(output_dir):
    """Create GitLab CI configuration for Docker security scanning"""
    
    gitlab_ci = """# Docker Security Scanning for GitLab CI
# Created by Worker 8 (Security and DevOps Specialist)

stages:
  - build
  - security-scan
  - report

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
  rules:
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "master"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - changes:
        - "**/Dockerfile*"
        - "docker-compose*.yml"
        - "**/docker/**"

trivy-scan:
  stage: security-scan
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - apk add --no-cache curl
    - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $DOCKER_IMAGE
    - mkdir -p security-reports
    - trivy image --format table --output security-reports/trivy-report.txt --severity CRITICAL,HIGH $DOCKER_IMAGE
  artifacts:
    paths:
      - security-reports/
  allow_failure: true
  rules:
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "master"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

hadolint-scan:
  stage: security-scan
  image: hadolint/hadolint:latest-debian
  script:
    - mkdir -p security-reports
    - hadolint Dockerfile > security-reports/hadolint-report.txt || true
  artifacts:
    paths:
      - security-reports/
  rules:
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "master"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - changes:
        - "**/Dockerfile*"

dockle-scan:
  stage: security-scan
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - apk add --no-cache curl
    - curl -L -o dockle.tar.gz https://github.com/goodwithtech/dockle/releases/latest/download/dockle_Linux-64bit.tar.gz
    - tar xvf dockle.tar.gz
    - mv dockle /usr/local/bin/
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $DOCKER_IMAGE
    - mkdir -p security-reports
    - dockle --format json --output security-reports/dockle-report.json $DOCKER_IMAGE || true
  artifacts:
    paths:
      - security-reports/
  rules:
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "master"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

security-report:
  stage: report
  image: alpine:latest
  script:
    - apk add --no-cache bash
    - |
      cat > security-reports/summary.md << EOF
      # Docker Security Scan Summary
      Date: $(date)
      Image: $DOCKER_IMAGE
      
      ## Scan Results
      
      ### Trivy Vulnerability Scanner
      - See trivy-report.txt for details
      
      ### Hadolint Dockerfile Linter
      - See hadolint-report.txt for details
      
      ### Dockle Container Linter
      - See dockle-report.json for details
      EOF
  artifacts:
    paths:
      - security-reports/
  rules:
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "master"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Write GitLab CI configuration file
    with open(os.path.join(output_dir, ".gitlab-ci.yml"), "w") as f:
        f.write(gitlab_ci)
    
    print(f"GitLab CI configuration created: {os.path.join(output_dir, '.gitlab-ci.yml')}")

def create_jenkins_pipeline(output_dir):
    """Create Jenkins pipeline for Docker security scanning"""
    
    jenkins_pipeline = """// Docker Security Scanning for Jenkins Pipeline
// Created by Worker 8 (Security and DevOps Specialist)

pipeline {
    agent any
    
    triggers {
        pollSCM('H/15 * * * *')
    }
    
    environment {
        DOCKER_IMAGE = "altlas/security-scan:${env.BUILD_ID}"
    }
    
    stages {
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Trivy Scan') {
                    steps {
                        sh '''
                            mkdir -p security-reports
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                            trivy image --format table --output security-reports/trivy-report.txt --severity CRITICAL,HIGH ${DOCKER_IMAGE}
                        '''
                    }
                }
                
                stage('Hadolint Scan') {
                    steps {
                        sh '''
                            mkdir -p security-reports
                            curl -sL -o /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
                            chmod +x /usr/local/bin/hadolint
                            hadolint Dockerfile > security-reports/hadolint-report.txt || true
                        '''
                    }
                }
                
                stage('Dockle Scan') {
                    steps {
                        sh '''
                            mkdir -p security-reports
                            curl -sL -o dockle.deb https://github.com/goodwithtech/dockle/releases/latest/download/dockle_Linux-64bit.deb
                            dpkg -i dockle.deb
                            dockle --format json --output security-reports/dockle-report.json ${DOCKER_IMAGE} || true
                        '''
                    }
                }
                
                stage('Docker Bench Security') {
                    steps {
                        sh '''
                            mkdir -p security-reports
                            git clone https://github.com/docker/docker-bench-security.git
                            cd docker-bench-security
                            ./docker-bench-security.sh -c container_images > ../security-reports/docker-bench-report.txt
                        '''
                    }
                }
            }
        }
        
        stage('Generate Report') {
            steps {
                sh '''
                    cat > security-reports/summary.md << EOF
                    # Docker Security Scan Summary
                    Date: $(date)
                    Image: ${DOCKER_IMAGE}
                    
                    ## Scan Results
                    
                    ### Trivy Vulnerability Scanner
                    - See trivy-report.txt for details
                    
                    ### Hadolint Dockerfile Linter
                    - See hadolint-report.txt for details
                    
                    ### Dockle Container Linter
                    - See dockle-report.json for details
                    
                    ### Docker Bench Security
                    - See docker-bench-report.txt for details
                    EOF
                '''
                
                archiveArtifacts artifacts: 'security-reports/**', allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Write Jenkins pipeline file
    with open(os.path.join(output_dir, "Jenkinsfile"), "w") as f:
        f.write(jenkins_pipeline)
    
    print(f"Jenkins pipeline created: {os.path.join(output_dir, 'Jenkinsfile')}")

def main():
    parser = argparse.ArgumentParser(description="Generate CI/CD configurations for Docker security scanning")
    parser.add_argument("--github", action="store_true", help="Generate GitHub Actions workflow")
    parser.add_argument("--gitlab", action="store_true", help="Generate GitLab CI configuration")
    parser.add_argument("--jenkins", action="store_true", help="Generate Jenkins pipeline")
    parser.add_argument("--all", action="store_true", help="Generate all CI/CD configurations")
    parser.add_argument("--output-dir", default="./ci_cd", help="Output directory for CI/CD configurations")
    
    args = parser.parse_args()
    
    if not (args.github or args.gitlab or args.jenkins or args.all):
        parser.print_help()
        return
    
    if args.all or args.github:
        create_github_workflow(args.output_dir)
    
    if args.all or args.gitlab:
        create_gitlab_ci(args.output_dir)
    
    if args.all or args.jenkins:
        create_jenkins_pipeline(args.output_dir)
    
    print(f"CI/CD configurations generated in {args.output_dir}")

if __name__ == "__main__":
    main()
