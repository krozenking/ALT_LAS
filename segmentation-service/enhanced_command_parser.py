"""
Enhanced Command Parser Module for ALT_LAS Segmentation Service

This module extends the original command parser with advanced NLP capabilities:
- Named Entity Recognition (NER) for better parameter extraction
- Dependency parsing for improved task segmentation and dependency identification
- Support for enhanced DSL schema features
"""

import re
from typing import Dict, List, Any, Optional, Tuple, Set
import logging
import uuid

from dsl_schema import AltFile, TaskSegment, TaskParameter
from enhanced_dsl_schema import Variable, ConditionalBranch, Condition, ConditionOperator
from enhanced_language_processor import get_enhanced_language_processor

# Configure logging
logger = logging.getLogger('enhanced_command_parser')

class EnhancedCommandParser:
    """Class for parsing and segmenting commands with advanced NLP capabilities."""
    
    def __init__(self):
        """Initialize the enhanced command parser."""
        self.language_processor = get_enhanced_language_processor()
    
    def parse_command(self, command: str, mode: str = "Normal", persona: str = "technical_expert", 
                     metadata: Optional[Dict[str, Any]] = None) -> AltFile:
        """
        Parse a command and generate an ALT file with enhanced features.
        
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
        
        # Process the command with spaCy
        doc = self.language_processor.process_text(command, language)
        if not doc:
            logger.warning(f"Could not process text with spaCy for language '{language}'. Falling back to basic segmentation.")
            # Fallback to basic segmentation if spaCy processing fails
            segments = self._basic_segment_command(command, language)
        else:
            # Segment the command into tasks using advanced NLP
            segments = self._segment_command_with_nlp(doc, language)
            logger.info(f"Segmented command into {len(segments)} tasks using NLP")
        
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
    
    def _basic_segment_command(self, command: str, language: str) -> List[TaskSegment]:
        """
        Basic fallback segmentation method when NLP processing is not available.
        
        Args:
            command: Command to segment
            language: Language of the command
            
        Returns:
            List of task segments
        """
        segments = []
        
        # Get language-specific resources
        task_keywords = self.language_processor.get_task_keywords(language)
        
        # Split command into sentences
        sentences = command.split('. ')
        
        # Process each sentence
        for sentence in sentences:
            if not sentence.strip():
                continue
                
            # Check for multiple tasks in a single sentence
            sub_tasks = self._split_into_subtasks(sentence, language)
            
            for task_text in sub_tasks:
                # Identify task type
                task_type, confidence = self._identify_task_type(task_text, language, task_keywords)
                
                # Extract parameters (basic method)
                parameters = self._basic_extract_parameters(task_text, task_type, language)
                
                # Create task segment
                task_segment = TaskSegment(
                    task_type=task_type,
                    content=task_text,
                    parameters=parameters,
                    metadata={"confidence": confidence}
                )
                
                segments.append(task_segment)
        
        # Identify dependencies between segments (basic method)
        self._basic_identify_dependencies(segments, command, language)
        
        return segments
    
    def _segment_command_with_nlp(self, doc, language: str) -> List[TaskSegment]:
        """
        Segment a command into tasks using advanced NLP techniques.
        
        Args:
            doc: spaCy Doc object
            language: Language of the command
            
        Returns:
            List of task segments
        """
        segments = []
        
        # Get sentences from the document
        sentences = list(self.language_processor.get_sentences(doc))
        
        # Process each sentence
        for sent in sentences:
            # Check for conditional statements
            conditional = self._extract_conditional(sent, language)
            if conditional:
                # Create a conditional segment
                condition_segment = TaskSegment(
                    task_type="conditional",
                    content=sent.text,
                    metadata={"is_conditional": True},
                    condition=conditional
                )
                segments.append(condition_segment)
                continue
            
            # Check for variable assignments
            variables = self._extract_variables(sent, language)
            if variables:
                # Create a variable assignment segment
                var_segment = TaskSegment(
                    task_type="variable_assignment",
                    content=sent.text,
                    metadata={"has_variables": True},
                    variables=variables
                )
                segments.append(var_segment)
                continue
            
            # Find the main verb (predicate) of the sentence
            root_verb = self.language_processor.get_root_verb(sent)
            if not root_verb:
                logger.warning(f"Could not find root verb in sentence: {sent.text}")
                continue
            
            # Identify task type based on the root verb
            task_type, confidence = self._identify_task_type_from_verb(root_verb, language)
            
            # Extract parameters using NER and dependency parsing
            parameters = self._extract_parameters_with_nlp(sent, task_type, language)
            
            # Create task segment
            task_segment = TaskSegment(
                task_type=task_type,
                content=sent.text,
                parameters=parameters,
                metadata={"confidence": confidence}
            )
            
            segments.append(task_segment)
        
        # Identify dependencies between segments using NLP
        self._identify_dependencies_with_nlp(segments, doc, language)
        
        return segments
    
    def _split_into_subtasks(self, sentence: str, language: str) -> List[str]:
        """
        Split a sentence into subtasks based on conjunctions.
        
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
        Identify the type of task using keyword matching (basic method).
        
        Args:
            text: Task text
            language: Language of the text
            task_keywords: Dictionary of task keywords by type
            
        Returns:
            Tuple of (task_type, confidence)
        """
        # Tokenize the text (basic method)
        tokens = text.lower().split()
        
        # Count matches for each task type
        matches = {}
        for task_type, keywords in task_keywords.items():
            count = 0
            for keyword in keywords:
                # Check for exact matches
                if keyword.lower() in tokens:
                    count += 1
                # Check for partial matches (for multi-word keywords)
                elif ' ' in keyword and all(word in tokens for word in keyword.lower().split()):
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
    
    def _identify_task_type_from_verb(self, verb, language: str) -> Tuple[str, float]:
        """
        Identify the type of task based on the root verb using NLP.
        
        Args:
            verb: spaCy Token object representing the root verb
            language: Language of the text
            
        Returns:
            Tuple of (task_type, confidence)
        """
        # Get task keywords
        task_keywords = self.language_processor.get_task_keywords(language)
        
        # Check if the verb lemma matches any task type keywords
        verb_text = verb.lemma_.lower()
        
        for task_type, keywords in task_keywords.items():
            if verb_text in [k.lower() for k in keywords]:
                return task_type, 0.9
            
            # Check for phrasal verbs (verb + particle)
            for child in verb.children:
                if child.dep_ == "prt":  # particle
                    phrasal_verb = f"{verb_text} {child.text.lower()}"
                    if phrasal_verb in [k.lower() for k in keywords]:
                        return task_type, 0.9
        
        # Map common verbs to task types
        verb_to_task_type = {
            'search': 'search',
            'find': 'search',
            'look': 'search',
            'create': 'create',
            'make': 'create',
            'generate': 'create',
            'analyze': 'analyze',
            'examine': 'analyze',
            'study': 'analyze',
            'open': 'open',
            'launch': 'open',
            'transform': 'transform',
            'convert': 'transform',
            'change': 'transform',
            'execute': 'execute',
            'run': 'execute',
            'perform': 'execute',
            'summarize': 'summarize',
            'schedule': 'schedule',
            'plan': 'schedule'
        }
        
        if verb_text in verb_to_task_type:
            return verb_to_task_type[verb_text], 0.8
        
        # Default to "execute" with medium confidence
        return "execute", 0.5
    
    def _basic_extract_parameters(self, text: str, task_type: str, language: str) -> List[TaskParameter]:
        """
        Extract parameters from task text using basic regex (fallback method).
        
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
                t
(Content truncated due to size limit. Use line ranges to read in chunks)