"""
ALT File Handler Module for ALT_LAS Segmentation Service

This module provides functionality for handling ALT files, including saving, loading,
listing, and deleting ALT files. It implements the AltFileHandler class which manages
ALT files in a specified directory.
"""

import os
import json
import yaml
from pathlib import Path
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

from dsl_schema import AltFile
from custom_file_not_found_error import CustomFileNotFoundError

# Singleton instance
_alt_file_handler_instance = None

class AltFileHandler:
    """
    Handler for ALT files
    
    This class provides methods for saving, loading, listing, and deleting ALT files.
    It manages ALT files in a specified directory.
    """
    
    def __init__(self, alt_files_dir: str):
        """
        Initialize the ALT file handler
        
        Args:
            alt_files_dir: Directory to store ALT files
        """
        self.alt_files_dir = alt_files_dir
        
        # Create the directory if it doesn't exist
        os.makedirs(self.alt_files_dir, exist_ok=True)
    
    def save_alt_file(self, alt_file: AltFile, filename: Optional[str] = None, 
                     format: str = "yaml") -> str:
        """
        Save an ALT file to disk
        
        Args:
            alt_file: The ALT file to save
            filename: Name of the file to save (default: task_{alt_file.id}.alt.{format})
            format: Format to save the file in ("yaml" or "json")
            
        Returns:
            Path to the saved file
            
        Raises:
            ValueError: If the format is invalid
        """
        # Validate format
        if format not in ["yaml", "json"]:
            raise ValueError(f"Invalid format: {format}. Must be 'yaml' or 'json'")
        
        # Generate filename if not provided
        if filename is None:
            filename = f"task_{alt_file.id}.alt.{format}"
        
        # Ensure the filename has the correct extension
        if not filename.endswith(f".alt.{format}"):
            filename = f"{filename}.alt.{format}"
        
        # Convert AltFile to dictionary
        alt_dict = alt_file.dict()
        
        # Add timestamp
        alt_dict["saved_at"] = datetime.now().isoformat()
        
        # Create the file path
        file_path = os.path.join(self.alt_files_dir, filename)
        
        # Save the file
        with open(file_path, "w") as f:
            if format == "yaml":
                yaml.dump(alt_dict, f, default_flow_style=False, sort_keys=False)
            else:  # format == "json"
                json.dump(alt_dict, f, indent=2)
        
        return file_path
    
    def load_alt_file(self, filename: str) -> AltFile:
        """
        Load an ALT file from disk
        
        Args:
            filename: Name of the file to load
            
        Returns:
            The loaded ALT file
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            ValueError: If the file format is invalid
        """
        # Create the file path
        file_path = os.path.join(self.alt_files_dir, filename)
        
        # Check if the file exists
        if not os.path.exists(file_path):
            raise CustomFileNotFoundError(f"ALT file not found: {filename}")
        
        # Load the file
        with open(file_path, "r") as f:
            if filename.endswith(".yaml"):
                alt_dict = yaml.safe_load(f)
            elif filename.endswith(".json"):
                alt_dict = json.load(f)
            else:
                raise ValueError(f"Invalid file format: {filename}. Must end with .yaml or .json")
        
        # Convert dictionary to AltFile
        return AltFile(**alt_dict)
    
    def list_alt_files(self) -> List[str]:
        """
        List all ALT files in the directory
        
        Returns:
            List of ALT filenames
        """
        # Get all files in the directory
        files = os.listdir(self.alt_files_dir)
        
        # Filter for ALT files
        alt_files = [f for f in files if f.endswith(".alt.yaml") or f.endswith(".alt.json")]
        
        return alt_files
    
    def delete_alt_file(self, filename: str) -> bool:
        """
        Delete an ALT file
        
        Args:
            filename: Name of the file to delete
            
        Returns:
            True if the file was deleted, False if it doesn't exist
        """
        # Create the file path
        file_path = os.path.join(self.alt_files_dir, filename)
        
        # Check if the file exists
        if not os.path.exists(file_path):
            return False
        
        # Delete the file
        os.remove(file_path)
        
        return True
    
    def get_alt_file_metadata(self, filename: str) -> Dict[str, Any]:
        """
        Get metadata for an ALT file without loading the entire file
        
        Args:
            filename: Name of the file to get metadata for
            
        Returns:
            Dictionary of metadata
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            ValueError: If the file format is invalid
        """
        # Create the file path
        file_path = os.path.join(self.alt_files_dir, filename)
        
        # Check if the file exists
        if not os.path.exists(file_path):
            raise CustomFileNotFoundError(f"ALT file not found: {filename}")
        
        # Load the file
        with open(file_path, "r") as f:
            if filename.endswith(".yaml"):
                alt_dict = yaml.safe_load(f)
            elif filename.endswith(".json"):
                alt_dict = json.load(f)
            else:
                raise ValueError(f"Invalid file format: {filename}. Must end with .yaml or .json")
        
        # Extract metadata
        metadata = {
            "id": alt_dict.get("id"),
            "command": alt_dict.get("command"),
            "language": alt_dict.get("language"),
            "mode": alt_dict.get("mode"),
            "persona": alt_dict.get("persona"),
            "segment_count": len(alt_dict.get("segments", [])),
            "saved_at": alt_dict.get("saved_at"),
            "metadata": alt_dict.get("metadata", {})
        }
        
        return metadata
    
    def search_alt_files(self, query: str) -> List[str]:
        """
        Search for ALT files matching a query
        
        Args:
            query: Search query
            
        Returns:
            List of matching ALT filenames
        """
        # Get all ALT files
        alt_files = self.list_alt_files()
        
        # Filter for files matching the query
        matching_files = []
        
        for filename in alt_files:
            try:
                # Get metadata
                metadata = self.get_alt_file_metadata(filename)
                
                # Check if query matches any metadata
                if (query.lower() in str(metadata).lower() or
                    query.lower() in filename.lower()):
                    matching_files.append(filename)
            except Exception:
                # Skip files that can't be loaded
                continue
        
        return matching_files
    
    def validate_alt_file(self, alt_file: AltFile) -> bool:
        """
        Validate an ALT file
        
        Args:
            alt_file: The ALT file to validate
            
        Returns:
            True if the ALT file is valid, False otherwise
        """
        # Check required fields
        if not alt_file.id or not alt_file.command:
            return False
        
        # Check segments
        if not alt_file.segments or len(alt_file.segments) == 0:
            return False
        
        # Check segment IDs are unique
        segment_ids = [segment.id for segment in alt_file.segments]
        if len(segment_ids) != len(set(segment_ids)):
            return False
        
        # Check dependencies
        for segment in alt_file.segments:
            if segment.dependencies:
                for dep_id in segment.dependencies:
                    if dep_id not in segment_ids:
                        return False
        
        return True

def get_alt_file_handler(alt_files_dir: str = "./alt_files") -> AltFileHandler:
    """
    Get the singleton instance of AltFileHandler
    
    Args:
        alt_files_dir: Directory to store ALT files
        
    Returns:
        AltFileHandler instance
    """
    global _alt_file_handler_instance
    
    if _alt_file_handler_instance is None:
        _alt_file_handler_instance = AltFileHandler(alt_files_dir)
    
    return _alt_file_handler_instance
