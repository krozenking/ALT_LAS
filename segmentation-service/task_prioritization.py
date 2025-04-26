"""
Configurable Task Prioritization Module

This module provides a configurable task prioritization system for ALT files.
It allows customization of prioritization weights and parameters.
"""

import logging
import datetime
import json
import os
from typing import Dict, List, Any, Optional, Tuple
from dsl_schema import AltFile, TaskSegment

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("task-prioritization")

class TaskPrioritizer:
    """
    Task prioritizer for ALT files
    """
    
    def __init__(self, config_file: Optional[str] = None):
        """
        Initialize the task prioritizer
        
        Args:
            config_file: Path to configuration file
        """
        # Default configuration
        self.default_urgency = 5
        self.default_user_pref = 5
        self.dependency_weight = 0.4
        self.urgency_weight = 0.3
        self.user_pref_weight = 0.2
        self.confidence_weight = 0.1
        
        # Load configuration if provided
        if config_file and os.path.exists(config_file):
            self._load_config(config_file)
        
        # Create config directory if it doesn't exist
        self.config_dir = os.path.join(os.getcwd(), "config")
        os.makedirs(self.config_dir, exist_ok=True)
        
        # Default config file path
        self.default_config_file = os.path.join(self.config_dir, "prioritization_config.json")
        
        # Save default configuration if it doesn't exist
        if not os.path.exists(self.default_config_file):
            self._save_config(self.default_config_file)
    
    def _load_config(self, config_file: str) -> None:
        """
        Load configuration from file
        
        Args:
            config_file: Path to configuration file
        """
        try:
            with open(config_file, "r") as f:
                config = json.load(f)
            
            # Update configuration
            self.default_urgency = config.get("default_urgency", self.default_urgency)
            self.default_user_pref = config.get("default_user_preference", self.default_user_pref)
            self.dependency_weight = config.get("dependency_weight", self.dependency_weight)
            self.urgency_weight = config.get("urgency_weight", self.urgency_weight)
            self.user_pref_weight = config.get("user_preference_weight", self.user_pref_weight)
            self.confidence_weight = config.get("confidence_weight", self.confidence_weight)
            
            logger.info(f"Loaded configuration from {config_file}")
        except Exception as e:
            logger.error(f"Error loading configuration from {config_file}: {str(e)}")
    
    def _save_config(self, config_file: str) -> None:
        """
        Save configuration to file
        
        Args:
            config_file: Path to configuration file
        """
        try:
            config = {
                "default_urgency": self.default_urgency,
                "default_user_preference": self.default_user_pref,
                "dependency_weight": self.dependency_weight,
                "urgency_weight": self.urgency_weight,
                "user_preference_weight": self.user_pref_weight,
                "confidence_weight": self.confidence_weight
            }
            
            with open(config_file, "w") as f:
                json.dump(config, f, indent=2)
            
            logger.info(f"Saved configuration to {config_file}")
        except Exception as e:
            logger.error(f"Error saving configuration to {config_file}: {str(e)}")
    
    def get_config(self) -> Dict[str, Any]:
        """
        Get current configuration
        
        Returns:
            Current configuration
        """
        return {
            "default_urgency": self.default_urgency,
            "default_user_preference": self.default_user_pref,
            "dependency_weight": self.dependency_weight,
            "urgency_weight": self.urgency_weight,
            "user_preference_weight": self.user_pref_weight,
            "confidence_weight": self.confidence_weight
        }
    
    def update_config(self, config: Dict[str, Any]) -> None:
        """
        Update configuration
        
        Args:
            config: New configuration
        """
        # Update configuration
        self.default_urgency = config.get("default_urgency", self.default_urgency)
        self.default_user_pref = config.get("default_user_preference", self.default_user_pref)
        self.dependency_weight = config.get("dependency_weight", self.dependency_weight)
        self.urgency_weight = config.get("urgency_weight", self.urgency_weight)
        self.user_pref_weight = config.get("user_preference_weight", self.user_pref_weight)
        self.confidence_weight = config.get("confidence_weight", self.confidence_weight)
        
        # Save configuration
        self._save_config(self.default_config_file)
        
        logger.info("Updated configuration")
    
    def prioritize_alt_file(self, alt_file: AltFile) -> AltFile:
        """
        Prioritize tasks in an ALT file
        
        Args:
            alt_file: ALT file to prioritize
            
        Returns:
            Prioritized ALT file
        """
        try:
            logger.info(f"Prioritizing ALT file: {alt_file.id}")
            
            # Calculate priority scores for each segment
            for segment in alt_file.segments:
                # Calculate factors
                dependency_factor = self._calculate_dependency_factor(segment, alt_file)
                urgency_factor = self._calculate_urgency_factor(segment, alt_file)
                user_pref_factor = self._calculate_user_preference_factor(segment, alt_file)
                confidence_factor = self._calculate_confidence_factor(segment)
                
                # Calculate weighted priority score
                priority_score = (
                    self.dependency_weight * dependency_factor +
                    self.urgency_weight * urgency_factor +
                    self.user_pref_weight * user_pref_factor +
                    self.confidence_weight * confidence_factor
                )
                
                # Store priority score in segment metadata
                segment.metadata["priority_score"] = round(priority_score, 3)
                
                # Store individual factors for transparency
                segment.metadata["dependency_factor"] = round(dependency_factor, 3)
                segment.metadata["urgency_factor"] = round(urgency_factor, 3)
                segment.metadata["user_preference_factor"] = round(user_pref_factor, 3)
                segment.metadata["confidence_factor"] = round(confidence_factor, 3)
            
            # Determine execution order based on dependencies and priority scores
            execution_order = self._determine_execution_order(alt_file)
            
            # Store execution order in segment metadata
            for segment_id, order in execution_order.items():
                for segment in alt_file.segments:
                    if segment.id == segment_id:
                        segment.metadata["execution_order"] = order
                        break
            
            # Add prioritization metadata to ALT file
            alt_file.metadata["prioritized"] = True
            alt_file.metadata["prioritization_timestamp"] = datetime.datetime.now().isoformat()
            alt_file.metadata["prioritization_config"] = self.get_config()
            
            logger.info(f"ALT file prioritized successfully: {alt_file.id}")
            return alt_file
        except Exception as e:
            logger.error(f"Error prioritizing ALT file: {str(e)}")
            raise
    
    def _determine_execution_order(self, alt_file: AltFile) -> Dict[str, int]:
        """
        Determine execution order based on dependencies and priority scores
        
        Args:
            alt_file: ALT file
            
        Returns:
            Execution order mapping (segment_id -> order)
        """
        # Create dependency graph
        dependency_graph = {}
        for segment in alt_file.segments:
            dependency_graph[segment.id] = segment.dependencies
        
        # Topological sort with priority tie-breaking
        execution_order = {}
        visited = set()
        temp_visited = set()
        order = 1
        
        def visit(segment_id):
            nonlocal order
            
            # Check for cyclic dependencies
            if segment_id in temp_visited:
                logger.warning(f"Cyclic dependency detected for segment: {segment_id}")
                return
            
            # Skip if already visited
            if segment_id in visited:
                return
            
            # Mark as temporarily visited
            temp_visited.add(segment_id)
            
            # Visit dependencies
            for dependency in dependency_graph.get(segment_id, []):
                visit(dependency)
            
            # Mark as visited
            visited.add(segment_id)
            temp_visited.remove(segment_id)
            
            # Assign execution order
            execution_order[segment_id] = order
            order += 1
        
        # Get segments sorted by priority score (highest first)
        segments_by_priority = sorted(
            alt_file.segments,
            key=lambda s: s.metadata.get("priority_score", 0),
            reverse=True
        )
        
        # Visit segments in priority order
        for segment in segments_by_priority:
            if segment.id not in visited:
                visit(segment.id)
        
        # Reverse the order (highest order should be first)
        max_order = max(execution_order.values())
        for segment_id in execution_order:
            execution_order[segment_id] = max_order - execution_order[segment_id] + 1
        
        return execution_order
    
    def _calculate_dependency_factor(self, segment: TaskSegment, alt_file: AltFile) -> float:
        """
        Calculate dependency factor for a task segment
        
        Args:
            segment: Task segment to calculate dependency factor for
            alt_file: Parent ALT file
            
        Returns:
            Dependency factor (0-1 scale)
        """
        # If no dependencies, assign highest dependency factor
        if not segment.dependencies:
            return 1.0
        
        # Count total segments and dependencies
        total_segments = len(alt_file.segments)
        dependency_count = len(segment.dependencies)
        
        # Calculate dependency ratio (more dependencies = lower priority)
        if total_segments > 1:
            dependency_ratio = 1.0 - (dependency_count / (total_segments - 1))
        else:
            dependency_ratio = 1.0
        
        return dependency_ratio
    
    def _calculate_urgency_factor(self, segment: TaskSegment, alt_file: AltFile) -> float:
        """
        Calculate urgency factor for a task segment
        
        Args:
            segment: Task segment to calculate urgency factor for
            alt_file: Parent ALT file
            
        Returns:
            Urgency factor (0-1 scale)
        """
        # Check if urgency is specified in segment metadata
        if "urgency" in segment.metadata:
            urgency = segment.metadata["urgency"]
            # Convert string values to numeric
            if isinstance(urgency, str):
                urgency_map = {"low": 3, "medium": 5, "high": 8}
                urgency = urgency_map.get(urgency.lower(), self.default_urgency)
        # Check if urgency is specified in ALT file metadata
        elif "urgency_level" in alt_file.metadata:
            urgency = alt_file.metadata["urgency_level"]
        else:
            # Use default urgency
            urgency = self.default_urgency
        
        # Check if deadline is specified
        if "deadline" in segment.metadata:
            deadline_str = segment.metadata["deadline"]
            try:
                deadline = datetime.datetime.fromisoformat(deadline_str)
                now = datetime.datetime.now()
                time_diff = deadline - now
                
                # Calculate urgency based on time remaining
                if time_diff.total_seconds() <= 0:
                    # Past deadline, highest urgency
                    urgency = 10
                else:
                    # Scale urgency based on time remaining (up to 7 days)
                    days_remaining = time_diff.total_seconds() / (24 * 60 * 60)
                    if days_remaining < 7:
                        urgency = max(urgency, 10 - days_remaining)
            except (ValueError, TypeError):
                # Invalid deadline format, ignore
                pass
        elif "deadline" in alt_file.metadata:
            deadline_str = alt_file.metadata["deadline"]
            try:
                deadline = datetime.datetime.fromisoformat(deadline_str)
                now = datetime.datetime.now()
                time_diff = deadline - now
                
                # Calculate urgency based on time remaining
                if time_diff.total_seconds() <= 0:
                    # Past deadline, highest urgency
                    urgency = 10
                else:
                    # Scale urgency based on time remaining (up to 7 days)
                    days_remaining = time_diff.total_seconds() / (24 * 60 * 60)
                    if days_remaining < 7:
                        urgency = max(urgency, 10 - days_remaining)
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
    
    def get_prioritization_stats(self, alt_file: AltFile) -> Dict[str, Any]:
        """
        Get prioritization statistics for an ALT file
        
        Args:
            alt_file: Prioritized ALT file
            
        Returns:
            Prioritization statistics
        """
        try:
            # Check if ALT file has been prioritized
            if not alt_file.metadata.get("prioritized", False):
                raise ValueError("ALT file has not been prioritized")
            
            # Calculate statistics
            stats = {
                "total_segments": len(alt_file.segments),
                "avg_priority_score": 0,
                "max_priority_score": 0,
                "min_priority_score": 1,
                "priority_score_distribution": {},
                "task_type_distribution": {},
                "execution_order": {}
            }
            
            # Calculate priority score statistics
            total_priority_score = 0
            for segment in alt_file.segments:
                priority_score = segment.metadata.get("priority_score", 0)
                total_priority_score += priority_score
                
                # Update max and min priority scores
                stats["max_priority_score"] = max(stats["max_priority_score"], priority_score)
                stats["min_priority_score"] = min(stats["min_priority_score"], priority_score)
                
                # Update priority score distribution
                score_range = f"{int(priority_score * 10)}/10"
                stats["priority_score_distribution"][score_range] = stats["priority_score_distribution"].get(score_range, 0) + 1
                
                # Update task type distribution
                stats["task_type_distribution"][segment.task_type] = stats["task_type_distribution"].get(segment.task_type, 0) + 1
                
                # Update execution order
                execution_order = segment.metadata.get("execution_order", 0)
                stats["execution_order"][segment.id] = execution_order
            
            # Calculate average priority score
            if len(alt_file.segments) > 0:
                stats["avg_priority_score"] = total_priority_score / len(alt_file.segments)
            
            # Add prioritization metadata
            stats["prioritization_timestamp"] = alt_file.metadata.get("prioritization_timestamp", "")
            stats["prioritization_config"] = alt_file.metadata.get("prioritization_config", {})
            
            return stats
        except Exception as e:
            logger.error(f"Error getting prioritization statistics: {str(e)}")
            raise

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
        id="test_alt_file",
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
    
    # Get prioritization statistics
    stats = prioritizer.get_prioritization_stats(prioritized_alt)
    print(f"\nPrioritization statistics:")
    print(f"Total segments: {stats['total_segments']}")
    print(f"Average priority score: {stats['avg_priority_score']:.3f}")
    print(f"Max priority score: {stats['max_priority_score']:.3f}")
    print(f"Min priority score: {stats['min_priority_score']:.3f}")
    print(f"Priority score distribution: {stats['priority_score_distribution']}")
    print(f"Task type distribution: {stats['task_type_distribution']}")
    print(f"Execution order: {stats['execution_order']}")
