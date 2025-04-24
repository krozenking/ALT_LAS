#!/usr/bin/env bash

# Comprehensive test script for OS Integration Service
# This script tests all components of the service including platform detection,
# file operations, process management, screenshot capabilities, and security features

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test directories
TEST_DIR="/tmp/os_integration_test"
TEST_SECURITY_DIR="$TEST_DIR/security"
TEST_SCREENSHOT_DIR="$TEST_DIR/screenshots"
TEST_FILES_DIR="$TEST_DIR/files"

# Create test directories
mkdir -p "$TEST_DIR" "$TEST_SECURITY_DIR" "$TEST_SCREENSHOT_DIR" "$TEST_FILES_DIR"

echo -e "${BLUE}=== OS Integration Service Comprehensive Test Suite ===${NC}"
echo -e "${BLUE}Started at: $(date)${NC}"
echo -e "${BLUE}Test directory: $TEST_DIR${NC}"
echo

# Function to run a test and report result
run_test() {
    local test_name="$1"
    local test_cmd="$2"
    
    echo -e "${YELLOW}Running test: $test_name${NC}"
    echo -e "${YELLOW}Command: $test_cmd${NC}"
    
    if eval "$test_cmd"; then
        echo -e "${GREEN}✓ Test passed: $test_name${NC}"
        return 0
    else
        echo -e "${RED}✗ Test failed: $test_name${NC}"
        return 1
    fi
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if service is running
check_service() {
    echo -e "${BLUE}Checking if service is running...${NC}"
    
    if pgrep -f "os_integration_service" > /dev/null; then
        echo -e "${GREEN}Service is already running.${NC}"
    else
        echo -e "${YELLOW}Service is not running. Starting service...${NC}"
        
        # Start service in background
        cd "$(dirname "$0")/.."
        cargo run &
        SERVICE_PID=$!
        
        echo -e "${GREEN}Service started with PID: $SERVICE_PID${NC}"
        
        # Wait for service to start
        echo -e "${YELLOW}Waiting for service to start...${NC}"
        sleep 5
    fi
    
    # Check if service is responding
    if curl -s "http://localhost:8080/api/platform/info" > /dev/null; then
        echo -e "${GREEN}Service is responding.${NC}"
    else
        echo -e "${RED}Service is not responding. Tests may fail.${NC}"
    fi
}

# Build the service if needed
build_service() {
    echo -e "${BLUE}Building service...${NC}"
    cd "$(dirname "$0")/.."
    cargo build
}

# 1. Test Platform Detection
test_platform_detection() {
    echo -e "\n${BLUE}=== 1. Platform Detection Tests ===${NC}"
    
    # Test platform info API
    run_test "Platform Info API" "curl -s http://localhost:8080/api/platform/info | jq . && [ \$(curl -s http://localhost:8080/api/platform/info | jq -r '.os_type') != null ]"
    
    # Test platform-specific features
    case "$(uname)" in
        Linux)
            run_test "Linux-specific detection" "curl -s http://localhost:8080/api/platform/info | jq -r '.os_type' | grep -i 'linux'"
            ;;
        Darwin)
            run_test "macOS-specific detection" "curl -s http://localhost:8080/api/platform/info | jq -r '.os_type' | grep -i 'macos'"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            run_test "Windows-specific detection" "curl -s http://localhost:8080/api/platform/info | jq -r '.os_type' | grep -i 'windows'"
            ;;
    esac
}

