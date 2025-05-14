# Additional AI Model Types Integration

This document provides an overview of the additional AI model types integration implemented for the AI Orchestrator component of the ALT_LAS project.

## Overview

The additional AI model types integration extends the AI Orchestrator to support a wider range of AI model types beyond the original four types (LLM, VISION, AUDIO, MULTIMODAL). This is achieved through a flexible adapter system that allows new model types to be easily integrated into the system.

## New Model Types

The following new model types have been added to the system:

1. **EMBEDDING**: Models that convert text or other data into vector representations
2. **DIFFUSION**: Image generation models based on diffusion processes
3. **CLASSIFICATION**: Models that classify inputs into predefined categories
4. **RECOMMENDATION**: Models that provide recommendations based on user preferences
5. **TABULAR**: Models that work with tabular data (e.g., CSV files)
6. **REINFORCEMENT_LEARNING**: Models trained using reinforcement learning techniques

## Architecture

### Model Adapter Pattern

The implementation uses the adapter pattern to provide a consistent interface for different model types:

```
                  ┌─────────────────┐
                  │ ModelAdapter    │
                  │ (Protocol)      │
                  └─────────────────┘
                          ▲
                          │
              ┌───────────────────────┐
              │                       │
    ┌─────────────────┐     ┌─────────────────┐
    │ BaseModelAdapter│     │ Custom Adapters │
    │ (Abstract)      │     │ (External)      │
    └─────────────────┘     └─────────────────┘
              ▲
              │
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │
│       Concrete Adapters             │
│                                     │
│  (LLM, Vision, Audio, Embedding,    │
│   Diffusion, Classification, etc.)  │
│                                     │
└─────────────────────────────────────┘
```

### Factory Pattern

A factory pattern is used to create and manage model adapters:

```
┌─────────────────────┐     ┌─────────────────┐
│ ExtendedModelManager│────▶│ModelAdapterFactory
│                     │     │                 │
└─────────────────────┘     └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │ ModelAdapter    │
                            │ Instances       │
                            └─────────────────┘
```

### Extended Model Type System

The original `ModelType` enum is extended with new model types:

```python
class ExtendedModelType(str, Enum):
    """Extended model type enumeration with additional AI model types."""
    # Original model types
    LLM = "llm"
    VISION = "vision"
    AUDIO = "audio"
    MULTIMODAL = "multimodal"
    
    # New model types
    EMBEDDING = "embedding"
    DIFFUSION = "diffusion"
    CLASSIFICATION = "classification"
    RECOMMENDATION = "recommendation"
    TABULAR = "tabular"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
```

## Key Components

### 1. Model Adapters (`model_adapters.py`)

This module defines the adapter protocol and implementations for each model type:

- `ModelAdapter`: Protocol defining the interface for model adapters
- `BaseModelAdapter`: Abstract base class implementing common functionality
- Concrete adapters for each model type (LLM, Vision, Audio, Embedding, etc.)
- `ModelAdapterFactory`: Factory for creating model adapters based on model type

### 2. Extended Model Manager (`extended_model_manager.py`)

This module extends the base model manager to support the new model types:

- `ExtendedModelManager`: Extends the base `ModelManager` with adapter support
- Overrides methods like `load_model`, `unload_model`, and `run_inference` to use adapters
- Adds new methods for working with model types and adapters

### 3. Model Types API (`model_types.py`)

This module provides API endpoints for interacting with the extended model types:

- `list_model_types`: Lists all supported model types
- `get_model_type_metadata_schema`: Gets the metadata schema for a model type
- `get_model_type_config_schema`: Gets the configuration schema for a model type
- `list_models_by_type`: Lists all models of a specific type

## Usage Examples

### Loading and Using Models

```python
from ai_orchestrator.services.extended_model_manager import get_extended_model_manager

# Get the extended model manager
manager = get_extended_model_manager()

# Load an embedding model
await manager.load_model("text-embedding-ada-002")

# Generate embeddings
embeddings = await manager.run_inference(
    "text-embedding-ada-002",
    "This is a sample text to embed",
    normalize=True
)

# Load a diffusion model
await manager.load_model("stable-diffusion-v1-5")

# Generate an image
image = await manager.run_inference(
    "stable-diffusion-v1-5",
    "A photo of a cat in space",
    num_inference_steps=50,
    guidance_scale=7.5
)
```

### Working with Model Types

```python
from ai_orchestrator.services.extended_model_manager import get_extended_model_manager
from ai_orchestrator.core.model_adapters import ExtendedModelType

# Get the extended model manager
manager = get_extended_model_manager()

# List all supported model types
model_types = await manager.list_supported_model_types()
print(f"Supported model types: {model_types}")

# Get metadata schema for a model type
metadata_schema = await manager.get_model_metadata_schema("embedding")
print(f"Embedding metadata schema: {metadata_schema}")

# List all models of a specific type
embedding_models = await manager.list_models(type_filter="embedding")
print(f"Available embedding models: {embedding_models}")
```

### Registering Custom Adapters

