"""
Mode Handler Module for ALT_LAS Segmentation Service

This module provides functionality to handle different processing modes
(Normal, Dream, Explore, Chaos) for the Segmentation Service.
"""

import random
import re
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
import nltk
from nltk.corpus import wordnet

from dsl_schema import TaskSegment, TaskParameter

# Configure logging
logger = logging.getLogger('mode_handler')

class ModeHandler:
    """Class for handling different processing modes"""
    
    def __init__(self):
        """Initialize the mode handler"""
        # Creative task types for Dream mode
        self.creative_task_types = [
            "imagine", "visualize", "dream", "explore", "invent", 
            "design", "compose", "craft", "envision", "conceptualize"
        ]
        
        # Creative parameters for Dream mode
        self.creative_parameters = [
            ("style", ["artistic", "minimalist", "futuristic", "vintage", "abstract", "realistic"]),
            ("tone", ["formal", "casual", "humorous", "serious", "poetic", "technical"]),
            ("perspective", ["first-person", "third-person", "objective", "subjective"]),
            ("mood", ["happy", "sad", "excited", "calm", "mysterious", "inspiring"])
        ]
        
        # Related concepts for Explore mode
        self.related_concepts = {
            "AI": ["machine learning", "neural networks", "deep learning", "artificial intelligence", "robotics"],
            "data": ["statistics", "analytics", "big data", "data science", "visualization"],
            "report": ["document", "analysis", "summary", "presentation", "paper"],
            "search": ["find", "discover", "explore", "investigate", "research"],
            "create": ["generate", "produce", "develop", "build", "design"],
            "analyze": ["examine", "study", "evaluate", "assess", "review"]
        }
        
        # Try to download WordNet if not already available
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
    
    def apply_mode_effects(self, segments: List[TaskSegment], mode: str, chaos_level: Optional[int] = None, language: str = "en") -> List[TaskSegment]:
        """
        Apply mode-specific effects to task segments
        
        Args:
            segments: List of task segments
            mode: Processing mode (Normal, Dream, Explore, Chaos)
            chaos_level: Chaos level (1-10) for Chaos mode
            language: Language of the segments
            
        Returns:
            Modified list of task segments
        """
        if mode == "Normal":
            # Normal mode doesn't modify segments
            return segments
        
        elif mode == "Dream":
            return self._apply_dream_effects(segments, language)
        
        elif mode == "Explore":
            return self._apply_explore_effects(segments, language)
        
        elif mode == "Chaos":
            if chaos_level is None:
                chaos_level = 5  # Default to medium chaos
            return self._apply_chaos_effects(segments, chaos_level, language)
        
        else:
            logger.warning(f"Unknown mode: {mode}, using Normal mode")
            return segments
    
    def _apply_dream_effects(self, segments: List[TaskSegment], language: str) -> List[TaskSegment]:
        """
        Apply Dream mode effects to task segments
        
        Args:
            segments: List of task segments
            language: Language of the segments
            
        Returns:
            Modified list of task segments
        """
        modified_segments = []
        
        for segment in segments:
            # Create a copy of the segment to modify
            modified_segment = TaskSegment(
                id=segment.id,
                task_type=segment.task_type,
                content=segment.content,
                parameters=[param.copy() for param in segment.parameters],
                dependencies=segment.dependencies.copy(),
                metadata=segment.metadata.copy()
            )
            
            # Add Dream mode to metadata
            modified_segment.metadata["applied_mode"] = "Dream"
            
            # 30% chance to use a more creative task type
            if random.random() < 0.3:
                original_task_type = modified_segment.task_type
                modified_segment.task_type = random.choice(self.creative_task_types)
                modified_segment.metadata["original_task_type"] = original_task_type
            
            # 50% chance to add a creative parameter
            if random.random() < 0.5:
                param_name, param_values = random.choice(self.creative_parameters)
                param_value = random.choice(param_values)
                
                # Check if parameter already exists
                if not any(param.name == param_name for param in modified_segment.parameters):
                    modified_segment.parameters.append(TaskParameter(
                        name=param_name,
                        value=param_value,
                        type="string",
                        required=False,
                        description=f"Creative {param_name} added by Dream mode"
                    ))
            
            modified_segments.append(modified_segment)
        
        return modified_segments
    
    def _apply_explore_effects(self, segments: List[TaskSegment], language: str) -> List[TaskSegment]:
        """
        Apply Explore mode effects to task segments
        
        Args:
            segments: List of task segments
            language: Language of the segments
            
        Returns:
            Modified list of task segments
        """
        modified_segments = []
        
        for segment in segments:
            # Create a copy of the segment to modify
            modified_segment = TaskSegment(
                id=segment.id,
                task_type=segment.task_type,
                content=segment.content,
                parameters=[param.copy() for param in segment.parameters],
                dependencies=segment.dependencies.copy(),
                metadata=segment.metadata.copy()
            )
            
            # Add Explore mode to metadata
            modified_segment.metadata["applied_mode"] = "Explore"
            
            # Expand parameters with related concepts
            expanded_parameters = []
            for param in modified_segment.parameters:
                expanded_parameters.append(param)
                
                # Try to find related concepts for parameter value
                param_value = str(param.value).lower()
                related_terms = set()
                
                # Check our predefined related concepts
                for key, related in self.related_concepts.items():
                    if key.lower() in param_value:
                        related_terms.update(related)
                
                # Try to use WordNet for finding synonyms and related terms
                try:
                    for word in param_value.split():
                        if len(word) > 3:  # Skip short words
                            for synset in wordnet.synsets(word):
                                # Add lemma names (synonyms)
                                for lemma in synset.lemmas():
                                    if lemma.name() != word:
                                        related_terms.add(lemma.name().replace('_', ' '))
                                
                                # Add hypernyms (more general terms)
                                for hypernym in synset.hypernyms():
                                    for lemma in hypernym.lemmas():
                                        related_terms.add(lemma.name().replace('_', ' '))
                except Exception as e:
                    logger.warning(f"Error using WordNet: {e}")
                
                # Add related terms as alternatives
                if related_terms:
                    # Select up to 3 random related terms
                    selected_terms = random.sample(list(related_terms), min(3, len(related_terms)))
                    
                    # Add as alternatives parameter
                    expanded_parameters.append(TaskParameter(
                        name=f"{param.name}_alternatives",
                        value=selected_terms,
                        type="array",
                        required=False,
                        description=f"Alternative options for {param.name} added by Explore mode"
                    ))
            
            # Update parameters with expanded ones
            modified_segment.parameters = expanded_parameters
            
            modified_segments.append(modified_segment)
        
        return modified_segments
    
    def _apply_chaos_effects(self, segments: List[TaskSegment], chaos_level: int, language: str) -> List[TaskSegment]:
        """
        Apply Chaos mode effects to task segments
        
        Args:
            segments: List of task segments
            chaos_level: Chaos level (1-10)
            language: Language of the segments
            
        Returns:
            Modified list of task segments
        """
        if not segments:
            return segments
        
        # Normalize chaos level to probability (0.1 to 1.0)
        chaos_prob = chaos_level / 10.0
        
        modified_segments = []
        
        # Make a copy of all segments first
        for segment in segments:
            modified_segment = TaskSegment(
                id=segment.id,
                task_type=segment.task_type,
                content=segment.content,
                parameters=[param.copy() for param in segment.parameters],
                dependencies=segment.dependencies.copy(),
                metadata=segment.metadata.copy()
            )
            
            # Add Chaos mode to metadata
            modified_segment.metadata["applied_mode"] = "Chaos"
            modified_segment.metadata["chaos_level"] = chaos_level
            
            modified_segments.append(modified_segment)
        
        # Apply chaos effects based on chaos level
        
        # 1. Randomly swap task types
        if random.random() < chaos_prob:
            self._randomly_swap_task_types(modified_segments)
        
        # 2. Randomly modify parameters
        if random.random() < chaos_prob:
            self._randomly_modify_parameters(modified_segments, chaos_prob)
        
        # 3. Randomly add/remove dependencies
        if random.random() < chaos_prob and len(modified_segments) > 1:
            self._randomly_modify_dependencies(modified_segments, chaos_prob)
        
        # 4. Randomly duplicate or remove segments (higher chaos levels only)
        if chaos_level > 5 and random.random() < (chaos_prob - 0.5) * 2:
            modified_segments = self._randomly_duplicate_or_remove_segments(modified_segments, chaos_prob)
        
        return modified_segments
    
    def _randomly_swap_task_types(self, segments: List[TaskSegment]) -> None:
        """
        Randomly swap task types between segments
        
        Args:
            segments: List of task segments
        """
        if len(segments) < 2:
            return
        
        # Select two random segments
        idx1, idx2 = random.sample(range(len(segments)), 2)
        
        # Swap their task types
        segments[idx1].metadata["original_task_type"] = segments[idx1].task_type
        segments[idx2].metadata["original_task_type"] = segments[idx2].task_type
        
        segments[idx1].task_type, segments[idx2].task_type = segments[idx2].task_type, segments[idx1].task_type
    
    def _randomly_modify_parameters(self, segments: List[TaskSegment], chaos_prob: float) -> None:
        """
        Randomly modify parameters in segments
        
        Args:
            segments: List of task segments
            chaos_prob: Chaos probability (0.0 to 1.0)
        """
        for segment in segments:
            if not segment.parameters:
                continue
            
            # For each parameter, decide whether to modify it
            for param in segment.parameters:
                if random.random() < chaos_prob:
                    # Store original value in metadata
                    if "original_parameters" not in segment.metadata:
                        segment.metadata["original_parameters"] = {}
                    
                    segment.metadata["original_parameters"][param.name] = param.value
                    
                    # Decide what to do with the parameter
                    action = random.choice(["modify", "replace", "reverse"])
                    
                    if action == "modify" and isinstance(param.value, str):
                        # Modify string value
                        words = param.value.split()
                        if words:
                            # Shuffle words
                            random.shuffle(words)
                            param.value = " ".join(words)
                    
                    elif action == "replace":
                        # Replace with a random value
                        if param.type == "string":
                            param.value = random.choice([
                                "chaos", "random", "unexpected", "surprise", 
                                "disorder", "unpredictable", "entropy", "wild"
                            ])
                        elif param.type == "number":
                            param.value = random.randint(1, 100)
                        elif param.type == "boolean":
                            param.value = random.choice([True, False])
                    
                    elif action == "reverse" and isinstance(param.value, str):
                        # Reverse the string
                        param.value = param.value[::-1]
    
    def _randomly_modify_dependencies(self, segments: List[TaskSegment], chaos_prob: float) -> None:
        """
        Randomly modify dependencies between segments
        
        Args:
            segments: List of task segments
            chaos_prob: Chaos probability (0.0 to 1.0)
        """
        # Store original dependencies
        for segment in segments:
            segment.metadata["original_dependencies"] = segment.dependencies.copy()
        
        # For each segment, decide whether to modify its dependencies
        for i, segment in enumerate(segments):
            if random.random() < chaos_prob:
                # Clear existing dependencies
                segment.dependencies = []
                
                # Add random dependencies
                for j, other_segment in enumerate(segments):
                    if i != j and random.random() < chaos_prob:
                        segment.dependencies.append(other_segment.id)
    
    def _randomly_duplicate_or_remove_segments(self, segments: List[TaskSegment], chaos_prob: float) -> List[TaskSegment]:
        """
        Randomly duplicate or remove segments
        
        Args:
            segments: List of task segments
            chaos_prob: Chaos probability (0.0 to 1.0)
            
        Returns:
            Modified list of task segments
        """
        if not segments:
            return segments
        
        result = segments.copy()
        
        # Decide whether to duplicate or remove
        action = random.choice(["duplicate", "remove"])
        
        if action == "duplicate" and len(segments) > 0:
            # Select a random segment to duplicate
            segment_to_duplicate = random.choice(segments)
            
            # Create a copy with a new ID
            duplicate = TaskSegment(
                task_type=segment_to_duplicate.task_type,
                content=segment_to_duplicate.content,
                parameters=[param.copy() for param in segment_to_duplicate.parameters],
                dependencies=segment_to_duplicate.dependencies.copy(),
                metadata=segment_to_duplicate.metadata.copy()
            )
            
            # Add duplication info to metadata
            duplicate.metadata["duplicated_from"] = segment_to_duplicate.id
            
            # Add the duplicate to the result
            result.append(duplicate)
            
        elif action == "remove" and len(segments) > 1:
            # Select a random segment to remove
            segment_to_remove = random.choice(segments)
            
            # Remove it from the result
            result = [s for s in result if s.id != segment_to_remove.id]
            
            # Update dependencies to avoid referencing the removed segment
            for segment in result:
                segment.dependencies = [dep for dep in segment.dependencies if dep != segment_to_remove.id]
        
        return result

# Create a global instance
mode_handler = ModeHandler()

# Function to get the mode handler instance
def get_mode_handler() -> ModeHandler:
    """
    Get the mode handler instance
    
    Returns:
        Mode handler instance
    """
    return mode_handler
