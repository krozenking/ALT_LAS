"""
Command Parser Module for ALT_LAS Segmentation Service

This module provides functionality to parse and segment commands into tasks
using NLP techniques and the defined DSL schema.
"""

import re
from typing import Dict, List, Any, Optional, Tuple
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
import logging

from language_processor import get_language_processor
from dsl_schema import AltFile, TaskSegment, TaskParameter

# Configure logging
logger = logging.getLogger('command_parser')

class CommandParser:
    """Class for parsing and segmenting commands"""
    
    def __init__(self):
        """Initialize the command parser"""
        self.language_processor = get_language_processor()
    
    def parse_command(self, command: str, mode: str = "Normal", persona: str = "technical_expert", 
                     metadata: Optional[Dict[str, Any]] = None) -> AltFile:
        """
        Parse a command and generate an ALT file
        
        Args:
            command: Command to parse
            mode: Processing mode (Normal, Dream, Explore, Chaos)
            persona: Persona to use for processing
            metadata: Additional metadata
            
        Returns:
            ALT file object
        """
        # Detect language
        language = self.language_processor.detect_language(command)
        logger.info(f"Detected language: {language}")
        
        # Segment the command into tasks
        segments = self.segment_command(command, language)
        logger.info(f"Segmented command into {len(segments)} tasks")
        
        # Create metadata if not provided
        if metadata is None:
            metadata = {}
        
        # Add chaos_level if mode is Chaos
        chaos_level = None
        if mode == "Chaos":
            chaos_level = metadata.get("chaos_level", 5)  # Default to 5 if not specified
        
        # Create ALT file
        alt_file = AltFile(
            command=command,
            language=language,
            mode=mode,
            persona=persona,
            chaos_level=chaos_level,
            segments=segments,
            metadata=metadata
        )
        
        return alt_file
    
    def segment_command(self, command: str, language: str) -> List[TaskSegment]:
        """
        Segment a command into tasks
        
        Args:
            command: Command to segment
            language: Language of the command
            
        Returns:
            List of task segments
        """
        segments = []
        
        # Get language-specific resources
        task_keywords = self.language_processor.get_task_keywords(language)
        dependency_indicators = self.language_processor.get_dependency_indicators(language)
        conjunction_indicators = self.language_processor.get_conjunction_indicators(language)
        alternative_indicators = self.language_processor.get_alternative_indicators(language)
        
        # Split command into sentences
        sentences = sent_tokenize(command)
        
        # Process each sentence
        for sentence in sentences:
            # Check for multiple tasks in a single sentence
            sub_tasks = self._split_into_subtasks(sentence, language)
            
            for task_text in sub_tasks:
                # Identify task type
                task_type, confidence = self._identify_task_type(task_text, language, task_keywords)
                
                # Extract parameters
                parameters = self._extract_parameters(task_text, task_type, language)
                
                # Create task segment
                task_segment = TaskSegment(
                    task_type=task_type,
                    content=task_text,
                    parameters=parameters,
                    metadata={"confidence": confidence}
                )
                
                segments.append(task_segment)
        
        # Identify dependencies between segments
        self._identify_dependencies(segments, command, language, dependency_indicators)
        
        return segments
    
    def _split_into_subtasks(self, sentence: str, language: str) -> List[str]:
        """
        Split a sentence into subtasks
        
        Args:
            sentence: Sentence to split
            language: Language of the sentence
            
        Returns:
            List of subtask texts
        """
        # Get language-specific indicators
        conjunction_indicators = self.language_processor.get_conjunction_indicators(language)
        alternative_indicators = self.language_processor.get_alternative_indicators(language)
        
        # Combine all indicators
        all_indicators = conjunction_indicators + alternative_indicators
        
        # Create a regex pattern for splitting
        pattern = r'|'.join([r'\b' + re.escape(indicator) + r'\b' for indicator in all_indicators])
        
        # If no indicators are found, return the sentence as a single task
        if not pattern or not re.search(pattern, sentence):
            return [sentence]
        
        # Split the sentence
        parts = re.split(pattern, sentence)
        
        # Clean and filter parts
        subtasks = [part.strip() for part in parts if part.strip()]
        
        # If splitting resulted in empty list, return original sentence
        if not subtasks:
            return [sentence]
        
        return subtasks
    
    def _identify_task_type(self, text: str, language: str, task_keywords: Dict[str, List[str]]) -> Tuple[str, float]:
        """
        Identify the type of task
        
        Args:
            text: Task text
            language: Language of the text
            task_keywords: Dictionary of task keywords by type
            
        Returns:
            Tuple of (task_type, confidence)
        """
        # Tokenize the text
        tokens = self.language_processor.tokenize_by_language(text, language)
        
        # Count matches for each task type
        matches = {}
        for task_type, keywords in task_keywords.items():
            count = 0
            for keyword in keywords:
                # Check for exact matches
                if keyword in tokens:
                    count += 1
                # Check for partial matches (for multi-word keywords)
                elif ' ' in keyword and all(word in tokens for word in keyword.split()):
                    count += 0.5
            
            matches[task_type] = count
        
        # Find the task type with the most matches
        if matches:
            best_match = max(matches.items(), key=lambda x: x[1])
            task_type, count = best_match
            
            # Calculate confidence (normalize by number of keywords)
            max_keywords = max(len(keywords) for keywords in task_keywords.values())
            confidence = min(count / max_keywords, 1.0) if max_keywords > 0 else 0.0
            
            # If confidence is too low, default to "execute"
            if confidence < 0.2:
                return "execute", 0.5
            
            return task_type, confidence
        
        # Default to "execute" if no matches
        return "execute", 0.5
    
    def _extract_parameters(self, text: str, task_type: str, language: str) -> List[TaskParameter]:
        """
        Extract parameters from task text
        
        Args:
            text: Task text
            task_type: Type of task
            language: Language of the text
            
        Returns:
            List of task parameters
        """
        parameters = []
        
        # Different parameter extraction based on task type
        if task_type == "search":
            # Extract query parameter
            query = text
            for keyword in self.language_processor.get_task_keywords(language).get("search", []):
                query = re.sub(r'\b' + re.escape(keyword) + r'\b', '', query, flags=re.IGNORECASE).strip()
            
            parameters.append(TaskParameter(
                name="query",
                value=query,
                type="string",
                required=True,
                description="Search query"
            ))
            
        elif task_type == "create":
            # Extract format parameter if present
            format_match = None
            for format_keyword in self.language_processor.get_context_keywords(language).get("format", []):
                match = re.search(r'\b' + re.escape(format_keyword) + r'\b', text, re.IGNORECASE)
                if match:
                    format_match = format_keyword
                    break
            
            if format_match:
                parameters.append(TaskParameter(
                    name="format",
                    value=format_match,
                    type="string",
                    required=False,
                    description="Output format"
                ))
            
            # Extract title parameter
            title = text
            for keyword in self.language_processor.get_task_keywords(language).get("create", []):
                title = re.sub(r'\b' + re.escape(keyword) + r'\b', '', title, flags=re.IGNORECASE).strip()
            
            # Remove format if found
            if format_match:
                title = re.sub(r'\b' + re.escape(format_match) + r'\b', '', title, flags=re.IGNORECASE).strip()
            
            parameters.append(TaskParameter(
                name="title",
                value=title,
                type="string",
                required=True,
                description="Title or description"
            ))
            
        elif task_type == "analyze":
            # Extract subject parameter
            subject = text
            for keyword in self.language_processor.get_task_keywords(language).get("analyze", []):
                subject = re.sub(r'\b' + re.escape(keyword) + r'\b', '', subject, flags=re.IGNORECASE).strip()
            
            parameters.append(TaskParameter(
                name="subject",
                value=subject,
                type="string",
                required=True,
                description="Subject to analyze"
            ))
            
        elif task_type == "open":
            # Extract target parameter
            target = text
            for keyword in self.language_processor.get_task_keywords(language).get("open", []):
                target = re.sub(r'\b' + re.escape(keyword) + r'\b', '', target, flags=re.IGNORECASE).strip()
            
            parameters.append(TaskParameter(
                name="target",
                value=target,
                type="string",
                required=True,
                description="Target to open"
            ))
            
        else:
            # For other task types, extract a generic content parameter
            content = text
            if task_type in self.language_processor.get_task_keywords(language):
                for keyword in self.language_processor.get_task_keywords(language).get(task_type, []):
                    content = re.sub(r'\b' + re.escape(keyword) + r'\b', '', content, flags=re.IGNORECASE).strip()
            
            parameters.append(TaskParameter(
                name="content",
                value=content,
                type="string",
                required=True,
                description="Task content"
            ))
        
        return parameters
    
    def _identify_dependencies(self, segments: List[TaskSegment], command: str, language: str, 
                              dependency_indicators: List[str]) -> None:
        """
        Identify dependencies between segments
        
        Args:
            segments: List of task segments
            command: Original command
            language: Language of the command
            dependency_indicators: List of dependency indicators
        """
        if len(segments) <= 1:
            return
        
        # Check for sequential dependencies based on order
        for i in range(1, len(segments)):
            # Check if there's a dependency indicator between segments
            prev_segment_end = command.find(segments[i-1].content) + len(segments[i-1].content)
            current_segment_start = command.find(segments[i].content)
            
            if prev_segment_end < current_segment_start:
                between_text = command[prev_segment_end:current_segment_start]
                
                # Check if any dependency indicator is in the between text
                has_dependency = any(indicator in between_text.lower() for indicator in dependency_indicators)
                
                if has_dependency:
                    segments[i].dependencies.append(segments[i-1].id)

# Create a global instance
command_parser = CommandParser()

# Function to get the command parser instance
def get_command_parser() -> CommandParser:
    """
    Get the command parser instance
    
    Returns:
        Command parser instance
    """
    return command_parser

# Main function for testing
if __name__ == "__main__":
    # Test the command parser
    parser = CommandParser()
    
    test_commands = [
        "Search for information about AI and create a report",
        "Ara yapay zeka hakkında bilgi ve bir rapor oluştur",
        "First analyze the data, then create a visualization",
        "Önce veriyi analiz et, sonra bir görselleştirme oluştur"
    ]
    
    for command in test_commands:
        alt_file = parser.parse_command(command)
        print(f"Command: {command}")
        print(f"Language: {alt_file.language}")
        print(f"Number of segments: {len(alt_file.segments)}")
        
        for i, segment in enumerate(alt_file.segments):
            print(f"  Segment {i+1}:")
            print(f"    Type: {segment.task_type}")
            print(f"    Content: {segment.content}")
            print(f"    Parameters: {[p.dict() for p in segment.parameters]}")
            print(f"    Dependencies: {segment.dependencies}")
            print(f"    Confidence: {segment.metadata.get('confidence', 0)}")
        
        print()
