"""
Persona Handler Module for ALT_LAS Segmentation Service

This module provides functionality to handle different personas
(technical_expert, creative_writer, researcher, project_manager) for the Segmentation Service.
"""

import random
import re
import logging
from typing import Dict, List, Any, Optional, Tuple, Set

from dsl_schema import TaskSegment, TaskParameter

# Configure logging
logger = logging.getLogger('persona_handler')

class PersonaHandler:
    """Class for handling different personas"""
    
    def __init__(self):
        """Initialize the persona handler"""
        # Technical expert parameters
        self.technical_parameters = [
            ("precision", ["high", "medium", "low"]),
            ("format", ["json", "yaml", "xml", "csv"]),
            ("detail_level", ["detailed", "summary", "comprehensive"]),
            ("technical_complexity", ["basic", "intermediate", "advanced", "expert"])
        ]
        
        # Creative writer parameters
        self.creative_parameters = [
            ("style", ["narrative", "descriptive", "expository", "persuasive", "poetic"]),
            ("tone", ["formal", "casual", "humorous", "serious", "inspirational"]),
            ("audience", ["general", "technical", "academic", "children", "professionals"]),
            ("narrative_perspective", ["first-person", "third-person", "omniscient"])
        ]
        
        # Researcher parameters
        self.researcher_parameters = [
            ("sources", ["academic", "industry", "news", "primary", "secondary"]),
            ("methodology", ["qualitative", "quantitative", "mixed-methods", "case-study"]),
            ("scope", ["narrow", "broad", "focused", "comprehensive"]),
            ("citation_style", ["APA", "MLA", "Chicago", "Harvard", "IEEE"])
        ]
        
        # Project manager parameters
        self.project_manager_parameters = [
            ("priority", ["high", "medium", "low", "critical", "optional"]),
            ("deadline", ["immediate", "short-term", "medium-term", "long-term"]),
            ("resources", ["minimal", "standard", "extensive"]),
            ("stakeholders", ["internal", "external", "management", "clients", "team"])
        ]
        
        # Persona-specific task types
        self.persona_task_types = {
            "technical_expert": ["analyze", "evaluate", "implement", "debug", "optimize", "test"],
            "creative_writer": ["write", "compose", "describe", "narrate", "illustrate", "express"],
            "researcher": ["research", "investigate", "study", "examine", "survey", "review"],
            "project_manager": ["plan", "organize", "coordinate", "schedule", "monitor", "delegate"]
        }
    
    def apply_persona_effects(self, segments: List[TaskSegment], persona: str, language: str = "en") -> List[TaskSegment]:
        """
        Apply persona-specific effects to task segments
        
        Args:
            segments: List of task segments
            persona: Persona to use (technical_expert, creative_writer, researcher, project_manager)
            language: Language of the segments
            
        Returns:
            Modified list of task segments
        """
        if persona == "technical_expert":
            return self._apply_technical_expert_effects(segments, language)
        
        elif persona == "creative_writer":
            return self._apply_creative_writer_effects(segments, language)
        
        elif persona == "researcher":
            return self._apply_researcher_effects(segments, language)
        
        elif persona == "project_manager":
            return self._apply_project_manager_effects(segments, language)
        
        else:
            logger.warning(f"Unknown persona: {persona}, using technical_expert persona")
            return self._apply_technical_expert_effects(segments, language)
    
    def _apply_technical_expert_effects(self, segments: List[TaskSegment], language: str) -> List[TaskSegment]:
        """
        Apply technical expert persona effects to task segments
        
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
            
            # Add persona to metadata
            modified_segment.metadata["applied_persona"] = "technical_expert"
            
            # 20% chance to use a more technical task type if appropriate
            if random.random() < 0.2 and segment.task_type not in self.persona_task_types["technical_expert"]:
                # Only change if the current task type isn't already technical
                original_task_type = modified_segment.task_type
                technical_task_types = self.persona_task_types["technical_expert"]
                
                # Map common task types to technical equivalents
                task_type_mapping = {
                    "search": "analyze",
                    "create": "implement",
                    "summarize": "evaluate",
                    "execute": "test"
                }
                
                # Use mapping if available, otherwise choose random technical task type
                if segment.task_type in task_type_mapping:
                    modified_segment.task_type = task_type_mapping[segment.task_type]
                else:
                    modified_segment.task_type = random.choice(technical_task_types)
                
                modified_segment.metadata["original_task_type"] = original_task_type
            
            # 40% chance to add a technical parameter
            if random.random() < 0.4:
                param_name, param_values = random.choice(self.technical_parameters)
                param_value = random.choice(param_values)
                
                # Check if parameter already exists
                if not any(param.name == param_name for param in modified_segment.parameters):
                    modified_segment.parameters.append(TaskParameter(
                        name=param_name,
                        value=param_value,
                        type="string",
                        required=False,
                        description=f"Technical parameter added by technical_expert persona"
                    ))
            
            # Enhance existing parameters with more technical details
            for param in modified_segment.parameters:
                if param.name == "query" and isinstance(param.value, str):
                    # Add technical specificity to search queries
                    if "technical_specificity" not in modified_segment.metadata:
                        modified_segment.metadata["technical_specificity"] = {}
                    
                    # Store original value
                    modified_segment.metadata["technical_specificity"]["original_query"] = param.value
                    
                    # Add technical terms if not already present
                    technical_terms = ["implementation", "architecture", "framework", "methodology", "specification"]
                    
                    # Only add if the query doesn't already have technical terms
                    if not any(term in param.value.lower() for term in technical_terms):
                        selected_term = random.choice(technical_terms)
                        param.value = f"{param.value} {selected_term}"
            
            modified_segments.append(modified_segment)
        
        return modified_segments
    
    def _apply_creative_writer_effects(self, segments: List[TaskSegment], language: str) -> List[TaskSegment]:
        """
        Apply creative writer persona effects to task segments
        
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
            
            # Add persona to metadata
            modified_segment.metadata["applied_persona"] = "creative_writer"
            
            # 30% chance to use a more creative task type
            if random.random() < 0.3 and segment.task_type not in self.persona_task_types["creative_writer"]:
                original_task_type = modified_segment.task_type
                creative_task_types = self.persona_task_types["creative_writer"]
                
                # Map common task types to creative equivalents
                task_type_mapping = {
                    "search": "explore",
                    "create": "compose",
                    "analyze": "describe",
                    "summarize": "narrate"
                }
                
                # Use mapping if available, otherwise choose random creative task type
                if segment.task_type in task_type_mapping:
                    modified_segment.task_type = task_type_mapping[segment.task_type]
                else:
                    modified_segment.task_type = random.choice(creative_task_types)
                
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
                        description=f"Creative parameter added by creative_writer persona"
                    ))
            
            # Enhance content with more descriptive language
            if "content" in [p.name for p in modified_segment.parameters]:
                content_param = next(p for p in modified_segment.parameters if p.name == "content")
                if isinstance(content_param.value, str):
                    # Store original value
                    if "creative_enhancements" not in modified_segment.metadata:
                        modified_segment.metadata["creative_enhancements"] = {}
                    
                    modified_segment.metadata["creative_enhancements"]["original_content"] = content_param.value
                    
                    # Add descriptive adjectives
                    descriptive_adjectives = ["vivid", "compelling", "engaging", "immersive", "evocative"]
                    content_param.value = f"{random.choice(descriptive_adjectives)} {content_param.value}"
            
            modified_segments.append(modified_segment)
        
        return modified_segments
    
    def _apply_researcher_effects(self, segments: List[TaskSegment], language: str) -> List[TaskSegment]:
        """
        Apply researcher persona effects to task segments
        
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
            
            # Add persona to metadata
            modified_segment.metadata["applied_persona"] = "researcher"
            
            # 25% chance to use a more research-oriented task type
            if random.random() < 0.25 and segment.task_type not in self.persona_task_types["researcher"]:
                original_task_type = modified_segment.task_type
                research_task_types = self.persona_task_types["researcher"]
                
                # Map common task types to research equivalents
                task_type_mapping = {
                    "search": "research",
                    "create": "study",
                    "analyze": "investigate",
                    "summarize": "review"
                }
                
                # Use mapping if available, otherwise choose random research task type
                if segment.task_type in task_type_mapping:
                    modified_segment.task_type = task_type_mapping[segment.task_type]
                else:
                    modified_segment.task_type = random.choice(research_task_types)
                
                modified_segment.metadata["original_task_type"] = original_task_type
            
            # 45% chance to add a research parameter
            if random.random() < 0.45:
                param_name, param_values = random.choice(self.researcher_parameters)
                param_value = random.choice(param_values)
                
                # Check if parameter already exists
                if not any(param.name == param_name for param in modified_segment.parameters):
                    modified_segment.parameters.append(TaskParameter(
                        name=param_name,
                        value=param_value,
                        type="string",
                        required=False,
                        description=f"Research parameter added by researcher persona"
                    ))
            
            # Add sources parameter for search tasks
            if modified_segment.task_type in ["search", "research", "investigate"] and not any(p.name == "sources" for p in modified_segment.parameters):
                # Define possible sources
                sources = ["academic_journals", "books", "conference_papers", "reports", "articles"]
                
                # Add sources parameter
                modified_segment.parameters.append(TaskParameter(
                    name="sources",
                    value=random.sample(sources, min(3, len(sources))),
                    type="array",
                    required=False,
                    description="Sources to consider for research"
                ))
            
            modified_segments.append(modified_segment)
        
        return modified_segments
    
    def _apply_project_manager_effects(self, segments: List[TaskSegment], language: str) -> List[TaskSegment]:
        """
        Apply project manager persona effects to task segments
        
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
            
            # Add persona to metadata
            modified_segment.metadata["applied_persona"] = "project_manager"
            
            # 20% chance to use a more project management-oriented task type
            if random.random() < 0.2 and segment.task_type not in self.persona_task_types["project_manager"]:
                original_task_type = modified_segment.task_type
                pm_task_types = self.persona_task_types["project_manager"]
                
                # Map common task types to project management equivalents
                task_type_mapping = {
                    "search": "plan",
                    "create": "organize",
                    "analyze": "monitor",
                    "execute": "coordinate"
                }
                
                # Use mapping if available, otherwise choose random PM task type
                if segment.task_type in task_type_mapping:
                    modified_segment.task_type = task_type_mapping[segment.task_type]
                else:
                    modified_segment.task_type = random.choice(pm_task_types)
                
                modified_segment.metadata["original_task_type"] = original_task_type
            
            # 60% chance to add a project management parameter
            if random.random() < 0.6:
                param_name, param_values = random.choice(self.project_manager_parameters)
                param_value = random.choice(param_values)
                
                # Check if parameter already exists
                if not any(param.name == param_name for param in modified_segment.parameters):
                    modified_segment.parameters.append(TaskParameter(
                        name=param_name,
                        value=param_value,
                        type="string",
                        required=False,
                        description=f"Project management parameter added by project_manager persona"
                    ))
            
            # Add deadline parameter if not present
            if not any(p.name == "deadline" for p in modified_segment.parameters):
                # Generate a random deadline
                deadlines = ["today", "tomorrow", "next week", "next month", "end of quarter"]
                
                modified_segment.parameters.append(TaskParameter(
                    name="deadline",
                    value=random.choice(deadlines),
                    type="string",
                    required=False,
                    description="Task deadline"
                ))
            
            modified_segments.append(modified_segment)
        
        return modified_segments

# Create a global instance
persona_handler = PersonaHandler()

# Function to get the persona handler instance
def get_persona_handler() -> PersonaHandler:
    """
    Get the persona handler instance
    
    Returns:
        Persona handler instance
    """
    return persona_handler
