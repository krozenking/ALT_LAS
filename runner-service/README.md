# Runner Service Documentation

## Overview

The Runner Service is a key component of the ALT_LAS system, responsible for processing ALT files, managing parallel task execution, integrating with AI services, and producing LAST files. This document provides detailed information about the Runner Service implementation, architecture, and usage.

## Architecture

The Runner Service is built using a modular architecture with the following components:

1. **ALT File Processing**: Handles parsing, validation, and processing of ALT files
2. **Task Management**: Manages parallel execution of tasks with dependency resolution
3. **AI Service Integration**: Communicates with the AI Orchestrator for AI-related tasks
4. **LAST File Production**: Generates and writes LAST files based on task execution results
5. **Performance Monitoring**: Tracks and optimizes service performance

## Components

### ALT File Processing

The ALT file processing module handles the parsing and validation of ALT files. It includes:

- **Models**: Data structures for ALT files and tasks
- **Parser**: Functions for parsing ALT files from JSON
- **Validator**: Functions for validating ALT file structure and content

### Task Management

The task management module handles the execution of tasks in parallel, respecting dependencies. It includes:

- **Models**: Data structures for task execution and results
- **Scheduler**: Manages task scheduling based on dependencies
- **Executor**: Executes individual tasks

### AI Service Integration

The AI service integration module handles communication with the AI Orchestrator. It includes:

- **Client**: HTTP client for communicating with the AI Orchestrator
- **Processor**: Processes AI-related tasks

### LAST File Production

The LAST file production module handles the generation and writing of LAST files. It includes:

- **Models**: Data structures for LAST files
- **Generator**: Functions for generating LAST files from task results
- **Writer**: Functions for writing LAST files to disk

### Performance Monitoring

The performance monitoring module tracks and optimizes service performance. It includes:

- **Metrics**: Tracks task execution metrics
- **Timer**: Measures execution time
- **Memory Tracker**: Monitors memory usage

## API Endpoints

The Runner Service exposes the following API endpoints:

- **GET /**: Returns a simple welcome message
- **GET /health**: Returns the health status of the service
- **POST /run**: Runs a task based on an ALT file
- **GET /task/{id}**: Gets the status of a task

### POST /run

This endpoint runs a task based on an ALT file.

**Request Body**:
```json
{
  "alt_file": "JSON string containing the ALT file",
  "mode": "Optional mode (normal, dream, explore, chaos)",
  "persona": "Optional persona",
  "metadata": "Optional metadata object"
}
```

**Response**:
```json
{
  "id": "Task ID",
  "status": "processing",
  "alt_file": "ALT file ID",
  "last_file": "LAST file name",
  "metadata": {
    "timestamp": "ISO timestamp",
    "task_id": "Task ID",
    "alt_file_id": "ALT file ID"
  }
}
```

### GET /task/{id}

This endpoint gets the status of a task.

**Response**:
```json
{
  "id": "Task ID",
  "status": "completed|partial_success|failed|processing|error",
  "alt_file": "ALT file ID",
  "last_file": "LAST file name",
  "metadata": {
    "timestamp": "ISO timestamp",
    "task_id": "Task ID",
    "alt_file_id": "ALT file ID",
    "success_rate": "Success rate (0.0-1.0)",
    "execution_time_ms": "Execution time in milliseconds"
  }
}
```

## Configuration

The Runner Service can be configured using environment variables:

- **OUTPUT_DIR**: Directory for output files (default: /tmp/runner-service/output)
- **AI_SERVICE_URL**: URL of the AI Orchestrator service (default: http://ai-orchestrator:8000)
- **AI_TIMEOUT_SECONDS**: Timeout for AI service requests in seconds (default: 60)
- **MAX_CONCURRENT_TASKS**: Maximum number of concurrent tasks (default: 4)
- **USE_MOCK_AI**: Whether to use mock AI service (default: false)

## File Formats

### ALT File Format

ALT files are JSON files with the following structure:

```json
{
  "id": "Unique ID",
  "version": "Version string",
  "created_at": "ISO timestamp",
  "title": "Title string",
  "description": "Optional description",
  "mode": "normal|dream|explore|chaos",
  "persona": "Optional persona",
  "tasks": [
    {
      "id": "Task ID",
      "description": "Task description",
      "dependencies": ["Optional array of task IDs"],
      "parameters": "Optional parameters object",
      "timeout_seconds": "Optional timeout in seconds",
      "retry_count": "Optional retry count"
    }
  ],
  "metadata": "Optional metadata object"
}
```

### LAST File Format

LAST files are JSON files with the following structure:

```json
{
  "id": "Unique ID",
  "version": "Version string",
  "created_at": "ISO timestamp",
  "alt_file_id": "ALT file ID",
  "alt_file_title": "ALT file title",
  "execution_id": "Execution ID",
  "status": "success|partial_success|failure",
  "mode": "normal|dream|explore|chaos",
  "persona": "Optional persona",
  "task_results": {
    "task_id": {
      "task_id": "Task ID",
      "execution_id": "Execution ID",
      "status": "pending|running|completed|failed|cancelled|timeout",
      "start_time": "ISO timestamp",
      "end_time": "Optional ISO timestamp",
      "duration_ms": "Optional duration in milliseconds",
      "output": "Optional output object",
      "error": "Optional error string",
      "metadata": "Optional metadata object"
    }
  },
  "summary": "Optional summary string",
  "success_rate": "Success rate (0.0-1.0)",
  "execution_time_ms": "Execution time in milliseconds",
  "metadata": "Optional metadata object"
}
```

## Performance Considerations

The Runner Service is designed to handle parallel task execution efficiently. Here are some performance considerations:

- **Task Scheduling**: Tasks are scheduled based on their dependencies, with independent tasks executed in parallel.
- **Resource Usage**: The service monitors memory usage and execution time to optimize resource usage.
- **Concurrency**: The maximum number of concurrent tasks can be configured to match available resources.
- **Timeouts**: Tasks have configurable timeouts to prevent resource exhaustion.
- **Retries**: Tasks can be configured to retry on failure, with a configurable retry count.

## Error Handling

The Runner Service includes comprehensive error handling:

- **ALT File Validation**: ALT files are validated before processing, with detailed error messages for invalid files.
- **Task Execution**: Task execution errors are captured and reported in the LAST file.
- **AI Service Integration**: AI service errors are handled gracefully, with fallback to mock responses when necessary.
- **LAST File Generation**: LAST file generation errors are logged and reported.

## Testing

The Runner Service includes comprehensive tests:

- **Unit Tests**: Each component has unit tests to verify its functionality.
- **Integration Tests**: Integration tests verify that components work together correctly.
- **Performance Tests**: Performance tests verify that the service meets performance requirements.

## Future Improvements

Potential future improvements for the Runner Service include:

- **Distributed Task Execution**: Support for distributed task execution across multiple nodes.
- **Advanced Scheduling**: More advanced task scheduling algorithms based on resource usage and priority.
- **Real-time Monitoring**: Real-time monitoring of task execution status.
- **Enhanced AI Integration**: More advanced AI integration with support for multiple AI models.
- **Improved Error Recovery**: More sophisticated error recovery mechanisms.
