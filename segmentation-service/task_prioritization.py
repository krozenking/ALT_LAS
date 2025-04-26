"""
Task Prioritization Module for ALT_LAS Segmentation Service

This module provides functionality to prioritize tasks in the segmentation process
based on various factors such as dependencies, complexity, and user preferences.
"""

from typing import Dict, List, Any, Optional, Union, Tuple
import logging
from datetime import datetime
import math

from dsl_schema import AltFile, TaskSegment, TaskParameter

# Configure logging
logger = logging.getLogger('task_prioritization')

class TaskPrioritizer:
    """Class for prioritizing tasks in the segmentation process"""
    
    def __init__(self):
        """Initialize the task prioritizer"""
        # Priority weights for different factors
        self.weights = {
            "dependency": 0.35,    # Weight for dependency factor
            "complexity": 0.25,    # Weight for complexity factor
            "urgency": 0.20,       # Weight for urgency factor
            "user_pref": 0.15,     # Weight for user preference factor
            "confidence": 0.05     # Weight for confidence factor
        }
        
        # Task type complexity scores (1-10 scale)
        self.task_complexity = {
            "search": 3,           # Search tasks are relatively simple
            "create": 7,           # Create tasks are more complex
            "analyze": 8,          # Analyze tasks are complex
            "open": 2,             # Open tasks are simple
            "transform": 6,        # Transform tasks are moderately complex
            "execute": 5,          # Execute tasks are moderately complex
            "summarize": 6,        # Summarize tasks are moderately complex
            "schedule": 4          # Schedule tasks are moderately simple
        }
        
        # Default urgency for tasks (can be overridden by metadata)
        self.default_urgency = 5   # Medium urgency (1-10 scale)
        
        # Default user preference for tasks (can be overridden by metadata)
        self.default_user_pref = 5 # Medium preference (1-10 scale)
    
    def prioritize_alt_file(self, alt_file: AltFile) -> AltFile:
        """
        Prioritize tasks in an ALT file
        
        Args:
            alt_file: ALT file to prioritize
            
        Returns:
            Prioritized ALT file
        """
        # Calculate priorities for each segment
        priorities = {}
        for segment in alt_file.segments:
            priority = self.calculate_priority(segment, alt_file)
            priorities[segment.id] = priority
        
        # Add priority to segment metadata
        for segment in alt_file.segments:
            segment.metadata["priority"] = priorities[segment.id]
            segment.metadata["priority_score"] = round(priorities[segment.id] * 10) / 10  # Round to 1 decimal place
        
        # Sort segments by priority (descending)
        alt_file.segments.sort(key=lambda s: priorities[s.id], reverse=True)
        
        # Add execution order to segment metadata
        for i, segment in enumerate(alt_file.segments):
            segment.metadata["execution_order"] = i + 1
        
        # Add prioritization metadata to ALT file
        alt_file.metadata["prioritized"] = True
        alt_file.metadata["prioritization_timestamp"] = datetime.now().isoformat()
        
        return alt_file
    
    def calculate_priority(self, segment: TaskSegment, alt_file: AltFile) -> float:
        """
        Calculate priority for a task segment
        
        Args:
            segment: Task segment to prioritize
            alt_file: Parent ALT file
            
        Returns:
            Priority score (0-1 scale)
        """
        # Calculate individual factors
        dependency_factor = self._calculate_dependency_factor(segment, alt_file)
        complexity_factor = self._calculate_complexity_factor(segment)
        urgency_factor = self._calculate_urgency_factor(segment)
        user_pref_factor = self._calculate_user_preference_factor(segment, alt_file)
        confidence_factor = self._calculate_confidence_factor(segment)
        
        # Calculate weighted sum
        priority = (
            self.weights["dependency"] * dependency_factor +
            self.weights["complexity"] * complexity_factor +
            self.weights["urgency"] * urgency_factor +
            self.weights["user_pref"] * user_pref_factor +
            self.weights["confidence"] * confidence_factor
        )
        
        # Normalize to 0-1 range
        priority = max(0.0, min(1.0, priority))
        
        # Log priority calculation
        logger.debug(f"Priority calculation for segment {segment.id}:")
        logger.debug(f"  Dependency factor: {dependency_factor} (weight: {self.weights['dependency']})")
        logger.debug(f"  Complexity factor: {complexity_factor} (weight: {self.weights['complexity']})")
        logger.debug(f"  Urgency factor: {urgency_factor} (weight: {self.weights['urgency']})")
        logger.debug(f"  User preference factor: {user_pref_factor} (weight: {self.weights['user_pref']})")
        logger.debug(f"  Confidence factor: {confidence_factor} (weight: {self.weights['confidence']})")
        logger.debug(f"  Final priority: {priority}")
        
        return priority
    
    def _calculate_dependency_factor(self, segment: TaskSegment, alt_file: AltFile) -> float:
        """
        Calculate dependency factor for a task segment
        
        Args:
            segment: Task segment to calculate dependency factor for
            alt_file: Parent ALT file
            
        Returns:
            Dependency factor (0-1 scale)
        """
        # If segment has no dependencies, it should be prioritized higher
        if not segment.dependencies:
            return 1.0
        
        # Check if all dependencies are satisfied
        all_segment_ids = [s.id for s in alt_file.segments]
        unsatisfied_deps = [dep for dep in segment.dependencies if dep not in all_segment_ids]
        
        # If there are unsatisfied dependencies, lower priority
        if unsatisfied_deps:
            return 0.0
        
        # Calculate dependency depth (how deep in the dependency chain)
        depth = self._calculate_dependency_depth(segment, alt_file)
        
        # Normalize depth to 0-1 scale (deeper = lower priority)
        max_depth = len(alt_file.segments)
        depth_factor = 1.0 - (depth / max_depth)
        
        return depth_factor
    
    def _calculate_dependency_depth(self, segment: TaskSegment, alt_file: AltFile) -> int:
        """
        Calculate dependency depth for a task segment
        
        Args:
            segment: Task segment to calculate dependency depth for
            alt_file: Parent ALT file
            
        Returns:
            Dependency depth (0 = no dependencies, 1+ = has dependencies)
        """
        if not segment.dependencies:
            return 0
        
        # Find max depth of dependencies
        max_depth = 0
        for dep_id in segment.dependencies:
            # Find the dependency segment
            dep_segment = next((s for s in alt_file.segments if s.id == dep_id), None)
            if dep_segment:
                # Calculate depth recursively
                depth = 1 + self._calculate_dependency_depth(dep_segment, alt_file)
                max_depth = max(max_depth, depth)
        
        return max_depth
    
    def _calculate_complexity_factor(self, segment: TaskSegment) -> float:
        """
        Calculate complexity factor for a task segment
        
        Args:
            segment: Task segment to calculate complexity factor for
            
        Returns:
            Complexity factor (0-1 scale)
        """
        # Get complexity score for task type
        complexity = self.task_complexity.get(segment.task_type, 5)  # Default to medium complexity
        
        # Adjust complexity based on parameters
        param_complexity = len(segment.parameters) * 0.5  # More parameters = more complex
        
        # Adjust complexity based on content length
        content_complexity = min(len(segment.content) / 100, 1.0)  # Longer content = more complex
        
        # Calculate final complexity
        final_complexity = (complexity + param_complexity + content_complexity) / 12  # Normalize to 0-1 scale
        
        return final_complexity
    
    def _calculate_urgency_factor(self, segment: TaskSegment) -> float:
        """
        Calculate urgency factor for a task segment
        
        Args:
            segment: Task segment to calculate urgency factor for
            
        Returns:
            Urgency factor (0-1 scale)
        """
        # Check if urgency is specified in metadata
        if "urgency" in segment.metadata:
            urgency = segment.metadata["urgency"]
            # Convert string values to numeric
            if isinstance(urgency, str):
                urgency_map = {"low": 3, "medium": 5, "high": 8, "critical": 10}
                urgency = urgency_map.get(urgency.lower(), self.default_urgency)
        else:
            # Use default urgency
            urgency = self.default_urgency
        
        # Check if deadline is specified in metadata
        if "deadline" in segment.metadata:
            try:
                deadline_str = segment.metadata["deadline"]
                deadline = datetime.fromisoformat(deadline_str)
                now = datetime.now()
                
                # Calculate time until deadline
                time_until = (deadline - now).total_seconds()
                
                # Adjust urgency based on time until deadline
                if time_until <= 0:
                    # Past deadline, maximum urgency
                    urgency = 10
                elif time_until < 3600:  # Less than 1 hour
                    urgency = max(urgency, 9)
                elif time_until < 86400:  # Less than 1 day
                    urgency = max(urgency, 8)
                elif time_until < 259200:  # Less than 3 days
                    urgency = max(urgency, 7)
            except (ValueError, TypeError):
                # Invalid deadline format, ignore
                pass
        
        # Normalize urgency to 0-1 scale
        urgency_factor = urgency / 10
        
        return urgency_factor
    
    def _calculate_user_preference_factor(self, segment: TaskSegment, alt_file: AltFile) -> float:
        """
        Calculate user preference factor for a task segment
        
        Args:
            segment: Task segment to calculate user preference factor for
            alt_file: Parent ALT file
            
        Returns:
            User preference factor (0-1 scale)
        """
        # Check if user preference is specified in segment metadata
        if "user_preference" in segment.metadata:
            pref = segment.metadata["user_preference"]
            # Convert string values to numeric
            if isinstance(pref, str):
                pref_map = {"low": 3, "medium": 5, "high": 8}
                pref = pref_map.get(pref.lower(), self.default_user_pref)
        # Check if user preference is specified in ALT file metadata
        elif "user_preferences" in alt_file.metadata:
            prefs = alt_file.metadata["user_preferences"]
            if isinstance(prefs, dict):
                # Check if there's a preference for this task type
                pref = prefs.get(segment.task_type, self.default_user_pref)
            else:
                pref = self.default_user_pref
        else:
            # Use default user preference
            pref = self.default_user_pref
        
        # Normalize preference to 0-1 scale
        pref_factor = pref / 10
        
        return pref_factor
    
    def _calculate_confidence_factor(self, segment: TaskSegment) -> float:
        """
        Calculate confidence factor for a task segment
        
        Args:
            segment: Task segment to calculate confidence factor for
            
        Returns:
            Confidence factor (0-1 scale)
        """
        # Check if confidence is specified in metadata
        if "confidence" in segment.metadata:
            confidence = segment.metadata["confidence"]
            # Ensure confidence is a float between 0 and 1
            if isinstance(confidence, (int, float)):
                confidence = max(0.0, min(1.0, float(confidence)))
            else:
                confidence = 0.5  # Default to medium confidence
        else:
            # Default to medium confidence
            confidence = 0.5
        
        return confidence

