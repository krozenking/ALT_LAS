"""
Enhanced model selection algorithm for AI Orchestrator.

This module extends the core orchestration module with improved model selection
capabilities, including advanced selection strategies and parallel execution.
"""
import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Union, Tuple
from enum import Enum

from src.models.inference import InferenceRequest, InferenceResponse
from src.models.model import ModelInfo, ModelType
from src.services.model_manager import ModelManager, get_model_manager
from src.core.orchestration import ModelOrchestrator, ModelSelectionStrategy

logger = logging.getLogger(__name__)

class AdvancedModelSelectionStrategy(str, Enum):
    """Advanced model selection strategy enumeration."""
    MULTI_OBJECTIVE = "multi_objective"
    ADAPTIVE = "adaptive"
    CONTEXT_AWARE = "context_aware"
    HYBRID = "hybrid"
    SPECIALIZED = "specialized"


class EnhancedModelOrchestrator(ModelOrchestrator):
    """
    Enhanced model orchestrator with improved selection and parallel execution.
    """
    def __init__(self, model_manager: ModelManager):
        """Initialize the enhanced model orchestrator."""
        super().__init__(model_manager)
        self.model_performance_history = {}
        self.model_usage_stats = {}
        self.last_selection_time = {}
        
    async def select_models_advanced(
        self, 
        task_type: str, 
        strategy: Union[ModelSelectionStrategy, AdvancedModelSelectionStrategy] = ModelSelectionStrategy.AUTO,
        constraints: Optional[Dict[str, Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Select appropriate models using advanced selection strategies.
        
        Args:
            task_type: Type of task (e.g., 'text-generation', 'image-classification')
            strategy: Model selection strategy
            constraints: Optional constraints (e.g., max_memory, min_accuracy)
            context: Optional context information for context-aware selection
            
        Returns:
            List of selected model IDs
        """
        # For basic strategies, use the parent implementation
        if isinstance(strategy, ModelSelectionStrategy):
            return await super().select_models(task_type, strategy, constraints)
        
        # Get all available models
        all_models = await self.model_manager.list_models()
        
        # Filter models by task type (same as parent implementation)
        task_models = []
        for model in all_models:
            # Map task type to model type
            if task_type in ['text-generation', 'chat', 'completion']:
                if model.type == ModelType.LLM:
                    task_models.append(model)
            elif task_type in ['image-classification', 'object-detection', 'ocr']:
                if model.type == ModelType.VISION:
                    task_models.append(model)
            elif task_type in ['speech-to-text', 'text-to-speech', 'audio-classification']:
                if model.type == ModelType.AUDIO:
                    task_models.append(model)
            elif task_type in ['multimodal']:
                if model.type == ModelType.MULTIMODAL:
                    task_models.append(model)
        
        # Apply constraints if provided (same as parent implementation)
        if constraints:
            filtered_models = []
            for model in task_models:
                meets_constraints = True
                
                # Check memory constraint
                if 'max_memory' in constraints and model.size:
                    if model.size > constraints['max_memory']:
                        meets_constraints = False
                        
                # Check parameters constraint
                if 'max_parameters' in constraints and model.parameters:
                    if model.parameters > constraints['max_parameters']:
                        meets_constraints = False
                
                # Add more constraint checks as needed
                
                if meets_constraints:
                    filtered_models.append(model)
            
            task_models = filtered_models
        
        # Apply advanced selection strategies
        if strategy == AdvancedModelSelectionStrategy.MULTI_OBJECTIVE:
            # Multi-objective optimization considering accuracy, speed, and cost
            # This is a simplified implementation - in a real system, you'd use more sophisticated algorithms
            
            # Normalize scores for each objective
            accuracy_scores = {}
            speed_scores = {}
            cost_scores = {}
            
            # Calculate scores (mock implementation)
            for model in task_models:
                # Higher parameters generally mean better accuracy
                accuracy_scores[model.model_id] = model.parameters / 1e9 if model.parameters else 0.5
                
                # Lower size generally means faster inference
                speed_scores[model.model_id] = 1.0 / (model.size / 1e9) if model.size else 0.5
                
                # Lower size generally means lower cost
                cost_scores[model.model_id] = 1.0 / (model.size / 1e9) if model.size else 0.5
            
            # Combine scores with weights
            weights = constraints.get('objective_weights', {'accuracy': 0.4, 'speed': 0.3, 'cost': 0.3})
            combined_scores = {}
            
            for model in task_models:
                combined_scores[model.model_id] = (
                    weights.get('accuracy', 0.4) * accuracy_scores.get(model.model_id, 0.5) +
                    weights.get('speed', 0.3) * speed_scores.get(model.model_id, 0.5) +
                    weights.get('cost', 0.3) * cost_scores.get(model.model_id, 0.5)
                )
            
            # Sort models by combined score
            task_models.sort(key=lambda m: combined_scores.get(m.model_id, 0), reverse=True)
            
        elif strategy == AdvancedModelSelectionStrategy.ADAPTIVE:
            # Adaptive selection based on historical performance
            if self.model_performance_history:
                # Sort by historical performance
                task_models.sort(
                    key=lambda m: self.model_performance_history.get(m.model_id, {}).get('success_rate', 0.5),
                    reverse=True
                )
            else:
                # Fall back to accuracy-based sorting if no history
                task_models.sort(key=lambda m: m.parameters if m.parameters else 0, reverse=True)
                
        elif strategy == AdvancedModelSelectionStrategy.CONTEXT_AWARE:
            # Context-aware selection based on input context
            if context:
                # Example: Select based on input length
                if 'input_length' in context:
                    input_length = context['input_length']
                    
                    if input_length < 1000:
                        # For short inputs, prefer faster models
                        task_models.sort(key=lambda m: m.size if m.size else float('inf'))
                    else:
                        # For long inputs, prefer models with larger context windows
                        task_models.sort(
                            key=lambda m: m.context_length if m.context_length else 0,
                            reverse=True
                        )
                
                # Example: Select based on language
                if 'language' in context:
                    language = context['language']
                    
                    # Filter models that support the language
                    language_models = [
                        m for m in task_models
                        if language in m.metadata.get('supported_languages', ['en'])
                    ]
                    
                    if language_models:
                        task_models = language_models
            else:
                # Fall back to accuracy-based sorting if no context
                task_models.sort(key=lambda m: m.parameters if m.parameters else 0, reverse=True)
                
        elif strategy == AdvancedModelSelectionStrategy.HYBRID:
            # Hybrid approach combining multiple strategies
            
            # 1. First filter by constraints (already done above)
            
            # 2. Consider historical performance
            performance_weight = 0.4
            performance_scores = {}
            for model in task_models:
                history = self.model_performance_history.get(model.model_id, {})
                performance_scores[model.model_id] = history.get('success_rate', 0.5)
            
            # 3. Consider model capabilities
            capability_weight = 0.3
            capability_scores = {}
            for model in task_models:
                # Higher parameters generally mean better capabilities
                capability_scores[model.model_id] = model.parameters / 1e9 if model.parameters else 0.5
            
            # 4. Consider resource efficiency
            efficiency_weight = 0.3
            efficiency_scores = {}
            for model in task_models:
                # Lower size generally means more efficient
                efficiency_scores[model.model_id] = 1.0 / (model.size / 1e9) if model.size else 0.5
            
            # Combine scores
            combined_scores = {}
            for model in task_models:
                combined_scores[model.model_id] = (
                    performance_weight * performance_scores.get(model.model_id, 0.5) +
                    capability_weight * capability_scores.get(model.model_id, 0.5) +
                    efficiency_weight * efficiency_scores.get(model.model_id, 0.5)
                )
            
            # Sort models by combined score
            task_models.sort(key=lambda m: combined_scores.get(m.model_id, 0), reverse=True)
            
        elif strategy == AdvancedModelSelectionStrategy.SPECIALIZED:
            # Specialized selection for specific task subtypes
            if context and 'task_subtype' in context:
                subtype = context['task_subtype']
                
                # Example: For code generation, prefer code-specific models
                if subtype == 'code_generation':
                    code_models = [
                        m for m in task_models
                        if 'code' in m.model_id.lower() or 'code' in m.tags
                    ]
                    
                    if code_models:
                        task_models = code_models
                
                # Example: For creative writing, prefer models with higher creativity
                elif subtype == 'creative_writing':
                    creative_models = [
                        m for m in task_models
                        if 'creative' in m.tags or m.metadata.get('creativity_score', 0) > 0.7
                    ]
                    
                    if creative_models:
                        task_models = creative_models
            else:
                # Fall back to accuracy-based sorting if no subtype
                task_models.sort(key=lambda m: m.parameters if m.parameters else 0, reverse=True)
        
        # Update selection time for selected models
        current_time = time.time()
        for model in task_models:
            self.last_selection_time[model.model_id] = current_time
        
        # Return model IDs
        return [model.model_id for model in task_models]
    
    async def run_optimized_parallel_inference(
        self,
        request: InferenceRequest,
        model_ids: List[str],
        timeout: Optional[float] = None,
        early_stopping: bool = False
    ) -> List[InferenceResponse]:
        """
        Run inference in parallel with optimizations like timeout and early stopping.
        
        Args:
            request: Base inference request
            model_ids: List of model IDs to use
            timeout: Optional timeout in seconds
            early_stopping: Whether to stop all tasks when one completes successfully
            
        Returns:
            List of inference responses
        """
        # Create a request for each model
        requests = [
            InferenceRequest(
                model_id=model_id,
                inputs=request.inputs,
                parameters=request.parameters
            )
            for model_id in model_ids
        ]
        
        # Create tasks but don't start them yet
        tasks = [
            asyncio.create_task(
                self.run_inference(req, ModelSelectionStrategy.AUTO)
            )
            for req in requests
        ]
        
        results = []
        pending = set(tasks)
        
        try:
            # If early stopping is enabled, we'll use as_completed
            if early_stopping:
                for i, future in enumerate(asyncio.as_completed(tasks, timeout=timeout)):
                    try:
                        result = await future
                        results.append(result)
                        
                        # If we got a successful result, cancel remaining tasks
                        if not isinstance(result, Exception) and 'error' not in result.metadata:
                            for task in pending:
                                if not task.done():
                                    task.cancel()
                            break
                    except Exception as e:
                        logger.error(f"Error in parallel inference: {str(e)}")
                        results.append(InferenceResponse(
                            model_id=model_ids[i] if i < len(model_ids) else "unknown",
                            outputs="Error during inference",
                            metadata={"error": str(e)}
                        ))
            else:
                # Otherwise, use wait with timeout
                done, pending = await asyncio.wait(
                    tasks,
                    timeout=timeout,
                    return_when=asyncio.ALL_COMPLETED
                )
                
                # Process completed tasks
                for task in done:
                    try:
                        result = task.result()
                        results.append(result)
                    except Exception as e:
                        logger.error(f"Error in parallel inference: {str(e)}")
                        results.append(InferenceResponse(
                            model_id="unknown",  # We don't know which model this was
                            outputs="Error during inference",
                            metadata={"error": str(e)}
                        ))
                
                # Cancel pending tasks if timeout occurred
                for task in pending:
                    task.cancel()
                    results.append(InferenceResponse(
                        model_id="unknown",  # We don't know which model this was
                        outputs="Timeout during inference",
                        metadata={"error": "Timeout"}
                    ))
        
        except asyncio.TimeoutError:
            # Handle timeout
            logger.warning("Timeout in parallel inference")
            
            # Cancel all pending tasks
            for task in pending:
                if not task.done():
                    task.cancel()
            
            # Add timeout responses for models that didn't complete
            completed_models = [r.model_id for r in results if hasattr(r, 'model_id')]
            for model_id in model_ids:
                if model_id not in completed_models:
                    results.append(InferenceResponse(
                        model_id=model_id,
                        outputs="Timeout during inference",
                        metadata={"error": "Timeout"}
                    ))
        
        # Update performance history
        for response in results:
            if hasattr(response, 'model_id') and response.model_id:
                model_id = response.model_id
                
                # Initialize history if needed
                if model_id not in self.model_performance_history:
                    self.model_performance_history[model_id] = {
                        'success_count': 0,
                        'error_count': 0,
                        'total_latency': 0,
                        'success_rate': 0.0,
                        'avg_latency': 0.0
                    }
                
                history = self.model_performance_history[model_id]
                
                # Check if response has error
                has_error = (
                    isinstance(response.metadata, dict) and 
                    'error' in response.metadata
                )
                
                if has_error:
                    history['error_count'] += 1
                else:
                    history['success_count'] += 1
                    
                    # Update latency if available
                    if isinstance(response.metadata, dict) and 'processing_time_ms' in response.metadata:
                        latency = response.metadata['processing_time_ms']
                        history['total_latency'] += latency
                
                # Update derived metrics
                total = history['success_count'] + history['error_count']
                history['success_rate'] = history['success_count'] / total if total > 0 else 0.0
                history['avg_latency'] = (
                    history['total_latency'] / history['success_count'] 
                    if history['success_count'] > 0 else 0.0
                )
        
        return results
    
    async def update_model_usage_stats(self, model_id: str, usage_data: Dict[str, Any]):
        """
        Update usage statistics for a model.
        
        Args:
            model_id: ID of the model
            usage_data: Usage data to update
        """
        if model_id not in self.model_usage_stats:
            self.model_usage_stats[model_id] = {
                'call_count': 0,
                'total_tokens': 0,
                'total_processing_time': 0,
                'last_used': None
            }
        
        stats = self.model_usage_stats[model_id]
        
        # Update call count
        stats['call_count'] += 1
        
        # Update tokens if available
        if 'tokens' in usage_data:
            stats['total_tokens'] += usage_data['tokens']
        
        # Update processing time if available
        if 'processing_time' in usage_data:
            stats['total_processing_time'] += usage_data['processing_time']
        
        # Update last used timestamp
        stats['last_used'] = time.time()
    
    async def get_model_usage_stats(self, model_id: str) -> Optional[Dict[str, Any]]:
        """
        Get usage statistics for a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Usage statistics or None if not available
        """
        return self.model_usage_stats.get(model_id)
    
    async def get_model_performance_history(self, model_id: str) -> Optional[Dict[str, Any]]:
        """
        Get performance history for a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Performance history or None if not available
        """
        return self.model_performance_history.get(model_id)


# Factory function
def get_enhanced_orchestrator() -> EnhancedModelOrchestrator:
    """
    Factory function to get or create an enhanced orchestrator instance.
    
    Returns:
        EnhancedModelOrchestrator instance
    """
    model_manager = get_model_manager()
    return EnhancedModelOrchestrator(model_manager)
