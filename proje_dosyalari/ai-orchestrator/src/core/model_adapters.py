"""
Extended model types and adapter system for AI Orchestrator.

This module provides an extensible framework for integrating new model types
into the AI Orchestrator system through a model adapter pattern.
"""
from enum import Enum
from typing import Dict, Any, Optional, List, Type, Protocol, runtime_checkable
from abc import ABC, abstractmethod
import logging

from ..models.model import ModelType as BaseModelType
from ..models.model import ModelInfo, ModelStatus

logger = logging.getLogger(__name__)

# Extend the base ModelType enum with new model types
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
    
    @classmethod
    def from_base_type(cls, base_type: BaseModelType) -> 'ExtendedModelType':
        """Convert base ModelType to ExtendedModelType."""
        return cls(base_type.value)
    
    def to_base_type(self) -> BaseModelType:
        """Convert ExtendedModelType to base ModelType if possible."""
        try:
            return BaseModelType(self.value)
        except ValueError:
            # If the extended type doesn't exist in the base type,
            # default to the closest matching type or MULTIMODAL
            type_mapping = {
                ExtendedModelType.EMBEDDING: BaseModelType.LLM,
                ExtendedModelType.DIFFUSION: BaseModelType.VISION,
                ExtendedModelType.CLASSIFICATION: BaseModelType.MULTIMODAL,
                ExtendedModelType.RECOMMENDATION: BaseModelType.MULTIMODAL,
                ExtendedModelType.TABULAR: BaseModelType.MULTIMODAL,
                ExtendedModelType.REINFORCEMENT_LEARNING: BaseModelType.MULTIMODAL
            }
            return type_mapping.get(self, BaseModelType.MULTIMODAL)