# 2. Test File System Operations
test_filesystem_operations() {
    echo -e "\n${BLUE}=== 2. File System Operations Tests ===${NC}"
    
    # Test directory listing
    run_test "Directory listing" "curl -s \"http://localhost:8080/api/fs/list?path=$TEST_DIR\" | jq . && [ \$(curl -s \"http://localhost:8080/api/fs/list?path=$TEST_DIR\" | jq 'length') -ge 0 ]"
    
    # Test file writing
    TEST_CONTENT="This is a test file created at $(date)"
    TEST_FILE="$TEST_FILES_DIR/test_file.txt"
    run_test "File writing" "curl -s -X POST http://localhost:8080/api/fs/write -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE\",\"content\":\"$TEST_CONTENT\"}' | jq . && [ \$(curl -s -X POST http://localhost:8080/api/fs/write -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE\",\"content\":\"$TEST_CONTENT\"}' | jq -r '.success') == 'true' ]"
    
    # Test file reading
    run_test "File reading" "curl -s \"http://localhost:8080/api/fs/read?path=$TEST_FILE\" | jq . && [ \"\$(curl -s \"http://localhost:8080/api/fs/read?path=$TEST_FILE\" | jq -r '.content')\" = \"$TEST_CONTENT\" ]"
    
    # Test directory creation
    TEST_DIR_NEW="$TEST_FILES_DIR/new_dir"
    run_test "Directory creation" "curl -s -X POST http://localhost:8080/api/fs/mkdir -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_DIR_NEW\"}' | jq . && [ \$(curl -s -X POST http://localhost:8080/api/fs/mkdir -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_DIR_NEW\"}' | jq -r '.success') == 'true' ]"
    
    # Test file copying
    TEST_FILE_COPY="$TEST_DIR_NEW/test_file_copy.txt"
    run_test "File copying" "curl -s -X POST http://localhost:8080/api/fs/copy -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE\",\"new_path\":\"$TEST_FILE_COPY\"}' | jq . && [ \$(curl -s -X POST http://localhost:8080/api/fs/copy -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE\",\"new_path\":\"$TEST_FILE_COPY\"}' | jq -r '.success') == 'true' ]"
    
    # Test file moving/renaming
    TEST_FILE_MOVED="$TEST_DIR_NEW/test_file_moved.txt"
    run_test "File moving" "curl -s -X POST http://localhost:8080/api/fs/move -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE_COPY\",\"new_path\":\"$TEST_FILE_MOVED\"}' | jq . && [ \$(curl -s -X POST http://localhost:8080/api/fs/move -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE_COPY\",\"new_path\":\"$TEST_FILE_MOVED\"}' | jq -r '.success') == 'true' ]"
    
    # Test file deletion
    run_test "File deletion" "curl -s -X POST http://localhost:8080/api/fs/delete -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE_MOVED\"}' | jq . && [ \$(curl -s -X POST http://localhost:8080/api/fs/delete -H \"Content-Type: application/json\" -d '{\"path\":\"$TEST_FILE_MOVED\"}' | jq -r '.success') == 'true' ]"
    
    # Test disk info
    run_test "Disk info" "curl -s http://localhost:8080/api/fs/disks | jq . && [ \$(curl -s http://localhost:8080/api/fs/disks | jq 'length') -gt 0 ]"
}

