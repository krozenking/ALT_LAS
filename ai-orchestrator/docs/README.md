# AI Orchestrator Documentation

## Overview

The AI Orchestrator is a core component of the ALT_LAS project responsible for managing and orchestrating AI models, including loading, unloading, and running inference with various types of models. It provides a unified interface for working with different AI capabilities such as text generation, computer vision, and audio processing.

## Architecture

The AI Orchestrator follows a modular architecture with the following key components:

### Core Components

1. **Model Management System**
   - Handles loading, unloading, and tracking AI models
   - Maintains model status and metadata
   - Provides a unified interface for model operations

2. **Inference Service**
   - Runs inference using loaded models
   - Supports single model, batch, and parallel inference
   - Handles different input and output formats

3. **Model Orchestration**
   - Selects appropriate models based on task requirements
   - Implements different selection strategies (performance, accuracy, cost)
   - Provides ensemble capabilities for improved results
   - Handles fallback mechanisms for reliability

4. **Local LLM Integration**
   - Integrates with llama.cpp for running LLaMA, Llama 2, and other compatible models
   - Integrates with ONNX Runtime for optimized neural network models
   - Provides adapters for different model formats and libraries

5. **Computer Vision Integration**
   - Provides object detection capabilities
   - Implements OCR (Optical Character Recognition)
   - Supports image classification and segmentation
   - Manages vision models and their resources

6. **Audio Processing Integration**
   - Implements speech-to-text transcription
   - Provides text-to-speech synthesis
   - Supports audio classification and speaker diarization
   - Manages audio models and their resources

7. **Performance Optimization**
   - Implements caching mechanisms for improved performance
   - Provides resource monitoring and management
   - Supports batch processing for efficiency
   - Optimizes memory usage and computational resources

### API Endpoints

The AI Orchestrator exposes the following API endpoints:

1. **Models API**
   - `GET /api/models/` - List all available models
   - `GET /api/models/{model_id}` - Get information about a specific model
   - `POST /api/models/{model_id}/load` - Load a model into memory
   - `POST /api/models/{model_id}/unload` - Unload a model from memory
   - `GET /api/models/{model_id}/status` - Get the current status of a model

2. **Inference API**
   - `POST /api/inference/` - Run inference using a specified model
   - `POST /api/inference/batch` - Run batch inference using specified models
   - `POST /api/inference/parallel` - Run inference in parallel using multiple models
   - `POST /api/inference/orchestrated` - Run orchestrated inference with automatic model selection

3. **Vision API**
   - `POST /api/vision/object-detection` - Detect objects in an image
   - `POST /api/vision/ocr` - Perform OCR on an image
   - `POST /api/vision/image-classification` - Classify an image
   - `POST /api/vision/image-segmentation` - Perform semantic segmentation on an image

4. **Audio API**
   - `POST /api/audio/transcribe` - Transcribe speech in an audio file to text
   - `POST /api/audio/text-to-speech` - Convert text to speech
   - `POST /api/audio/audio-classification` - Classify audio
   - `POST /api/audio/speaker-diarization` - Identify who spoke when in an audio file

## Implementation Details

### Model Management

The model management system is responsible for tracking and managing AI models. It maintains a registry of available models, their configurations, and their current status. Models can be loaded into memory when needed and unloaded to free up resources.

```python
# Example: Loading a model
model_manager = get_model_manager()
status = await model_manager.load_model("llama2-7b-q4")
```

### Inference

The inference service provides a unified interface for running inference with different types of models. It supports various input formats and handles the conversion between formats as needed.

```python
# Example: Running inference
inference_service = get_inference_service()
response = await inference_service.run_inference(
    InferenceRequest(
        model_id="llama2-7b-q4",
        inputs="What is the capital of France?",
        parameters={"max_tokens": 100, "temperature": 0.7}
    )
)
```

### Model Orchestration

The model orchestration system selects appropriate models based on the task requirements and constraints. It implements different selection strategies and provides ensemble capabilities for improved results.

```python
# Example: Running orchestrated inference
orchestrator = get_model_orchestrator()
response = await orchestrator.run_ensemble_inference(
    InferenceRequest(
        model_id="auto",
        inputs="What is the capital of France?",
        parameters={"max_tokens": 100}
    ),
    task_type="text-generation"
)
```