```python
from ai_orchestrator.services.extended_model_manager import get_extended_model_manager
from ai_orchestrator.core.model_adapters import ExtendedModelType, BaseModelAdapter

# Create a custom adapter
class CustomModelAdapter(BaseModelAdapter):
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.TABULAR
    
    async def _load_model_impl(self, model_info, **kwargs):
        # Custom implementation
        pass
    
    async def _unload_model_impl(self, model_instance, **kwargs):
        # Custom implementation
        pass
    
    async def _run_inference_impl(self, model_instance, inputs, **kwargs):
        # Custom implementation
        pass

# Get the extended model manager
manager = get_extended_model_manager()

# Register the custom adapter
await manager.register_custom_adapter(
    ExtendedModelType.TABULAR,
    CustomModelAdapter()
)
```

## Model Type Details

### Embedding Models

Embedding models convert text or other data into vector representations that capture semantic meaning.

**Metadata Properties:**
- `vector_dimension`: Dimension of the embedding vectors
- `normalized`: Whether vectors are normalized by default
- `similarity_metric`: Recommended similarity metric (cosine, dot, euclidean)
- `pooling_strategy`: Strategy used for pooling token embeddings

**Configuration Options:**
- `normalize`: Whether to normalize output vectors
- `pooling`: Pooling method (mean, max, cls)
- `truncation`: Whether to truncate inputs that exceed model's context length

### Diffusion Models

Diffusion models generate images from text prompts or other inputs using a diffusion process.

**Metadata Properties:**
- `image_resolution`: Default output resolution
- `diffusion_steps`: Default number of diffusion steps
- `sampling_method`: Sampling method used (DDIM, PLMS, etc.)
- `conditioning_method`: Method used for conditioning

**Configuration Options:**
- `num_inference_steps`: Number of denoising steps
- `guidance_scale`: How closely to follow the text prompt
- `negative_prompt`: Text describing what to avoid in the image
- `seed`: Random seed for reproducibility

### Classification Models

Classification models categorize inputs into predefined classes.

**Metadata Properties:**
- `num_classes`: Number of output classes
- `class_labels`: Names of the output classes
- `classification_type`: Type of classification (binary, multiclass, multilabel)
- `metrics`: Performance metrics on evaluation datasets

**Configuration Options:**
- `threshold`: Confidence threshold for positive classification
- `top_k`: Number of top predictions to return
- `return_probabilities`: Whether to return class probabilities

### Recommendation Models

Recommendation models suggest items based on user preferences and behavior.

**Metadata Properties:**
- `algorithm_type`: Type of recommendation algorithm
- `feature_dimension`: Dimension of feature vectors
- `item_metadata`: Information about the item catalog
- `training_metrics`: Performance metrics from training

**Configuration Options:**
- `num_recommendations`: Number of recommendations to return
- `diversity_factor`: How diverse the recommendations should be
- `include_metadata`: Whether to include item metadata in results
- `filter_seen`: Whether to filter out items the user has already seen

### Tabular Models

Tabular models work with structured data in tabular format.

**Metadata Properties:**
- `feature_columns`: Names of input feature columns
- `target_column`: Name of the target column
- `feature_types`: Data types of each feature
- `algorithm`: Algorithm used (random forest, gradient boosting, etc.)
- `metrics`: Performance metrics on evaluation datasets

**Configuration Options:**
- `missing_value_strategy`: How to handle missing values
- `categorical_encoding`: How to encode categorical features
- `feature_scaling`: Whether and how to scale numerical features
- `return_probabilities`: Whether to return prediction probabilities

### Reinforcement Learning Models

Reinforcement learning models make decisions based on environmental state.

**Metadata Properties:**
- `algorithm`: RL algorithm used (DQN, PPO, A2C, SAC)
- `action_space`: Description of the action space
- `observation_space`: Description of the observation space
- `reward_range`: Range of possible rewards
- `training_environment`: Environment used for training

**Configuration Options:**
- `deterministic`: Whether to use deterministic policy
- `exploration_rate`: Rate of exploration vs. exploitation
- `discount_factor`: Discount factor for future rewards
- `normalize_observations`: Whether to normalize observations

## Integration with Existing System

The additional model types integration is designed to be fully compatible with the existing AI Orchestrator:

- It extends rather than replaces the existing model management system
- Original model types (LLM, VISION, AUDIO, MULTIMODAL) continue to work as before
- The extended model manager can be used as a drop-in replacement for the base model manager
- API endpoints for the new model types complement the existing API

## Testing

Comprehensive test suites are provided for the new functionality:

- `test_model_adapters.py`: Tests for the model adapter system and extended model types
- `test_extended_model_manager.py`: Tests for the extended model manager

Run the tests using pytest:

```bash
cd ai-orchestrator
python -m pytest src/tests/test_model_adapters.py src/tests/test_extended_model_manager.py -v
```

## Future Enhancements

Potential future enhancements include:

- Support for more model types (e.g., time series, graph neural networks)
- More sophisticated adapter discovery and registration mechanisms
- Dynamic loading of adapters from external packages
- Enhanced metadata and configuration schemas for each model type
- Performance optimizations for specific model types
