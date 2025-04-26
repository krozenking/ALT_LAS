"""
ALT File Format Handler for ALT_LAS Segmentation Service

This module provides functionality to read, write, and manipulate ALT files
on the filesystem.
"""

import os
import json
import yaml
from typing import Dict, List, Any, Optional, Union
import logging
from pathlib import Path

from dsl_schema import AltFile, yaml_to_alt, json_to_alt, alt_to_yaml, alt_to_json

# Configure logging
logger = logging.getLogger('alt_file_handler')

class AltFileHandler:
    """Class for handling ALT files on the filesystem"""
    
    def __init__(self, base_dir: str = None):
        """
        Initialize the ALT file handler
        
        Args:
            base_dir: Base directory for ALT files (defaults to current directory)
        """
        self.base_dir = base_dir or os.getcwd()
        
        # Create directory if it doesn't exist
        os.makedirs(self.base_dir, exist_ok=True)
    
    def save_alt_file(self, alt_file: AltFile, filename: Optional[str] = None, 
                     format: str = "yaml") -> str:
        """
        Save an ALT file to disk
        
        Args:
            alt_file: ALT file object
            filename: Filename to save as (defaults to task_{id}.alt.{format})
            format: Format to save in (yaml or json)
            
        Returns:
            Path to the saved file
        """
        # Generate filename if not provided
        if filename is None:
            filename = f"task_{alt_file.id}.alt.{format.lower()}"
        
        # Ensure filename has correct extension
        if not filename.endswith(f".{format.lower()}"):
            filename = f"{filename}.{format.lower()}"
        
        # Create full path
        file_path = os.path.join(self.base_dir, filename)
        
        # Convert to string representation
        if format.lower() == "yaml":
            content = alt_to_yaml(alt_file)
        elif format.lower() == "json":
            content = alt_to_json(alt_file)
        else:
            raise ValueError("Format must be either 'yaml' or 'json'")
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logger.info(f"Saved ALT file to {file_path}")
        return file_path
    
    def load_alt_file(self, filename: str) -> AltFile:
        """
        Load an ALT file from disk
        
        Args:
            filename: Filename to load
            
        Returns:
            ALT file object
        """
        # Create full path
        file_path = os.path.join(self.base_dir, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"ALT file not found: {file_path}")
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse based on file extension
        if file_path.endswith('.yaml') or file_path.endswith('.yml'):
            alt_file = yaml_to_alt(content)
        elif file_path.endswith('.json'):
            alt_file = json_to_alt(content)
        else:
            # Try to determine format from content
            try:
                alt_file = json_to_alt(content)
            except:
                try:
                    alt_file = yaml_to_alt(content)
                except:
                    raise ValueError("Could not determine file format. Use .yaml or .json extension.")
        
        logger.info(f"Loaded ALT file from {file_path}")
        return alt_file
    
    def list_alt_files(self) -> List[str]:
        """
        List all ALT files in the base directory
        
        Returns:
            List of filenames
        """
        files = []
        for file in os.listdir(self.base_dir):
            if file.endswith('.alt.yaml') or file.endswith('.alt.yml') or file.endswith('.alt.json'):
                files.append(file)
        
        return files
    
    def delete_alt_file(self, filename: str) -> bool:
        """
        Delete an ALT file
        
        Args:
            filename: Filename to delete
            
        Returns:
            True if file was deleted, False otherwise
        """
        # Create full path
        file_path = os.path.join(self.base_dir, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"ALT file not found: {file_path}")
            return False
        
        # Delete file
        os.remove(file_path)
        logger.info(f"Deleted ALT file: {file_path}")
        return True

# Create a global instance with default directory
alt_file_handler = AltFileHandler()

# Function to get the ALT file handler instance
def get_alt_file_handler() -> AltFileHandler:
    """
    Get the ALT file handler instance
    
    Returns:
        ALT file handler instance
    """
    return alt_file_handler

# Main function for testing
if __name__ == "__main__":
    # Test the ALT file handler
    from dsl_schema import AltFile, TaskSegment, TaskParameter
    
    # Create a sample ALT file
    task1 = TaskSegment(
        task_type="search",
        content="Search for information about AI",
        parameters=[
            TaskParameter(name="query", value="information about AI", type="string", required=True)
        ],
        metadata={"confidence": 0.95}
    )
    
    task2 = TaskSegment(
        task_type="create",
        content="Create a report",
        parameters=[
            TaskParameter(name="format", value="pdf", type="string", required=True),
            TaskParameter(name="title", value="AI Report", type="string", required=True)
        ],
        dependencies=[task1.id],
        metadata={"confidence": 0.9}
    )
    
    alt_file = AltFile(
        command="Search for information about AI and create a report",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[task1, task2],
        metadata={"source": "user_input", "priority": "high"}
    )
    
    # Create handler
    handler = AltFileHandler("./test_files")
    
    # Save file
    file_path = handler.save_alt_file(alt_file)
    print(f"Saved ALT file to {file_path}")
    
    # List files
    files = handler.list_alt_files()
    print(f"ALT files: {files}")
    
    # Load file
    loaded_alt = handler.load_alt_file(os.path.basename(file_path))
    print(f"Loaded ALT file: {loaded_alt.id}")
    
    # Delete file
    deleted = handler.delete_alt_file(os.path.basename(file_path))
    print(f"Deleted ALT file: {deleted}")