### Local LLM Integration

The local LLM integration provides adapters for running LLaMA, Llama 2, and other compatible models locally using llama.cpp and ONNX Runtime.

```python
# Example: Using llama.cpp adapter
llama_cpp_adapter = get_llama_cpp_adapter()
await llama_cpp_adapter.load_model("llama2-7b-q4", config)
response = await llama_cpp_adapter.generate(
    model_id="llama2-7b-q4",
    request=InferenceRequest(...)
)
```

### Computer Vision Integration

The computer vision integration provides capabilities for object detection, OCR, image classification, and image segmentation.

```python
# Example: Detecting objects in an image
vision_manager = get_vision_model_manager()
await vision_manager.load_model("yolo-v8", "yolo", config)
result = await vision_manager.detect_objects(
    image_data=image_bytes,
    model_id="yolo-v8",
    confidence=0.5
)
```

### Audio Processing Integration

The audio processing integration provides capabilities for speech-to-text transcription, text-to-speech synthesis, audio classification, and speaker diarization.

```python
# Example: Transcribing audio
audio_manager = get_audio_model_manager()
await audio_manager.load_model("whisper-small", "whisper", config)
result = await audio_manager.transcribe_audio(
    audio_data=audio_bytes,
    model_id="whisper-small",
    language="en"
)
```

### Performance Optimization

The performance optimization utilities provide caching mechanisms, resource monitoring, and batch processing capabilities for improved performance.

```python
# Example: Using async LRU cache
@async_lru_cache(maxsize=100, ttl=3600)
async def get_cached_result(key):
    # Expensive operation
    return result

# Example: Monitoring resources
resource_monitor = get_resource_monitor()
usage = resource_monitor.get_current_usage()
```

## Configuration

The AI Orchestrator can be configured using environment variables or a configuration file. The following configuration options are available:

- `MODEL_DIR`: Directory containing the models
- `USE_GPU`: Whether to use GPU for inference (default: true)
- `GPU_MEMORY_LIMIT`: Maximum GPU memory to use in MB (default: none)
- `CACHE_DIR`: Directory for caching (default: ./cache)
- `CACHE_SIZE_LIMIT`: Maximum cache size in MB (default: 1024)
- `LOG_LEVEL`: Logging level (default: INFO)

## Deployment

The AI Orchestrator can be deployed as a standalone service or as part of the ALT_LAS project. It requires Python 3.10+ and the dependencies listed in the requirements.txt file.

### Docker Deployment

```bash
# Build Docker image
docker build -t ai-orchestrator .

# Run Docker container
docker run -p 8000:8000 -v /path/to/models:/app/models ai-orchestrator
```

### Local Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Run service
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## API Usage Examples

### Loading a Model

```bash
curl -X POST "http://localhost:8000/api/models/llama2-7b-q4/load"
```

### Running Inference

```bash
curl -X POST "http://localhost:8000/api/inference/" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "llama2-7b-q4",
    "inputs": "What is the capital of France?",
    "parameters": {
      "max_tokens": 100,
      "temperature": 0.7
    }
  }'
```

### Detecting Objects in an Image

```bash
curl -X POST "http://localhost:8000/api/vision/object-detection" \
  -F "image=@/path/to/image.jpg" \
  -F "confidence=0.5" \
  -F "model_id=yolo-v8"
```

### Transcribing Audio

```bash
curl -X POST "http://localhost:8000/api/audio/transcribe" \
  -F "audio=@/path/to/audio.wav" \
  -F "language=en" \
  -F "model_id=whisper-small"
```

## Error Handling

The AI Orchestrator implements comprehensive error handling to ensure reliability and robustness. Errors are logged and returned to the client with appropriate HTTP status codes and error messages.

## Monitoring and Metrics

The AI Orchestrator provides monitoring and metrics capabilities through the resource monitor and logging system. It tracks CPU, memory, and GPU usage, as well as model performance metrics.

## Future Improvements

- Implement more sophisticated model selection strategies
- Add support for more model formats and libraries
- Improve ensemble methods for better results
- Implement distributed inference for improved scalability
- Add more comprehensive monitoring and alerting
