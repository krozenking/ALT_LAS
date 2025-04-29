#!/bin/bash
# Docker Security Scanning Script
# Created by Worker 8 (Security and DevOps Specialist)
# This script integrates multiple Docker security scanning tools:
# - Trivy: For vulnerability scanning
# - Hadolint: For Dockerfile linting
# - Dockle: For container image linting and CIS benchmarks
# - Docker Bench Security: For Docker environment security checks

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME=""
DOCKERFILE_PATH=""
SEVERITY="CRITICAL,HIGH"
OUTPUT_FORMAT="table"
OUTPUT_DIR="./security_reports"
FAIL_ON_SEVERITY="CRITICAL"
SKIP_TOOLS=""

# Function to display usage information
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -i, --image IMAGE_NAME       Docker image to scan (required if no Dockerfile)"
    echo "  -f, --dockerfile PATH        Path to Dockerfile to scan (required if no image)"
    echo "  -s, --severity LEVEL         Severity levels to check (default: CRITICAL,HIGH)"
    echo "  -o, --output FORMAT          Output format: table, json, html (default: table)"
    echo "  -d, --output-dir DIR         Directory to store reports (default: ./security_reports)"
    echo "  -F, --fail-on SEVERITY       Fail on specified severity (default: CRITICAL)"
    echo "  -S, --skip TOOLS             Skip specific tools (comma-separated: trivy,hadolint,dockle,bench)"
    echo "  -h, --help                   Display this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -f|--dockerfile)
            DOCKERFILE_PATH="$2"
            shift 2
            ;;
        -s|--severity)
            SEVERITY="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -d|--output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -F|--fail-on)
            FAIL_ON_SEVERITY="$2"
            shift 2
            ;;
        -S|--skip)
            SKIP_TOOLS="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required arguments
if [[ -z "$IMAGE_NAME" && -z "$DOCKERFILE_PATH" ]]; then
    echo -e "${RED}Error: Either image name (-i) or Dockerfile path (-f) must be provided${NC}"
    usage
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Function to check if a tool is installed
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}Warning: $1 is not installed. Installing...${NC}"
        return 1
    else
        return 0
    fi
}

# Function to check if a tool should be skipped
should_skip() {
    if [[ -z "$SKIP_TOOLS" ]]; then
        return 1
    fi
    
    if [[ "$SKIP_TOOLS" == *"$1"* ]]; then
        echo -e "${YELLOW}Skipping $1 as requested${NC}"
        return 0
    else
        return 1
    fi
}

# Function to install Trivy
install_trivy() {
    echo -e "${BLUE}Installing Trivy...${NC}"
    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
}

# Function to install Hadolint
install_hadolint() {
    echo -e "${BLUE}Installing Hadolint...${NC}"
    curl -sL -o /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
    chmod +x /usr/local/bin/hadolint
}

# Function to install Dockle
install_dockle() {
    echo -e "${BLUE}Installing Dockle...${NC}"
    curl -sL -o dockle.deb https://github.com/goodwithtech/dockle/releases/latest/download/dockle_Linux-64bit.deb
    dpkg -i dockle.deb
    rm dockle.deb
}

# Function to install Docker Bench Security
install_docker_bench() {
    echo -e "${BLUE}Installing Docker Bench Security...${NC}"
    git clone https://github.com/docker/docker-bench-security.git /tmp/docker-bench-security
}

# Function to run Trivy scan
run_trivy() {
    if should_skip "trivy"; then
        return 0
    fi
    
    if ! check_tool "trivy"; then
        install_trivy
    fi
    
    echo -e "${BLUE}Running Trivy vulnerability scanner...${NC}"
    
    TRIVY_ARGS="--severity $SEVERITY"
    
    if [[ "$OUTPUT_FORMAT" == "json" ]]; then
        TRIVY_ARGS="$TRIVY_ARGS --format json"
    elif [[ "$OUTPUT_FORMAT" == "html" ]]; then
        TRIVY_ARGS="$TRIVY_ARGS --format template --template @/contrib/html.tpl"
    fi
    
    if [[ -n "$IMAGE_NAME" ]]; then
        trivy image $TRIVY_ARGS "$IMAGE_NAME" > "$OUTPUT_DIR/trivy-report.$OUTPUT_FORMAT"
    else
        # If only Dockerfile is provided, we can still check for vulnerabilities in base images
        trivy config $TRIVY_ARGS "$DOCKERFILE_PATH" > "$OUTPUT_DIR/trivy-report.$OUTPUT_FORMAT"
    fi
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Trivy scan completed successfully${NC}"
    else
        echo -e "${RED}Trivy found vulnerabilities matching the specified criteria${NC}"
        if [[ "$FAIL_ON_SEVERITY" == *"$(echo $SEVERITY | tr ',' ' ')"* ]]; then
            SCAN_FAILED=true
        fi
    fi
}

# Function to run Hadolint
run_hadolint() {
    if should_skip "hadolint"; then
        return 0
    fi
    
    if [[ -z "$DOCKERFILE_PATH" ]]; then
        echo -e "${YELLOW}Skipping Hadolint: No Dockerfile provided${NC}"
        return 0
    fi
    
    if ! check_tool "hadolint"; then
        install_hadolint
    fi
    
    echo -e "${BLUE}Running Hadolint Dockerfile linter...${NC}"
    
    if [[ "$OUTPUT_FORMAT" == "json" ]]; then
        hadolint -f json "$DOCKERFILE_PATH" > "$OUTPUT_DIR/hadolint-report.json"
    else
        hadolint "$DOCKERFILE_PATH" > "$OUTPUT_DIR/hadolint-report.txt"
    fi
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Hadolint check completed successfully${NC}"
    else
        echo -e "${YELLOW}Hadolint found issues in the Dockerfile${NC}"
    fi
}

