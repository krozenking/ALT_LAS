# AI Orchestrator - Enhanced Features Documentation

## Overview

The AI Orchestrator component has been enhanced with advanced capabilities for model management, OS integration, and comprehensive API endpoints. This document provides detailed information about the new features and how to use them.

## Table of Contents

1. [OS Integration](#os-integration)
2. [Enhanced Model Management](#enhanced-model-management)
3. [API Endpoints](#api-endpoints)
4. [Testing](#testing)
5. [Configuration](#configuration)

## OS Integration

The AI Orchestrator now integrates directly with the OS Integration Service developed by Worker 6. This integration provides the following capabilities:

### Platform Information

The AI Orchestrator can retrieve detailed platform information including:
- Operating system type and version
- Architecture
- Hostname and username
- CPU cores and memory information

```python
# Example usage
from src.integration.os_integration import OSIntegrationManager

os_manager = OSIntegrationManager()
await os_manager.initialize()
platform_info = await os_manager.get_platform_info()
```

### Screenshot Capture

The AI Orchestrator can capture screenshots of the current desktop:

```python
# Capture and save a screenshot
screenshot_result = await os_manager.capture_screenshot("/path/to/save/dir")

# Access the screenshot data
image_data = screenshot_result["image_data"]  # Base64 encoded image
image_path = screenshot_result["image_path"]  # Path where image was saved
```

### Process Management

List running processes on the system:

```python
processes = await os_manager.list_processes()
```

### File System Operations

List directory contents:

```python
directory_contents = await os_manager.list_directory("/path/to/directory")
```

### System Resource Monitoring

Monitor system resources (CPU, memory, disk) in real-time:

```python
# Start monitoring
await os_manager.start_resource_monitoring(interval_seconds=5, max_samples=100)

# Get current resource usage
resources = await os_manager.get_system_resources()

# Get resource history
history = os_manager.get_resource_history()

# Stop monitoring
await os_manager.stop_resource_monitoring()
```

## Enhanced Model Management

The AI Orchestrator now includes an enhanced model management system with the following features:

### Multiple Model Types

Support for multiple AI model types:
- LLM (Language Models)
- Vision Models
- Voice Models (Speech-to-Text and Text-to-Speech)

### Model Versioning

Support for managing multiple versions of each model type:

```python
# Switch to a different model version
from src.models.enhanced_model_manager import EnhancedModelManager

model_manager = EnhancedModelManager()
await model_manager.initialize()
await model_manager.switch_model_version("llm", "0.2.0")

# Get available versions
versions = await model_manager.get_available_versions("llm")
```

### Result Caching

Automatic caching of model results for improved performance:

```python
# Process with caching (default)
result1 = await model_manager.process_llm("Hello, world!")
result2 = await model_manager.process_llm("Hello, world!")  # Uses cache

# Process without caching
result3 = await model_manager.process_llm("Hello, world!", {"no_cache": True})

# Clear cache
await model_manager.clear_cache("llm")  # Clear LLM cache only
await model_manager.clear_cache()  # Clear all caches
```

### Batch Processing

Process multiple requests in a single batch:

```python
batch_requests = [
    {"model_type": "llm", "input": "Hello from batch", "parameters": {}},
    {"model_type": "vision", "input": "/path/to/image.jpg", "parameters": {}}
]
results = await model_manager.process_batch(batch_requests)
```

### OS Integration

Models can leverage OS integration features:

```python
# Vision model with screenshot capture
result = await model_manager.process_vision("dummy", {"capture_screenshot": True})

# Include system information in results
result = await model_manager.process_llm("System info", {"include_system_info": True})
```

### Statistics and Monitoring

Comprehensive statistics and monitoring:

```python
# Get model status
status = await model_manager.get_status()

# Get usage statistics
stats = await model_manager.get_stats()

# Get uptime
uptime = model_manager.get_uptime()
```

## API Endpoints

The AI Orchestrator provides a comprehensive REST API for accessing all features:

### General Endpoints

- `GET /` - Service information
- `GET /health` - Health check with model and platform status

### Model Endpoints

- `POST /api/llm` - Process LLM requests
- `POST /api/vision` - Process vision requests
- `POST /api/voice` - Process voice requests
- `POST /api/batch` - Process batch requests
- `GET /api/models/info` - Get model information
- `GET /api/models/status` - Get model status
- `GET /api/models/stats` - Get model statistics
- `POST /api/models/version` - Switch model version
- `GET /api/models/versions/{model_type}` - Get available versions
- `POST /api/models/cache/clear` - Clear model cache

### OS Integration Endpoints

- `GET /api/platform/info` - Get platform information
- `GET /api/platform/screenshot` - Capture screenshot
- `GET /api/platform/processes` - List processes
- `GET /api/platform/directory` - List directory contents
- `GET /api/platform/resources` - Get system resources
- `POST /api/platform/monitor/start` - Start resource monitoring
- `POST /api/platform/monitor/stop` - Stop resource monitoring
- `GET /api/platform/monitor/history` - Get resource history

## Testing

Comprehensive tests have been added for all new features:

- `tests/test_enhanced_model_manager.py` - Tests for enhanced model management
- `tests/test_os_integration.py` - Tests for OS integration
- `tests/test_api.py` - Tests for API endpoints

Run tests using pytest:

```bash
cd /path/to/ALT_LAS/ai-orchestrator
python -m pytest tests/
```

## Configuration

The AI Orchestrator can be configured through the config module:

```python
from src.config import config

# Model paths
config.set("model_paths.llm", "/path/to/llm/model")
config.set("model_paths.vision", "/path/to/vision/model")
config.set("model_paths.voice", "/path/to/voice/model")

# Cache settings
config.set("model_cache.llm.enabled", True)
config.set("model_cache.llm.max_items", 100)
config.set("model_cache.llm.ttl_seconds", 3600)

# OS Integration settings
config.set("services.os_integration.url", "http://localhost:8080")
config.set("services.os_integration.timeout", 30)
```

## Integration with Other Services

The AI Orchestrator is designed to integrate with other ALT_LAS services:

- **OS Integration Service**: Direct integration for platform-specific operations
- **Runner Service**: For executing tasks based on AI decisions
- **Segmentation Service**: For processing and routing commands
- **Archive Service**: For storing and retrieving results

## Future Enhancements

Planned future enhancements include:

1. Support for distributed model execution
2. Advanced model fine-tuning capabilities
3. Enhanced security features
4. Integration with additional AI model types
5. Improved performance monitoring and optimization