# Create a global instance
task_prioritizer = TaskPrioritizer()

# Function to get the task prioritizer instance
def get_task_prioritizer() -> TaskPrioritizer:
    """
    Get the task prioritizer instance
    
    Returns:
        Task prioritizer instance
    """
    return task_prioritizer

# Main function for testing
if __name__ == "__main__":
    # Test the task prioritizer
    from dsl_schema import AltFile, TaskSegment, TaskParameter
    
    # Create a sample ALT file
    param1 = TaskParameter(
        name="query",
        value="information about AI",
        type="string",
        required=True
    )
    
    param2 = TaskParameter(
        name="format",
        value="pdf",
        type="string",
        required=True
    )
    
    param3 = TaskParameter(
        name="subject",
        value="AI research papers",
        type="string",
        required=True
    )
    
    segment1 = TaskSegment(
        id="task1",
        task_type="search",
        content="Search for information about AI",
        parameters=[param1],
        metadata={"confidence": 0.95}
    )
    
    segment2 = TaskSegment(
        id="task2",
        task_type="create",
        content="Create a report",
        parameters=[param2],
        dependencies=["task1"],
        metadata={"confidence": 0.9, "urgency": "high"}
    )
    
    segment3 = TaskSegment(
        id="task3",
        task_type="analyze",
        content="Analyze AI research papers",
        parameters=[param3],
        dependencies=["task1"],
        metadata={"confidence": 0.8}
    )
    
    alt_file = AltFile(
        command="Search for information about AI, analyze research papers, and create a report",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[segment1, segment2, segment3],
        metadata={"source": "user_input"}
    )
    
    # Prioritize tasks
    prioritizer = TaskPrioritizer()
    prioritized_alt = prioritizer.prioritize_alt_file(alt_file)
    
    # Print results
    print(f"Prioritized segments:")
    for i, segment in enumerate(prioritized_alt.segments):
        print(f"{i+1}. {segment.task_type}: {segment.content}")
        print(f"   Priority: {segment.metadata.get('priority_score')}")
        print(f"   Execution order: {segment.metadata.get('execution_order')}")
        print(f"   Dependencies: {segment.dependencies}")