# Function to run Dockle
run_dockle() {
    if should_skip "dockle"; then
        return 0
    fi
    
    if [[ -z "$IMAGE_NAME" ]]; then
        echo -e "${YELLOW}Skipping Dockle: No image provided${NC}"
        return 0
    fi
    
    if ! check_tool "dockle"; then
        install_dockle
    fi
    
    echo -e "${BLUE}Running Dockle container linter...${NC}"
    
    DOCKLE_ARGS="--exit-code 1 --exit-level fatal"
    
    if [[ "$OUTPUT_FORMAT" == "json" ]]; then
        DOCKLE_ARGS="$DOCKLE_ARGS --format json"
    fi
    
    dockle $DOCKLE_ARGS "$IMAGE_NAME" > "$OUTPUT_DIR/dockle-report.$OUTPUT_FORMAT"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Dockle check completed successfully${NC}"
    else
        echo -e "${YELLOW}Dockle found issues in the container image${NC}"
    fi
}

# Function to run Docker Bench Security
run_docker_bench() {
    if should_skip "bench"; then
        return 0
    fi
    
    if [[ ! -d "/tmp/docker-bench-security" ]]; then
        install_docker_bench
    fi
    
    echo -e "${BLUE}Running Docker Bench Security...${NC}"
    
    cd /tmp/docker-bench-security
    ./docker-bench-security.sh > "$OUTPUT_DIR/docker-bench-report.txt"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Docker Bench Security check completed successfully${NC}"
    else
        echo -e "${YELLOW}Docker Bench Security found potential issues${NC}"
    fi
}

# Main execution
echo -e "${BLUE}Starting Docker security scanning...${NC}"
echo -e "${BLUE}Reports will be saved to: $OUTPUT_DIR${NC}"

SCAN_FAILED=false

# Run all tools
run_trivy
run_hadolint
run_dockle
run_docker_bench

# Generate summary report
echo -e "${BLUE}Generating summary report...${NC}"
{
    echo "# Docker Security Scan Summary"
    echo "Date: $(date)"
    if [[ -n "$IMAGE_NAME" ]]; then
        echo "Image: $IMAGE_NAME"
    fi
    if [[ -n "$DOCKERFILE_PATH" ]]; then
        echo "Dockerfile: $DOCKERFILE_PATH"
    fi
    echo ""
    echo "## Scan Results"
    echo ""
    
    if ! should_skip "trivy"; then
        echo "### Trivy Vulnerability Scanner"
        if [[ -f "$OUTPUT_DIR/trivy-report.$OUTPUT_FORMAT" ]]; then
            echo "- Report: $OUTPUT_DIR/trivy-report.$OUTPUT_FORMAT"
            if [[ "$OUTPUT_FORMAT" != "json" && "$OUTPUT_FORMAT" != "html" ]]; then
                echo "- Summary: $(grep -c "CRITICAL\\|HIGH" "$OUTPUT_DIR/trivy-report.$OUTPUT_FORMAT") critical/high vulnerabilities found"
            fi
        else
            echo "- No report generated"
        fi
        echo ""
    fi
    
    if ! should_skip "hadolint"; then
        echo "### Hadolint Dockerfile Linter"
        if [[ -f "$OUTPUT_DIR/hadolint-report.txt" || -f "$OUTPUT_DIR/hadolint-report.json" ]]; then
            if [[ -f "$OUTPUT_DIR/hadolint-report.txt" ]]; then
                echo "- Report: $OUTPUT_DIR/hadolint-report.txt"
                echo "- Summary: $(wc -l < "$OUTPUT_DIR/hadolint-report.txt") issues found"
            else
                echo "- Report: $OUTPUT_DIR/hadolint-report.json"
            fi
        else
            echo "- No report generated"
        fi
        echo ""
    fi
    
    if ! should_skip "dockle"; then
        echo "### Dockle Container Linter"
        if [[ -f "$OUTPUT_DIR/dockle-report.$OUTPUT_FORMAT" ]]; then
            echo "- Report: $OUTPUT_DIR/dockle-report.$OUTPUT_FORMAT"
        else
            echo "- No report generated"
        fi
        echo ""
    fi
    
    if ! should_skip "bench"; then
        echo "### Docker Bench Security"
        if [[ -f "$OUTPUT_DIR/docker-bench-report.txt" ]]; then
            echo "- Report: $OUTPUT_DIR/docker-bench-report.txt"
            echo "- Summary: $(grep -c "\\[WARN\\]" "$OUTPUT_DIR/docker-bench-report.txt") warnings found"
        else
            echo "- No report generated"
        fi
    fi
} > "$OUTPUT_DIR/security-scan-summary.md"

echo -e "${GREEN}Security scan complete. Summary report: $OUTPUT_DIR/security-scan-summary.md${NC}"

if [[ "$SCAN_FAILED" == true ]]; then
    echo -e "${RED}Security scan failed due to $FAIL_ON_SEVERITY severity issues${NC}"
    exit 1
fi

exit 0