@runtime_checkable
class ModelAdapter(Protocol):
    """Protocol defining the interface for model adapters."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        """Get the model type this adapter handles."""
        ...
    
    async def load_model(self, model_info: ModelInfo, **kwargs) -> Any:
        """
        Load a model into memory.
        
        Args:
            model_info: Information about the model to load
            **kwargs: Additional keyword arguments
            
        Returns:
            Loaded model instance
        """
        ...
    
    async def unload_model(self, model_instance: Any, **kwargs) -> None:
        """
        Unload a model from memory.
        
        Args:
            model_instance: Model instance to unload
            **kwargs: Additional keyword arguments
        """
        ...
    
    async def run_inference(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        """
        Run inference with a model.
        
        Args:
            model_instance: Model instance to use
            inputs: Input data for inference
            **kwargs: Additional keyword arguments
            
        Returns:
            Inference results
        """
        ...
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        """
        Get the metadata schema for this model type.
        
        Returns:
            Dictionary describing the metadata schema
        """
        ...
    
    def get_config_schema(self) -> Dict[str, Any]:
        """
        Get the configuration schema for this model type.
        
        Returns:
            Dictionary describing the configuration schema
        """
        ...


class BaseModelAdapter(ABC):
    """Base class for model adapters implementing common functionality."""
    
    @property
    @abstractmethod
    def model_type(self) -> ExtendedModelType:
        """Get the model type this adapter handles."""
        pass
    
    async def load_model(self, model_info: ModelInfo, **kwargs) -> Any:
        """
        Load a model into memory.
        
        Args:
            model_info: Information about the model to load
            **kwargs: Additional keyword arguments
            
        Returns:
            Loaded model instance
        """
        logger.info(f"Loading {self.model_type.value} model: {model_info.model_id}")
        return await self._load_model_impl(model_info, **kwargs)
    
    @abstractmethod
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        """Implementation of model loading logic."""
        pass
    
    async def unload_model(self, model_instance: Any, **kwargs) -> None:
        """
        Unload a model from memory.
        
        Args:
            model_instance: Model instance to unload
            **kwargs: Additional keyword arguments
        """
        logger.info(f"Unloading {self.model_type.value} model")
        await self._unload_model_impl(model_instance, **kwargs)
    
    @abstractmethod
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        """Implementation of model unloading logic."""
        pass
    
    async def run_inference(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        """
        Run inference with a model.
        
        Args:
            model_instance: Model instance to use
            inputs: Input data for inference
            **kwargs: Additional keyword arguments
            
        Returns:
            Inference results
        """
        logger.info(f"Running inference with {self.model_type.value} model")
        return await self._run_inference_impl(model_instance, inputs, **kwargs)
    
    @abstractmethod
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        """Implementation of inference logic."""
        pass
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        """
        Get the metadata schema for this model type.
        
        Returns:
            Dictionary describing the metadata schema
        """
        # Base metadata schema common to all model types
        return {
            "type": "object",
            "properties": {
                "license": {"type": "string"},
                "source": {"type": "string"},
                "family": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"}
            }
        }
    
    def get_config_schema(self) -> Dict[str, Any]:
        """
        Get the configuration schema for this model type.
        
        Returns:
            Dictionary describing the configuration schema
        """
        # Base configuration schema common to all model types
        return {
            "type": "object",
            "properties": {
                "device": {"type": "string", "enum": ["cpu", "cuda", "mps"]},
                "threads": {"type": "integer", "minimum": 1},
                "cache_capacity": {"type": "integer", "minimum": 0}
            }
        }


class LLMAdapter(BaseModelAdapter):
    """Adapter for Large Language Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.LLM
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "llm", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        return {"output": f"LLM response to: {inputs}"}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add LLM-specific metadata properties
        base_schema["properties"].update({
            "context_length": {"type": "integer", "minimum": 1},
            "token_vocabulary_size": {"type": "integer", "minimum": 1},
            "training_corpus": {"type": "string"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add LLM-specific configuration properties
        base_schema["properties"].update({
            "temperature": {"type": "number", "minimum": 0, "maximum": 2},
            "top_p": {"type": "number", "minimum": 0, "maximum": 1},
            "top_k": {"type": "integer", "minimum": 0},
            "repeat_penalty": {"type": "number", "minimum": 0}
        })
        return base_schema


class VisionAdapter(BaseModelAdapter):
    """Adapter for Vision Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.VISION
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "vision", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        return {"output": f"Vision model analysis of image: {inputs}"}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Vision-specific metadata properties
        base_schema["properties"].update({
            "input_resolution": {"type": "string"},
            "architecture": {"type": "string"},
            "training_dataset": {"type": "string"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Vision-specific configuration properties
        base_schema["properties"].update({
            "confidence_threshold": {"type": "number", "minimum": 0, "maximum": 1},
            "iou_threshold": {"type": "number", "minimum": 0, "maximum": 1},
            "max_detections": {"type": "integer", "minimum": 1}
        })
        return base_schema


class AudioAdapter(BaseModelAdapter):
    """Adapter for Audio Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.AUDIO
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "audio", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        return {"output": f"Audio model processing of: {inputs}"}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Audio-specific metadata properties
        base_schema["properties"].update({
            "sample_rate": {"type": "integer", "minimum": 1},
            "supported_languages": {"type": "array", "items": {"type": "string"}},
            "audio_format": {"type": "string"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Audio-specific configuration properties
        base_schema["properties"].update({
            "beam_size": {"type": "integer", "minimum": 1},
            "vad_filter": {"type": "boolean"},
            "language": {"type": "string"}
        })
        return base_schema


class MultimodalAdapter(BaseModelAdapter):
    """Adapter for Multimodal Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.MULTIMODAL
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "multimodal", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        return {"output": f"Multimodal model processing of: {inputs}"}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Multimodal-specific metadata properties
        base_schema["properties"].update({
            "supported_modalities": {"type": "array", "items": {"type": "string"}},
            "modality_fusion": {"type": "string"},
            "max_input_length": {"type": "object"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Multimodal-specific configuration properties
        base_schema["properties"].update({
            "modality_weights": {"type": "object"},
            "generation_settings": {"type": "object"}
        })
        return base_schema


class EmbeddingAdapter(BaseModelAdapter):
    """Adapter for Embedding Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.EMBEDDING
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "embedding", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        import random
        # Generate a random embedding vector (for demonstration purposes)
        vector_size = model_instance.get("vector_size", 384)
        vector = [random.uniform(-1, 1) for _ in range(vector_size)]
        return {"embedding": vector}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Embedding-specific metadata properties
        base_schema["properties"].update({
            "vector_dimension": {"type": "integer", "minimum": 1},
            "normalized": {"type": "boolean"},
            "similarity_metric": {"type": "string", "enum": ["cosine", "dot", "euclidean"]},
            "pooling_strategy": {"type": "string"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Embedding-specific configuration properties
        base_schema["properties"].update({
            "normalize": {"type": "boolean"},
            "pooling": {"type": "string", "enum": ["mean", "max", "cls"]},
            "truncation": {"type": "boolean"}
        })
        return base_schema


class DiffusionAdapter(BaseModelAdapter):
    """Adapter for Diffusion Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.DIFFUSION
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "diffusion", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        return {"output": f"Generated image from prompt: {inputs}"}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Diffusion-specific metadata properties
        base_schema["properties"].update({
            "image_resolution": {"type": "string"},
            "diffusion_steps": {"type": "integer", "minimum": 1},
            "sampling_method": {"type": "string"},
            "conditioning_method": {"type": "string"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Diffusion-specific configuration properties
        base_schema["properties"].update({
            "num_inference_steps": {"type": "integer", "minimum": 1},
            "guidance_scale": {"type": "number", "minimum": 0},
            "negative_prompt": {"type": "string"},
            "seed": {"type": "integer"}
        })
        return base_schema


class ClassificationAdapter(BaseModelAdapter):
    """Adapter for Classification Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.CLASSIFICATION
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "classification", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        import random
        # Generate random classification results (for demonstration purposes)
        num_classes = model_instance.get("num_classes", 5)
        classes = [f"class_{i}" for i in range(num_classes)]
        probabilities = [random.random() for _ in range(num_classes)]
        # Normalize probabilities
        total = sum(probabilities)
        probabilities = [p/total for p in probabilities]
        # Sort by probability (descending)
        results = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)
        return {"classifications": [{"label": c, "probability": p} for c, p in results]}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Classification-specific metadata properties
        base_schema["properties"].update({
            "num_classes": {"type": "integer", "minimum": 2},
            "class_labels": {"type": "array", "items": {"type": "string"}},
            "classification_type": {"type": "string", "enum": ["binary", "multiclass", "multilabel"]},
            "metrics": {"type": "object"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Classification-specific configuration properties
        base_schema["properties"].update({
            "threshold": {"type": "number", "minimum": 0, "maximum": 1},
            "top_k": {"type": "integer", "minimum": 1},
            "return_probabilities": {"type": "boolean"}
        })
        return base_schema


class RecommendationAdapter(BaseModelAdapter):
    """Adapter for Recommendation Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.RECOMMENDATION
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "recommendation", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        import random
        # Generate random recommendations (for demonstration purposes)
        num_recommendations = kwargs.get("num_recommendations", 5)
        items = [f"item_{i}" for i in range(100)]
        recommendations = random.sample(items, num_recommendations)
        scores = [random.random() for _ in range(num_recommendations)]
        # Sort by score (descending)
        results = sorted(zip(recommendations, scores), key=lambda x: x[1], reverse=True)
        return {"recommendations": [{"item": r, "score": s} for r, s in results]}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Recommendation-specific metadata properties
        base_schema["properties"].update({
            "algorithm_type": {"type": "string", "enum": ["collaborative", "content-based", "hybrid"]},
            "feature_dimension": {"type": "integer", "minimum": 1},
            "item_metadata": {"type": "object"},
            "training_metrics": {"type": "object"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Recommendation-specific configuration properties
        base_schema["properties"].update({
            "num_recommendations": {"type": "integer", "minimum": 1},
            "diversity_factor": {"type": "number", "minimum": 0, "maximum": 1},
            "include_metadata": {"type": "boolean"},
            "filter_seen": {"type": "boolean"}
        })
        return base_schema


class TabularAdapter(BaseModelAdapter):
    """Adapter for Tabular Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.TABULAR
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "tabular", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        import random
        # Generate random prediction (for demonstration purposes)
        if isinstance(inputs, list):
            # Multiple rows
            predictions = [random.random() for _ in range(len(inputs))]
            return {"predictions": predictions}
        else:
            # Single row
            return {"prediction": random.random()}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add Tabular-specific metadata properties
        base_schema["properties"].update({
            "feature_columns": {"type": "array", "items": {"type": "string"}},
            "target_column": {"type": "string"},
            "feature_types": {"type": "object"},
            "algorithm": {"type": "string"},
            "metrics": {"type": "object"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add Tabular-specific configuration properties
        base_schema["properties"].update({
            "missing_value_strategy": {"type": "string", "enum": ["mean", "median", "most_frequent", "constant"]},
            "categorical_encoding": {"type": "string", "enum": ["one-hot", "label", "target"]},
            "feature_scaling": {"type": "string", "enum": ["none", "standard", "minmax"]},
            "return_probabilities": {"type": "boolean"}
        })
        return base_schema


class ReinforcementLearningAdapter(BaseModelAdapter):
    """Adapter for Reinforcement Learning Models."""
    
    @property
    def model_type(self) -> ExtendedModelType:
        return ExtendedModelType.REINFORCEMENT_LEARNING
    
    async def _load_model_impl(self, model_info: ModelInfo, **kwargs) -> Any:
        # Placeholder implementation
        return {"type": "reinforcement_learning", "id": model_info.model_id}
    
    async def _unload_model_impl(self, model_instance: Any, **kwargs) -> None:
        # Placeholder implementation
        pass
    
    async def _run_inference_impl(self, model_instance: Any, inputs: Any, **kwargs) -> Any:
        # Placeholder implementation
        import random
        # Generate random action (for demonstration purposes)
        action_space = model_instance.get("action_space", 10)
        action = random.randint(0, action_space - 1)
        return {"action": action, "value": random.random()}
    
    def get_metadata_schema(self) -> Dict[str, Any]:
        base_schema = super().get_metadata_schema()
        # Add RL-specific metadata properties
        base_schema["properties"].update({
            "algorithm": {"type": "string", "enum": ["dqn", "ppo", "a2c", "sac"]},
            "action_space": {"type": "object"},
            "observation_space": {"type": "object"},
            "reward_range": {"type": "array", "items": {"type": "number"}, "minItems": 2, "maxItems": 2},
            "training_environment": {"type": "string"}
        })
        return base_schema
    
    def get_config_schema(self) -> Dict[str, Any]:
        base_schema = super().get_config_schema()
        # Add RL-specific configuration properties
        base_schema["properties"].update({
            "deterministic": {"type": "boolean"},
            "exploration_rate": {"type": "number", "minimum": 0, "maximum": 1},
            "discount_factor": {"type": "number", "minimum": 0, "maximum": 1},
            "normalize_observations": {"type": "boolean"}
        })
        return base_schema


class ModelAdapterFactory:
    """Factory for creating model adapters based on model type."""
    
    def __init__(self):
        """Initialize the model adapter factory."""
        self._adapters: Dict[ExtendedModelType, Type[ModelAdapter]] = {}
        self._register_default_adapters()
    
    def _register_default_adapters(self):
        """Register the default model adapters."""
        self.register_adapter(ExtendedModelType.LLM, LLMAdapter())
        self.register_adapter(ExtendedModelType.VISION, VisionAdapter())
        self.register_adapter(ExtendedModelType.AUDIO, AudioAdapter())
        self.register_adapter(ExtendedModelType.MULTIMODAL, MultimodalAdapter())
        self.register_adapter(ExtendedModelType.EMBEDDING, EmbeddingAdapter())
        self.register_adapter(ExtendedModelType.DIFFUSION, DiffusionAdapter())
        self.register_adapter(ExtendedModelType.CLASSIFICATION, ClassificationAdapter())
        self.register_adapter(ExtendedModelType.RECOMMENDATION, RecommendationAdapter())
        self.register_adapter(ExtendedModelType.TABULAR, TabularAdapter())
        self.register_adapter(ExtendedModelType.REINFORCEMENT_LEARNING, ReinforcementLearningAdapter())
    
    def register_adapter(self, model_type: ExtendedModelType, adapter: ModelAdapter):
        """
        Register a model adapter for a specific model type.
        
        Args:
            model_type: Type of model
            adapter: Model adapter instance
        """
        if not isinstance(adapter, ModelAdapter):
            raise TypeError(f"Adapter must implement ModelAdapter protocol")
        
        self._adapters[model_type] = adapter
        logger.info(f"Registered adapter for model type: {model_type.value}")
    
    def get_adapter(self, model_type: ExtendedModelType) -> ModelAdapter:
        """
        Get a model adapter for a specific model type.
        
        Args:
            model_type: Type of model
            
        Returns:
            Model adapter instance
            
        Raises:
            ValueError: If no adapter is registered for the model type
        """
        if model_type not in self._adapters:
            raise ValueError(f"No adapter registered for model type: {model_type.value}")
        
        return self._adapters[model_type]
    
    def get_adapter_for_model(self, model_info: ModelInfo) -> ModelAdapter:
        """
        Get a model adapter for a specific model.
        
        Args:
            model_info: Model information
            
        Returns:
            Model adapter instance
            
        Raises:
            ValueError: If no adapter is registered for the model type
        """
        # Convert base ModelType to ExtendedModelType
        try:
            model_type = ExtendedModelType(model_info.type.value)
        except ValueError:
            # If conversion fails, default to the closest matching type
            logger.warning(f"Unknown model type: {model_info.type.value}, using default adapter")
            model_type = ExtendedModelType.MULTIMODAL
        
        return self.get_adapter(model_type)
    
    def list_supported_types(self) -> List[str]:
        """
        List all supported model types.
        
        Returns:
            List of supported model type values
        """
        return [adapter_type.value for adapter_type in self._adapters.keys()]


# Singleton instance
_model_adapter_factory = None

def get_model_adapter_factory() -> ModelAdapterFactory:
    """
    Get the singleton model adapter factory instance.
    
    Returns:
        ModelAdapterFactory instance
    """
    global _model_adapter_factory
    if _model_adapter_factory is None:
        _model_adapter_factory = ModelAdapterFactory()
    return _model_adapter_factory
