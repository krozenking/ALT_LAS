# Runner Service Documentation

## Overview

The Runner Service is a core component of the ALT_LAS system responsible for executing ALT files, managing task execution, and generating LAST files. It is implemented in Rust for performance, safety, and reliability.

## Architecture

The Runner Service consists of the following main components:

1. **ALT File Processing**: Handles parsing, validation, and processing of ALT files
2. **Task Management**: Manages task execution, dependencies, and scheduling
3. **AI Service Integration**: Communicates with AI services for task execution
4. **LAST File Generation**: Creates LAST files from execution results
5. **FFI Layer**: Provides a secure interface for other languages to interact with the Runner Service

## ALT File Processing

The ALT file processing module handles the parsing and validation of ALT files. ALT files are JSON documents that define a series of tasks to be executed.

### Key Features:
- JSON parsing and validation
- Schema validation
- Task dependency resolution
- Support for different execution modes (Normal, Dream, Explore, Chaos)

## Task Management

The task management module is responsible for scheduling and executing tasks defined in ALT files.

### Key Features:
- Parallel task execution
- Dependency-based scheduling
- Priority-based task scheduling
- Task retry mechanisms
- Timeout handling
- Task status tracking

## AI Service Integration

The AI service integration module provides communication with external AI services for task execution.

### Key Features:
- HTTP/gRPC client for AI service communication
- Streaming support for large responses
- Model selection capabilities
- Error handling and retry logic
- Concurrency control

## LAST File Generation

The LAST file generation module creates LAST files from execution results. LAST files contain the results of executing an ALT file, including task outputs, execution statistics, and artifacts.

### Key Features:
- Comprehensive result tracking
- Artifact collection and management
- Execution graph visualization
- HTML report generation
- Performance optimizations for large files
- Compressed file formats
- Archive creation

### LAST File Structure

A LAST file contains the following information:
- Metadata about the execution (ID, timestamp, etc.)
- ALT file reference
- Execution mode and parameters
- Task results with status, outputs, and errors
- Execution statistics (success rate, execution time)
- Artifacts generated during execution
- Execution graph showing task dependencies and execution flow

### Artifact Management

The LAST file generation system includes comprehensive artifact management:
- Automatic extraction of artifacts from task outputs
- Type detection based on file extensions
- Size and MIME type tracking
- Organization in a structured directory hierarchy

### Performance Optimizations

The LAST file generation system includes several performance optimizations:
- Parallel processing of artifacts
- Asynchronous file I/O
- Batch processing capabilities
- Configurable processing options

## FFI Layer

The FFI (Foreign Function Interface) layer provides a secure interface for other languages to interact with the Runner Service.

### Key Features:
- Safe memory management
- Error handling and reporting
- Support for ALT file parsing
- Task result collection
- LAST file generation
- Batch processing

### FFI Functions

The following functions are available through the FFI interface:

- `runner_init()`: Initialize the FFI layer
- `runner_get_last_error()`: Get the last error message
- `runner_free_string()`: Free a string allocated by the FFI layer
- `runner_parse_alt_file()`: Parse an ALT file from JSON string
- `runner_add_task_result()`: Add task result to an ALT file
- `runner_generate_last_file()`: Generate a LAST file from an ALT file and its task results
- `runner_get_last_file_json()`: Get a LAST file as JSON string
- `runner_batch_process()`: Batch process multiple ALT files
- `runner_cleanup()`: Clean up resources
- `runner_get_version()`: Get version information

### Example Usage (C)

```c
#include <stdio.h>
#include <stdlib.h>
#include "runner_ffi.h"

int main() {
    // Initialize the FFI layer
    runner_init();
    
    // Parse an ALT file
    const char* alt_json = "{\"id\":\"test_alt_file\",\"title\":\"Test ALT File\",\"mode\":\"normal\",\"tasks\":[...]}";
    int result = runner_parse_alt_file(alt_json);
    
    if (result == 0) {
        char* error = runner_get_last_error();
        printf("Error: %s\n", error);
        runner_free_string(error);
        return 1;
    }
    
    // Add task results
    const char* task_result = "{\"task_id\":\"task1\",\"status\":\"completed\",\"output\":{...}}";
    runner_add_task_result("test_alt_file", task_result);
    
    // Generate LAST file
    char* last_id = runner_generate_last_file("test_alt_file", "/tmp/output");
    
    if (last_id != NULL) {
        printf("Generated LAST file: %s\n", last_id);
        
        // Get LAST file as JSON
        char* last_json = runner_get_last_file_json(last_id);
        
        if (last_json != NULL) {
            printf("LAST file JSON: %s\n", last_json);
            runner_free_string(last_json);
        }
        
        runner_free_string(last_id);
    } else {
        char* error = runner_get_last_error();
        printf("Error: %s\n", error);
        runner_free_string(error);
    }
    
    // Clean up
    runner_cleanup();
    
    return 0;
}
```