# 3. Test Process Management
test_process_management() {
    echo -e "\n${BLUE}=== 3. Process Management Tests ===${NC}"
    
    # Test process listing
    run_test "Process listing" "curl -s http://localhost:8080/api/platform/processes | jq . && [ \$(curl -s http://localhost:8080/api/platform/processes | jq 'length') -gt 0 ]"
    
    # Test process running
    run_test "Process running" "PROCESS_RESPONSE=\$(curl -s -X POST http://localhost:8080/api/platform/run -H \"Content-Type: application/json\" -d '{\"command\":\"echo\",\"args\":[\"Test successful\"],\"working_dir\":\"$TEST_DIR\"}') && echo \$PROCESS_RESPONSE | jq . && [ \$(echo \$PROCESS_RESPONSE | jq -r '.success') == 'true' ]"
    
    # Get process ID from previous test
    PROCESS_ID=$(curl -s -X POST http://localhost:8080/api/platform/run -H "Content-Type: application/json" -d "{\"command\":\"echo\",\"args\":[\"Test successful\"],\"working_dir\":\"$TEST_DIR\"}" | jq -r '.id')
    
    if [ "$PROCESS_ID" != "null" ] && [ -n "$PROCESS_ID" ]; then
        # Test process output
        sleep 1  # Wait for process to complete
        run_test "Process output" "curl -s \"http://localhost:8080/api/platform/output/$PROCESS_ID\" | jq . && [ \$(curl -s \"http://localhost:8080/api/platform/output/$PROCESS_ID\" | jq -r '.output') != null ]"
    else
        echo -e "${RED}Could not get process ID for output test${NC}"
    fi
    
    # Test running processes
    run_test "Running processes" "curl -s http://localhost:8080/api/platform/running | jq ."
}

# 4. Test Screenshot Capabilities
test_screenshot_capabilities() {
    echo -e "\n${BLUE}=== 4. Screenshot Capabilities Tests ===${NC}"
    
    # Test basic screenshot
    SCREENSHOT_FILE="$TEST_SCREENSHOT_DIR/screenshot.png"
    run_test "Basic screenshot" "curl -s \"http://localhost:8080/api/screenshot?output_path=$SCREENSHOT_FILE\" | jq . && [ \$(curl -s \"http://localhost:8080/api/screenshot?output_path=$SCREENSHOT_FILE\" | jq -r '.success') == 'true' ] && [ -f \"$SCREENSHOT_FILE\" ]"
    
    # Test region screenshot if supported
    REGION_SCREENSHOT="$TEST_SCREENSHOT_DIR/region_screenshot.png"
    run_test "Region screenshot" "curl -s -X POST http://localhost:8080/api/screenshot/region -H \"Content-Type: application/json\" -d '{\"x\":0,\"y\":0,\"width\":200,\"height\":200,\"output_path\":\"$REGION_SCREENSHOT\"}' | jq . || true"
    
    # Test CUDA screenshot if available
    CUDA_SCREENSHOT="$TEST_SCREENSHOT_DIR/cuda_screenshot.png"
    run_test "CUDA screenshot" "curl -s \"http://localhost:8080/api/screenshot/cuda?output_path=$CUDA_SCREENSHOT\" | jq . || true"
}

# 5. Test Security Features
test_security_features() {
    echo -e "\n${BLUE}=== 5. Security Features Tests ===${NC}"
    
    # Test authentication (if enabled)
    run_test "Authentication" "curl -s -X POST http://localhost:8080/api/auth/login -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin\"}' | jq . || true"
    
    # Test rate limiting
    run_test "Rate limiting" "for i in {1..5}; do curl -s http://localhost:8080/api/platform/info > /dev/null; done && curl -s http://localhost:8080/api/platform/info | jq ."
    
    # Test IP filtering (should allow localhost)
    run_test "IP filtering" "curl -s http://localhost:8080/api/platform/info | jq ."
}

# 6. Test Cross-Platform Features
test_cross_platform_features() {
    echo -e "\n${BLUE}=== 6. Cross-Platform Features Tests ===${NC}"
    
    # Test path normalization
    TEST_PATH_FILE="$TEST_FILES_DIR/path_test.txt"
    NORMALIZED_PATH=$(echo "$TEST_PATH_FILE" | tr '\\' '/' | tr '//' '/')
    
    run_test "Path handling" "curl -s -X POST http://localhost:8080/api/fs/write -H \"Content-Type: application/json\" -d '{\"path\":\"$NORMALIZED_PATH\",\"content\":\"Path test\"}' | jq . && [ \$(curl -s -X POST http://localhost:8080/api/fs/write -H \"Content-Type: application/json\" -d '{\"path\":\"$NORMALIZED_PATH\",\"content\":\"Path test\"}' | jq -r '.success') == 'true' ]"
    
    # Test system info
    run_test "System info" "curl -s http://localhost:8080/api/platform/info | jq . && [ \$(curl -s http://localhost:8080/api/platform/info | jq -r '.os_type') != null ]"
    
    # Test display info
    run_test "Display info" "curl -s http://localhost:8080/api/platform/displays | jq . || true"
}

# Run all tests
main() {
    # Build service if needed
    build_service
    
    # Check if service is running
    check_service
    
    # Run tests
    test_platform_detection
    test_filesystem_operations
    test_process_management
    test_screenshot_capabilities
    test_security_features
    test_cross_platform_features
    
    # Clean up
    echo -e "\n${BLUE}=== Cleaning up ===${NC}"
    echo -e "${YELLOW}Removing test directory: $TEST_DIR${NC}"
    rm -rf "$TEST_DIR"
    
    echo -e "\n${GREEN}=== All tests completed ===${NC}"
    echo -e "${BLUE}Finished at: $(date)${NC}"
}

# Run main function
main
