"""
Model Orchestrator Service

This module provides orchestration capabilities for multiple AI models,
including model selection, parallel execution, and result merging.
"""

import asyncio
import logging
import time
from typing import Dict, Any, List, Optional, Union, Callable, Tuple
import json
from datetime import datetime

from ..config import config
from ..models.model_manager import ModelManager

logger = logging.getLogger("ai_orchestrator.services.model_orchestrator")

class ModelOrchestrator:
    """
    Orchestrates multiple AI models for parallel execution, 
    intelligent model selection, and result merging.
    """
    
    def __init__(self, model_manager: Optional[ModelManager] = None):
        """
        Initialize the model orchestrator.
        
        Args:
            model_manager: Model manager instance to use
        """
        self.model_manager = model_manager
        self.stats = {
            "total_orchestrations": 0,
            "successful_orchestrations": 0,
            "failed_orchestrations": 0,
            "average_latency_ms": 0,
            "model_selections": {},
            "parallel_executions": 0,
            "result_merges": 0
        }
        self.selection_strategies = {
            "default": self._default_selection_strategy,
            "performance": self._performance_selection_strategy,
            "quality": self._quality_selection_strategy,
            "balanced": self._balanced_selection_strategy,
            "ensemble": self._ensemble_selection_strategy
        }
        self.merge_strategies = {
            "default": self._default_merge_strategy,
            "weighted": self._weighted_merge_strategy,
            "voting": self._voting_merge_strategy,
            "chain": self._chain_merge_strategy,
            "best_confidence": self._best_confidence_merge_strategy
        }
    
    async def initialize(self) -> bool:
        """
        Initialize the model orchestrator.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Initializing model orchestrator")
            
            # Initialize model manager if not provided
            if not self.model_manager:
                self.model_manager = ModelManager()
                await self.model_manager.initialize()
            
            logger.info("Model orchestrator initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing model orchestrator: {str(e)}")
            return False
    
    async def orchestrate(
        self, 
        input_data: Union[str, Dict[str, Any]], 
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Orchestrate model execution based on input and parameters.
        
        Args:
            input_data: Input data for the models
            parameters: Orchestration parameters
            
        Returns:
            Orchestration result
        """
        start_time = time.time()
        parameters = parameters or {}
        
        try:
            logger.info("Starting model orchestration")
            self.stats["total_orchestrations"] += 1
            
            # Extract orchestration parameters
            model_type = parameters.get("model_type", "llm")
            selection_strategy = parameters.get("selection_strategy", "default")
            parallel_execution = parameters.get("parallel_execution", False)
            merge_strategy = parameters.get("merge_strategy", "default")
            timeout_ms = parameters.get("timeout_ms", 30000)  # Default 30s timeout
            
            # Select models to use
            selected_models = await self._select_models(
                model_type=model_type,
                selection_strategy=selection_strategy,
                parameters=parameters
            )
            
            # Execute models
            if parallel_execution and len(selected_models) > 1:
                self.stats["parallel_executions"] += 1
                results = await self._execute_models_parallel(
                    selected_models=selected_models,
                    input_data=input_data,
                    parameters=parameters,
                    timeout_ms=timeout_ms
                )
            else:
                results = await self._execute_models_sequential(
                    selected_models=selected_models,
                    input_data=input_data,
                    parameters=parameters,
                    timeout_ms=timeout_ms
                )
            
            # Merge results if multiple models were used
            if len(results) > 1:
                self.stats["result_merges"] += 1
                final_result = await self._merge_results(
                    results=results,
                    merge_strategy=merge_strategy,
                    parameters=parameters
                )
            elif len(results) == 1:
                # Single model result
                model_name = list(results.keys())[0]
                final_result = {
                    "result": results[model_name]["result"],
                    "model": model_name,
                    "confidence": results[model_name].get("confidence", 1.0),
                    "latency_ms": results[model_name].get("latency_ms", 0)
                }
            else:
                # No results
                raise ValueError("No model results were produced")
            
            # Calculate and update stats
            latency_ms = (time.time() - start_time) * 1000
            self._update_stats(latency_ms, True)
            
            # Add orchestration metadata
            final_result["orchestration"] = {
                "selected_models": list(selected_models),
                "selection_strategy": selection_strategy,
                "parallel_execution": parallel_execution and len(selected_models) > 1,
                "merge_strategy": merge_strategy if len(results) > 1 else "none",
                "latency_ms": latency_ms
            }
            
            logger.info(f"Model orchestration completed successfully in {latency_ms:.2f}ms")
            return final_result
            
        except Exception as e:
            # Calculate and update stats
            latency_ms = (time.time() - start_time) * 1000
            self._update_stats(latency_ms, False)
            
            logger.error(f"Error in model orchestration: {str(e)}")
            raise
    
    async def _select_models(
        self, 
        model_type: str, 
        selection_strategy: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Select models to use based on the strategy.
        
        Args:
            model_type: Type of models to select
            selection_strategy: Strategy for model selection
            parameters: Additional parameters for selection
            
        Returns:
            Dictionary of selected model names and their parameters
        """
        try:
            # Update stats
            if selection_strategy not in self.stats["model_selections"]:
                self.stats["model_selections"][selection_strategy] = 0
            self.stats["model_selections"][selection_strategy] += 1
            
            # Get the selection strategy function
            strategy_func = self.selection_strategies.get(
                selection_strategy, 
                self._default_selection_strategy
            )
            
            # Execute the strategy
            selected_models = await strategy_func(model_type, parameters)
            
            # Validate selection
            if not selected_models:
                logger.warning(f"No models selected with strategy '{selection_strategy}', using default")
                selected_models = await self._default_selection_strategy(model_type, parameters)
            
            logger.info(f"Selected {len(selected_models)} models using '{selection_strategy}' strategy")
            return selected_models
            
        except Exception as e:
            logger.error(f"Error selecting models: {str(e)}")
            # Fall back to default strategy
            return await self._default_selection_strategy(model_type, parameters)
    
    async def _default_selection_strategy(
        self, 
        model_type: str, 
        parameters: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Default model selection strategy - selects a single default model.
        
        Args:
            model_type: Type of models to select
            parameters: Additional parameters for selection
            
        Returns:
            Dictionary of selected model names and their parameters
        """
        # Check if specific model is requested
        if "model_name" in parameters:
            model_name = parameters["model_name"]
            return {
                f"{model_type}:{model_name}": {
                    "weight": 1.0,
                    "parameters": parameters.get("model_parameters", {})
                }
            }
        
        # Use default model for the type
        if model_type == "llm":
            default_model = config["models"].get("default_llm", "default_llm")
        elif model_type == "vision":
            default_model = config["models"].get("default_vision", "default_vision")
        elif model_type == "voice":
            default_model = config["models"].get("default_voice", "default_voice")
        else:
            default_model = f"default_{model_type}"
        
        return {
            f"{model_type}:{default_model}": {
                "weight": 1.0,
                "parameters": parameters.get("model_parameters", {})
            }
        }
    
    async def _performance_selection_strategy(
        self, 
        model_type: str, 
        parameters: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Performance-based model selection strategy - selects the fastest model.
        
        Args:
            model_type: Type of models to select
            parameters: Additional parameters for selection
            
        Returns:
            Dictionary of selected model names and their parameters
        """
        # Get available models of the specified type
        available_models = {}
        for key in self.model_manager.models:
            if key.startswith(f"{model_type}:"):
                available_models[key] = self.model_manager.models[key]
        
        if not available_models:
            return await self._default_selection_strategy(model_type, parameters)
        
        # Get performance metrics for available models
        model_metrics = {}
        for model_key in available_models:
            # Get average latency from stats
            model_usage = self.model_manager.stats.get("model_usage", {}).get(model_key, {})
            avg_latency = 0
            if "latencies" in model_usage and model_usage["latencies"]:
                avg_latency = sum(model_usage["latencies"]) / len(model_usage["latencies"])
            
            model_metrics[model_key] = {
                "avg_latency": avg_latency,
                "requests": model_usage.get("requests", 0)
            }
        
        # Sort by latency (fastest first)
        sorted_models = sorted(
            model_metrics.items(), 
            key=lambda x: (x[1]["avg_latency"] if x[1]["requests"] > 0 else float('inf'))
        )
        
        # Select the fastest model
        if sorted_models:
            fastest_model = sorted_models[0][0]
            return {
                fastest_model: {
                    "weight": 1.0,
                    "parameters": parameters.get("model_parameters", {})
                }
            }
        
        # Fall back to default if no models with metrics
        return await self._default_selection_strategy(model_type, parameters)
    
    async def _quality_selection_strategy(
        self, 
        model_type: str, 
        parameters: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Quality-based model selection strategy - selects the highest quality model.
        
        Args:
            model_type: Type of models to select
            parameters: Additional parameters for selection
            
        Returns:
            Dictionary of selected model names and their parameters
        """
        # Get available models of the specified type
        available_models = {}
        for key in self.model_manager.models:
            if key.startswith(f"{model_type}:"):
                available_models[key] = self.model_manager.models[key]
        
        if not available_models:
            return await self._default_selection_strategy(model_type, parameters)
        
        # In a real implementation, this would use quality metrics
        # For now, we'll use a simple heuristic based on model name
        # (assuming models with "large" in the name are higher quality)
        quality_scores = {}
        for model_key in available_models:
            model_name = model_key.split(":", 1)[1]
            
            # Simple heuristic for quality score
            score = 0.5  # Default score
            if "large" in model_name.lower():
                score += 0.3
            if "xl" in model_name.lower():
                score += 0.2
            if "tiny" in model_name.lower():
                score -= 0.3
            if "small" in model_name.lower():
                score -= 0.1
            
            quality_scores[model_key] = score
        
        # Sort by quality score (highest first)
        sorted_models = sorted(
            quality_scores.items(), 
            key=lambda x: x[1],
            reverse=True
        )
        
        # Select the highest quality model
        if sorted_models:
            best_model = sorted_models[0][0]
            return {
                best_model: {
                    "weight": 1.0,
                    "parameters": parameters.get("model_parameters", {})
                }
            }
        
        # Fall back to default if no models with scores
        return await self._default_selection_strategy(model_type, parameters)
    
    async def _balanced_selection_strategy(
        self, 
        model_type: str, 
        parameters: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Balanced model selection strategy - balances performance and quality.
        
        Args:
            model_type: Type of models to select
            parameters: Additional parameters for selection
            
        Returns:
            Dictionary of selected model names and their parameters
        """
        # Get available models of the specified type
        available_models = {}
        for key in self.model_manager.models:
            if key.startswith(f"{model_type}:"):
                available_models[key] = self.model_manager.models[key]
        
        if not available_models:
            return await self._default_selection_strategy(model_type, parameters)
        
        # Calculate balanced scores (combination of performance and quality)
        balanced_scores = {}
        for model_key in available_models:
            model_name = model_key.split(":", 1)[1]
            
            # Get performance score (inverse of latency)
            model_usage = self.model_manager.stats.get("model_usage", {}).get(model_key, {})
            perf_score = 0.5  # Default score
            if "latencies" in model_usage and model_usage["latencies"]:
                avg_latency = sum(model_usage["latencies"]) / len(model_usage["latencies"])
                # Convert latency to score (lower latency = higher score)
                perf_score = 1.0 / (1.0 + avg_latency / 1000)  # Normalize to 0-1 range
            
            # Simple heuristic for quality score
            quality_score = 0.5  # Default score
            if "large" in model_name.lower():
                quality_score += 0.3
            if "xl" in model_name.lower():
                quality_score += 0.2
            if "tiny" in model_name.lower():
                quality_score -= 0.3
            if "small" in model_name.lower():
                quality_score -= 0.1
            
            # Calculate balanced score
            balanced_scores[model_key] = (perf_score + quality_score) / 2
        
        # Sort by balanced score (highest first)
        sorted_models = sorted(
            balanced_scores.items(), 
            key=lambda x: x[1],
            reverse=True
        )
        
        # Select the model with the best balanced score
        if sorted_models:
            best_model = sorted_models[0][0]
            return {
                best_model: {
                    "weight": 1.0,
                    "parameters": parameters.get("model_parameters", {})
                }
            }
        
        # Fall back to default if no models with scores
        return await self._default_selection_strategy(model_type, parameters)
    
    async def _ensemble_selection_strategy(
        self, 
        model_type: str, 
        parameters: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Ensemble model selection strategy - selects multiple models for ensemble.
        
        Args:
            model_type: Type of models to select
            parameters: Additional parameters for selection
            
        Returns:
            Dictionary of selected model names and their parameters
        """
        # Get available models of the specified type
        available_models = {}
        for key in self.model_manager.models:
            if key.startswith(f"{model_type}:"):
                available_models[key] = self.model_manager.models[key]
        
        if not available_models:
            return await self._default_selection_strategy(model_type, parameters)
        
        # Get ensemble size
        ensemble_size = parameters.get("ensemble_size", 3)
        ensemble_size = min(ensemble_size, len(available_models))
        
        # Calculate model scores for selection
        model_scores = {}
        for model_key in available_models:
            model_name = model_key.split(":", 1)[1]
            
            # Simple heuristic for model score
            score = 0.5  # Default score
            
            # Adjust score based on model name
            if "large" in model_name.lower():
                score += 0.2
            if "xl" in model_name.lower():
                score += 0.1
            if "tiny" in model_name.lower():
                score -= 0.2
            if "small" in model_name.lower():
                score -= 0.1
            
            # Adjust score based on usage
            model_usage = self.model_manager.stats.get("model_usage", {}).get(model_key, {})
            requests = model_usage.get("requests", 0)
            if requests > 0:
                # Models with more usage get a slight boost
                score += min(0.1, requests / 1000)
            
            model_scores[model_key] = score
        
        # Sort by score (highest first)
        sorted_models = sorted(
            model_scores.items(), 
            key=lambda x: x[1],
            reverse=True
        )
        
        # Select top N models for ensemble
        selected_models = {}
        for i in range(min(ensemble_size, len(sorted_models))):
            model_key = sorted_models[i][0]
            score = sorted_models[i][1]
            
            # Convert score to weight (normalize)
            weight = score / sum(s[1] for s in sorted_models[:ensemble_size])
            
            selected_models[model_key] = {
                "weight": weight,
                "parameters": parameters.get("model_parameters", {})
            }
        
        # If no models were selected, fall back to default
        if not selected_models:
            return await self._default_selection_strategy(model_type, parameters)
        
        return selected_models
    
    async def _execute_models_parallel(
        self, 
        selected_models: Dict[str, Dict[str, Any]],
        input_data: Union[str, Dict[str, Any]],
        parameters: Dict[str, Any],
        timeout_ms: int
    ) -> Dict[str, Dict[str, Any]]:
        """
        Execute multiple models in parallel.
        
        Args:
            selected_models: Dictionary of selected models and their parameters
            input_data: Input data for the models
            parameters: Additional parameters for execution
            timeout_ms: Timeout in milliseconds
            
        Returns:
            Dictionary of model results
        """
        results = {}
        tasks = []
        
        # Create tasks for each model
        for model_key, model_config in selected_models.items():
            task = asyncio.create_task(
                self._execute_single_model(
                    model_key=model_key,
                    model_config=model_config,
                    input_data=input_data,
                    parameters=parameters
                )
            )
            tasks.append((model_key, task))
        
        # Wait for all tasks to complete or timeout
        timeout_sec = timeout_ms / 1000
        try:
            # Wait for all tasks with timeout
            done, pending = await asyncio.wait(
                [task for _, task in tasks],
                timeout=timeout_sec,
                return_when=asyncio.ALL_COMPLETED
            )
            
            # Process completed tasks
            for model_key, task in tasks:
                if task in done:
                    try:
                        result = task.result()
                        results[model_key] = result
                    except Exception as e:
                        logger.error(f"Error executing model {model_key}: {str(e)}")
                        results[model_key] = {
                            "error": str(e),
                            "success": False
                        }
                else:
                    # Task timed out
                    logger.warning(f"Model execution timed out for {model_key}")
                    results[model_key] = {
                        "error": "Execution timed out",
                        "success": False
                    }
            
            # Cancel any pending tasks
            for task in pending:
                task.cancel()
            
        except asyncio.TimeoutError:
            # Overall timeout
            logger.warning("Parallel model execution timed out")
            for model_key, task in tasks:
                if not task.done():
                    task.cancel()
        
        return results
    
    async def _execute_models_sequential(
        self, 
        selected_models: Dict[str, Dict[str, Any]],
        input_data: Union[str, Dict[str, Any]],
        parameters: Dict[str, Any],
        timeout_ms: int
    ) -> Dict[str, Dict[str, Any]]:
        """
        Execute multiple models sequentially.
        
        Args:
            selected_models: Dictionary of selected models and their parameters
            input_data: Input data for the models
            parameters: Additional parameters for execution
            timeout_ms: Timeout in milliseconds
            
        Returns:
            Dictionary of model results
        """
        results = {}
        timeout_sec = timeout_ms / 1000
        
        # Execute each model sequentially
        for model_key, model_config in selected_models.items():
            try:
                # Execute with timeout
                result = await asyncio.wait_for(
                    self._execute_single_model(
                        model_key=model_key,
                        model_config=model_config,
                        input_data=input_data,
                        parameters=parameters
                    ),
                    timeout=timeout_sec
                )
                results[model_key] = result
                
            except asyncio.TimeoutError:
                logger.warning(f"Model execution timed out for {model_key}")
                results[model_key] = {
                    "error": "Execution timed out",
                    "success": False
                }
                
            except Exception as e:
                logger.error(f"Error executing model {model_key}: {str(e)}")
                results[model_key] = {
                    "error": str(e),
                    "success": False
                }
        
        return results
    
    async def _execute_single_model(
        self, 
        model_key: str,
        model_config: Dict[str, Any],
        input_data: Union[str, Dict[str, Any]],
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a single model.
        
        Args:
            model_key: Model key (type:name)
            model_config: Model configuration
            input_data: Input data for the model
            parameters: Additional parameters for execution
            
        Returns:
            Model execution result
        """
        start_time = time.time()
        
        try:
            # Extract model type and name
            model_type, model_name = model_key.split(":", 1)
            
            # Get model parameters
            model_params = model_config.get("parameters", {})
            
            # Execute the model based on type
            if model_type == "llm":
                # Process with LLM
                result = await self.model_manager.process_llm(
                    prompt=input_data,
                    parameters={
                        "model_name": model_name,
                        **model_params
                    }
                )
                
            elif model_type == "vision":
                # Process with vision model
                result = await self.model_manager.process_vision(
                    input_data=input_data,
                    parameters={
                        "model_name": model_name,
                        **model_params
                    }
                )
                
            elif model_type == "voice":
                # Process with voice model
                result = await self.model_manager.process_voice(
                    input_data=input_data,
                    parameters={
                        "model_name": model_name,
                        **model_params
                    }
                )
                
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000
            
            # Return result with metadata
            return {
                "result": result,
                "success": True,
                "latency_ms": latency_ms,
                "confidence": 1.0,  # Default confidence
                "model_type": model_type,
                "model_name": model_name
            }
            
        except Exception as e:
            # Calculate latency even for errors
            latency_ms = (time.time() - start_time) * 1000
            
            logger.error(f"Error executing model {model_key}: {str(e)}")
            return {
                "error": str(e),
                "success": False,
                "latency_ms": latency_ms
            }
    
    async def _merge_results(
        self, 
        results: Dict[str, Dict[str, Any]],
        merge_strategy: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge results from multiple models.
        
        Args:
            results: Dictionary of model results
            merge_strategy: Strategy for merging results
            parameters: Additional parameters for merging
            
        Returns:
            Merged result
        """
        try:
            # Filter out failed results
            successful_results = {
                k: v for k, v in results.items() 
                if v.get("success", False)
            }
            
            # If no successful results, raise error
            if not successful_results:
                raise ValueError("No successful model results to merge")
            
            # If only one successful result, return it
            if len(successful_results) == 1:
                model_key = list(successful_results.keys())[0]
                return {
                    "result": successful_results[model_key]["result"],
                    "model": model_key,
                    "confidence": successful_results[model_key].get("confidence", 1.0),
                    "latency_ms": successful_results[model_key].get("latency_ms", 0)
                }
            
            # Get the merge strategy function
            strategy_func = self.merge_strategies.get(
                merge_strategy, 
                self._default_merge_strategy
            )
            
            # Execute the strategy
            merged_result = await strategy_func(successful_results, parameters)
            
            return merged_result
            
        except Exception as e:
            logger.error(f"Error merging results: {str(e)}")
            # Fall back to default strategy
            return await self._default_merge_strategy(results, parameters)
    
    async def _default_merge_strategy(
        self, 
        results: Dict[str, Dict[str, Any]],
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Default result merging strategy - selects the result with lowest latency.
        
        Args:
            results: Dictionary of model results
            parameters: Additional parameters for merging
            
        Returns:
            Merged result
        """
        # Filter out failed results
        successful_results = {
            k: v for k, v in results.items() 
            if v.get("success", False)
        }
        
        # If no successful results, return error
        if not successful_results:
            return {
                "error": "No successful model results to merge",
                "success": False
            }
        
        # If only one successful result, return it
        if len(successful_results) == 1:
            model_key = list(successful_results.keys())[0]
            return {
                "result": successful_results[model_key]["result"],
                "model": model_key,
                "confidence": successful_results[model_key].get("confidence", 1.0),
                "latency_ms": successful_results[model_key].get("latency_ms", 0)
            }
        
        # Sort by latency (lowest first)
        sorted_results = sorted(
            successful_results.items(),
            key=lambda x: x[1].get("latency_ms", float('inf'))
        )
        
        # Select the result with lowest latency
        fastest_model_key, fastest_result = sorted_results[0]
        
        return {
            "result": fastest_result["result"],
            "model": fastest_model_key,
            "confidence": fastest_result.get("confidence", 1.0),
            "latency_ms": fastest_result.get("latency_ms", 0),
            "merge_info": {
                "strategy": "default",
                "models_considered": len(successful_results)
            }
        }
    
    async def _weighted_merge_strategy(
        self, 
        results: Dict[str, Dict[str, Any]],
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Weighted result merging strategy - combines results with weights.
        
        Args:
            results: Dictionary of model results
            parameters: Additional parameters for merging
            
        Returns:
            Merged result
        """
        # Filter out failed results
        successful_results = {
            k: v for k, v in results.items() 
            if v.get("success", False)
        }
        
        # If no successful results, return error
        if not successful_results:
            return {
                "error": "No successful model results to merge",
                "success": False
            }
        
        # If only one successful result, return it
        if len(successful_results) == 1:
            model_key = list(successful_results.keys())[0]
            return {
                "result": successful_results[model_key]["result"],
                "model": model_key,
                "confidence": successful_results[model_key].get("confidence", 1.0),
                "latency_ms": successful_results[model_key].get("latency_ms", 0)
            }
        
        # Get weights for each model
        weights = {}
        total_weight = 0
        
        for model_key, result in successful_results.items():
            # Get model weight from parameters or use default
            model_type, model_name = model_key.split(":", 1)
            weight_key = f"{model_type}:{model_name}_weight"
            
            # Try to get weight from parameters
            weight = parameters.get(weight_key, None)
            
            # If not specified, use inverse latency as weight
            if weight is None:
                latency = result.get("latency_ms", 100)  # Default to 100ms if not available
                weight = 1.0 / max(1.0, latency)  # Avoid division by zero
            
            weights[model_key] = weight
            total_weight += weight
        
        # Normalize weights
        if total_weight > 0:
            for model_key in weights:
                weights[model_key] /= total_weight
        
        # For text results, we'll use a simple weighted selection
        # In a real implementation, this would be more sophisticated
        # based on the type of result (text, image, audio, etc.)
        
        # Sort by weight (highest first)
        sorted_results = sorted(
            [(k, v, weights[k]) for k, v in successful_results.items()],
            key=lambda x: x[2],
            reverse=True
        )
        
        # Select the result with highest weight
        best_model_key, best_result, best_weight = sorted_results[0]
        
        return {
            "result": best_result["result"],
            "model": best_model_key,
            "confidence": best_result.get("confidence", 1.0) * best_weight,
            "latency_ms": best_result.get("latency_ms", 0),
            "merge_info": {
                "strategy": "weighted",
                "models_considered": len(successful_results),
                "weights": weights
            }
        }
    
    async def _voting_merge_strategy(
        self, 
        results: Dict[str, Dict[str, Any]],
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Voting result merging strategy - selects the most common result.
        
        Args:
            results: Dictionary of model results
            parameters: Additional parameters for merging
            
        Returns:
            Merged result
        """
        # Filter out failed results
        successful_results = {
            k: v for k, v in results.items() 
            if v.get("success", False)
        }
        
        # If no successful results, return error
        if not successful_results:
            return {
                "error": "No successful model results to merge",
                "success": False
            }
        
        # If only one successful result, return it
        if len(successful_results) == 1:
            model_key = list(successful_results.keys())[0]
            return {
                "result": successful_results[model_key]["result"],
                "model": model_key,
                "confidence": successful_results[model_key].get("confidence", 1.0),
                "latency_ms": successful_results[model_key].get("latency_ms", 0)
            }
        
        # Count occurrences of each result
        result_counts = {}
        result_models = {}
        result_latencies = {}
        
        for model_key, result in successful_results.items():
            # Convert result to string for comparison
            result_str = str(result["result"])
            
            if result_str not in result_counts:
                result_counts[result_str] = 0
                result_models[result_str] = []
                result_latencies[result_str] = []
            
            result_counts[result_str] += 1
            result_models[result_str].append(model_key)
            result_latencies[result_str].append(result.get("latency_ms", 0))
        
        # Find the most common result
        most_common_result = max(result_counts.items(), key=lambda x: x[1])
        result_str = most_common_result[0]
        count = most_common_result[1]
        
        # Calculate confidence based on agreement
        confidence = count / len(successful_results)
        
        # Calculate average latency for this result
        avg_latency = sum(result_latencies[result_str]) / len(result_latencies[result_str])
        
        # Try to parse the result string back to original type
        try:
            # Try to parse as JSON
            parsed_result = json.loads(result_str)
        except:
            # If not valid JSON, use as is
            parsed_result = result_str
        
        return {
            "result": parsed_result,
            "models": result_models[result_str],
            "confidence": confidence,
            "latency_ms": avg_latency,
            "merge_info": {
                "strategy": "voting",
                "models_considered": len(successful_results),
                "vote_count": count,
                "total_votes": len(successful_results)
            }
        }
    
    async def _chain_merge_strategy(
        self, 
        results: Dict[str, Dict[str, Any]],
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Chain result merging strategy - passes results through a chain of models.
        
        Args:
            results: Dictionary of model results
            parameters: Additional parameters for merging
            
        Returns:
            Merged result
        """
        # Filter out failed results
        successful_results = {
            k: v for k, v in results.items() 
            if v.get("success", False)
        }
        
        # If no successful results, return error
        if not successful_results:
            return {
                "error": "No successful model results to merge",
                "success": False
            }
        
        # If only one successful result, return it
        if len(successful_results) == 1:
            model_key = list(successful_results.keys())[0]
            return {
                "result": successful_results[model_key]["result"],
                "model": model_key,
                "confidence": successful_results[model_key].get("confidence", 1.0),
                "latency_ms": successful_results[model_key].get("latency_ms", 0)
            }
        
        # Get chain order from parameters or use default
        chain_order = parameters.get("chain_order", None)
        
        # If chain order not specified, sort by latency (fastest first)
        if not chain_order:
            sorted_results = sorted(
                successful_results.items(),
                key=lambda x: x[1].get("latency_ms", float('inf'))
            )
            chain_order = [k for k, _ in sorted_results]
        
        # Filter chain order to only include successful results
        chain_order = [k for k in chain_order if k in successful_results]
        
        # If no valid models in chain, use all successful results
        if not chain_order:
            chain_order = list(successful_results.keys())
        
        # Initialize with the first result
        current_result = successful_results[chain_order[0]]["result"]
        models_used = [chain_order[0]]
        total_latency = successful_results[chain_order[0]].get("latency_ms", 0)
        
        # Chain through the remaining models
        for model_key in chain_order[1:]:
            # Get the model result
            model_result = successful_results[model_key]
            
            # In a real implementation, this would process the current result
            # through the next model in the chain
            # For now, we'll just combine them
            if isinstance(current_result, str) and isinstance(model_result["result"], str):
                # For strings, append with separator
                current_result = f"{current_result}\n---\n{model_result['result']}"
            elif isinstance(current_result, dict) and isinstance(model_result["result"], dict):
                # For dicts, merge
                current_result = {**current_result, **model_result["result"]}
            else:
                # For mixed types, convert to string and append
                current_result = f"{current_result}\n---\n{model_result['result']}"
            
            # Track models used and latency
            models_used.append(model_key)
            total_latency += model_result.get("latency_ms", 0)
        
        return {
            "result": current_result,
            "models": models_used,
            "confidence": 1.0,  # Chain confidence is complex to calculate
            "latency_ms": total_latency,
            "merge_info": {
                "strategy": "chain",
                "models_considered": len(successful_results),
                "chain_order": models_used
            }
        }
    
    async def _best_confidence_merge_strategy(
        self, 
        results: Dict[str, Dict[str, Any]],
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Best confidence result merging strategy - selects the result with highest confidence.
        
        Args:
            results: Dictionary of model results
            parameters: Additional parameters for merging
            
        Returns:
            Merged result
        """
        # Filter out failed results
        successful_results = {
            k: v for k, v in results.items() 
            if v.get("success", False)
        }
        
        # If no successful results, return error
        if not successful_results:
            return {
                "error": "No successful model results to merge",
                "success": False
            }
        
        # If only one successful result, return it
        if len(successful_results) == 1:
            model_key = list(successful_results.keys())[0]
            return {
                "result": successful_results[model_key]["result"],
                "model": model_key,
                "confidence": successful_results[model_key].get("confidence", 1.0),
                "latency_ms": successful_results[model_key].get("latency_ms", 0)
            }
        
        # Sort by confidence (highest first)
        sorted_results = sorted(
            successful_results.items(),
            key=lambda x: x[1].get("confidence", 0.0),
            reverse=True
        )
        
        # Select the result with highest confidence
        best_model_key, best_result = sorted_results[0]
        
        return {
            "result": best_result["result"],
            "model": best_model_key,
            "confidence": best_result.get("confidence", 1.0),
            "latency_ms": best_result.get("latency_ms", 0),
            "merge_info": {
                "strategy": "best_confidence",
                "models_considered": len(successful_results),
                "confidence_values": {
                    k: v.get("confidence", 0.0) for k, v in successful_results.items()
                }
            }
        }
    
    def _update_stats(self, latency_ms: float, success: bool) -> None:
        """
        Update orchestration statistics.
        
        Args:
            latency_ms: Latency in milliseconds
            success: Whether the orchestration was successful
        """
        # Update success/failure counts
        if success:
            self.stats["successful_orchestrations"] += 1
        else:
            self.stats["failed_orchestrations"] += 1
        
        # Update average latency
        total_orch = self.stats["successful_orchestrations"] + self.stats["failed_orchestrations"]
        current_avg = self.stats["average_latency_ms"]
        
        if total_orch > 1:
            # Incremental average update
            self.stats["average_latency_ms"] = current_avg + (latency_ms - current_avg) / total_orch
        else:
            # First data point
            self.stats["average_latency_ms"] = latency_ms
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get orchestration statistics.
        
        Returns:
            Dictionary of statistics
        """
        return self.stats