### Example Usage (Python with ctypes)

```python
import ctypes
import json
import tempfile

# Load the library
lib = ctypes.CDLL("./librunner.so")

# Define function prototypes
lib.runner_init.restype = ctypes.c_int
lib.runner_get_last_error.restype = ctypes.c_char_p
lib.runner_free_string.argtypes = [ctypes.c_char_p]
lib.runner_parse_alt_file.argtypes = [ctypes.c_char_p]
lib.runner_parse_alt_file.restype = ctypes.c_int
lib.runner_add_task_result.argtypes = [ctypes.c_char_p, ctypes.c_char_p]
lib.runner_add_task_result.restype = ctypes.c_int
lib.runner_generate_last_file.argtypes = [ctypes.c_char_p, ctypes.c_char_p]
lib.runner_generate_last_file.restype = ctypes.c_char_p
lib.runner_get_last_file_json.argtypes = [ctypes.c_char_p]
lib.runner_get_last_file_json.restype = ctypes.c_char_p
lib.runner_cleanup.restype = ctypes.c_int

# Initialize the FFI layer
lib.runner_init()

try:
    # Create an ALT file
    alt_file = {
        "id": "test_alt_file",
        "title": "Test ALT File",
        "mode": "normal",
        "tasks": [
            {
                "id": "task1",
                "description": "First task",
                "dependencies": None
            },
            {
                "id": "task2",
                "description": "Second task",
                "dependencies": ["task1"]
            }
        ]
    }
    
    # Parse ALT file
    alt_json = json.dumps(alt_file)
    result = lib.runner_parse_alt_file(alt_json.encode('utf-8'))
    
    if result == 0:
        error = lib.runner_get_last_error()
        print(f"Error: {error.decode('utf-8')}")
        lib.runner_free_string(error)
        exit(1)
    
    # Add task results
    task1_result = {
        "task_id": "task1",
        "status": "completed",
        "output": {"text": "Task 1 output"}
    }
    
    task2_result = {
        "task_id": "task2",
        "status": "failed",
        "error": "Task 2 failed"
    }
    
    lib.runner_add_task_result(
        "test_alt_file".encode('utf-8'),
        json.dumps(task1_result).encode('utf-8')
    )
    
    lib.runner_add_task_result(
        "test_alt_file".encode('utf-8'),
        json.dumps(task2_result).encode('utf-8')
    )
    
    # Generate LAST file
    with tempfile.TemporaryDirectory() as temp_dir:
        last_id_ptr = lib.runner_generate_last_file(
            "test_alt_file".encode('utf-8'),
            temp_dir.encode('utf-8')
        )
        
        if last_id_ptr:
            last_id = ctypes.string_at(last_id_ptr).decode('utf-8')
            print(f"Generated LAST file: {last_id}")
            
            # Get LAST file as JSON
            last_json_ptr = lib.runner_get_last_file_json(last_id.encode('utf-8'))
            
            if last_json_ptr:
                last_json = ctypes.string_at(last_json_ptr).decode('utf-8')
                last_data = json.loads(last_json)
                print(f"LAST file success rate: {last_data['success_rate'] * 100:.2f}%")
                
                lib.runner_free_string(last_json_ptr)
            
            lib.runner_free_string(last_id_ptr)
        else:
            error = lib.runner_get_last_error()
            print(f"Error: {error.decode('utf-8')}")
            lib.runner_free_string(error)

finally:
    # Clean up
    lib.runner_cleanup()
```

## Building and Testing

### Prerequisites
- Rust 1.54 or later
- Cargo
- GraphViz (optional, for execution graph visualization)

### Building
```bash
cargo build --release
```

### Testing
```bash
cargo test
```

### Building FFI Library
```bash
cargo build --release --features ffi
```

## Configuration

The Runner Service can be configured through environment variables:

- `RUNNER_LOG_LEVEL`: Log level (trace, debug, info, warn, error)
- `RUNNER_MAX_CONCURRENT_TASKS`: Maximum number of concurrent tasks
- `RUNNER_OUTPUT_DIR`: Default output directory for LAST files
- `RUNNER_AI_SERVICE_URL`: URL of the AI service
- `RUNNER_ENABLE_COMPRESSION`: Enable compression for LAST files (true/false)
