"""
Language Resources Manager for Enhanced Multilingual Support

This module provides functionality to manage language resources for the enhanced language processor.
It allows loading, saving, and updating language resources from/to YAML/JSON files.
"""

import os
import json
import yaml
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path

# Setup logging
logger = logging.getLogger(__name__)

class LanguageResourcesManager:
    """
    Manager for language resources
    
    Supports:
    - Loading resources from YAML/JSON files
    - Saving resources to YAML/JSON files
    - Updating resources
    """
    
    def __init__(self, resources_dir: str = None):
        """
        Initialize language resources manager
        
        Args:
            resources_dir: Directory containing language resources (YAML/JSON files)
        """
        # Set resources directory
        self.resources_dir = resources_dir or os.path.join(os.path.dirname(__file__), "language_resources")
        
        # Create resources directory if it doesn't exist
        os.makedirs(self.resources_dir, exist_ok=True)
        
        logger.info(f"Initialized language resources manager with directory: {self.resources_dir}")
    
    def load_resources(self, resource_type: str = None) -> Dict:
        """
        Load language resources from YAML/JSON files
        
        Args:
            resource_type: Type of resource to load (None for all)
            
        Returns:
            Dictionary of loaded resources
        """
        resources = {}
        
        # Check if resources directory exists
        if not os.path.exists(self.resources_dir):
            logger.warning(f"Resources directory {self.resources_dir} does not exist")
            return resources
        
        # Load specific resource type
        if resource_type:
            yaml_path = os.path.join(self.resources_dir, f"{resource_type}.yaml")
            json_path = os.path.join(self.resources_dir, f"{resource_type}.json")
            
            if os.path.exists(yaml_path):
                resources[resource_type] = self._load_yaml_file(yaml_path)
            elif os.path.exists(json_path):
                resources[resource_type] = self._load_json_file(json_path)
            else:
                logger.warning(f"Resource {resource_type} not found")
            
            return resources
        
        # Load all resources
        for filename in os.listdir(self.resources_dir):
            file_path = os.path.join(self.resources_dir, filename)
            
            # Skip directories
            if os.path.isdir(file_path):
                continue
            
            # Extract resource type from filename
            resource_type = filename.split('.')[0].lower()
            
            # Load YAML files
            if filename.endswith('.yaml') or filename.endswith('.yml'):
                resources[resource_type] = self._load_yaml_file(file_path)
            
            # Load JSON files
            elif filename.endswith('.json'):
                resources[resource_type] = self._load_json_file(file_path)
        
        return resources
    
    def _load_yaml_file(self, file_path: str) -> Dict:
        """
        Load YAML file
        
        Args:
            file_path: Path to YAML file
            
        Returns:
            Loaded data
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            logger.info(f"Loaded YAML resource: {file_path}")
            return data
        except Exception as e:
            logger.error(f"Error loading YAML resource {file_path}: {str(e)}")
            return {}
    
    def _load_json_file(self, file_path: str) -> Dict:
        """
        Load JSON file
        
        Args:
            file_path: Path to JSON file
            
        Returns:
            Loaded data
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"Loaded JSON resource: {file_path}")
            return data
        except Exception as e:
            logger.error(f"Error loading JSON resource {file_path}: {str(e)}")
            return {}
    
    def save_resources(self, resources: Dict, format: str = 'yaml') -> bool:
        """
        Save language resources to YAML/JSON files
        
        Args:
            resources: Dictionary of resources to save
            format: Output format ('yaml' or 'json')
            
        Returns:
            True if successful, False otherwise
        """
        success = True
        
        for resource_type, resource_data in resources.items():
            # Set output file path
            if format == 'yaml':
                output_file = os.path.join(self.resources_dir, f"{resource_type}.yaml")
            else:
                output_file = os.path.join(self.resources_dir, f"{resource_type}.json")
            
            try:
                # Write resource to file
                if format == 'yaml':
                    with open(output_file, 'w', encoding='utf-8') as f:
                        yaml.dump(resource_data, f, allow_unicode=True, sort_keys=False)
                else:
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(resource_data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Saved {resource_type} to {output_file}")
            except Exception as e:
                logger.error(f"Error saving {resource_type}: {str(e)}")
                success = False
        
        return success
    
    def update_resource(self, resource_type: str, resource_data: Dict, format: str = 'yaml') -> bool:
        """
        Update a specific language resource
        
        Args:
            resource_type: Type of resource to update
            resource_data: New resource data
            format: Output format ('yaml' or 'json')
            
        Returns:
            True if successful, False otherwise
        """
        # Set output file path
        if format == 'yaml':
            output_file = os.path.join(self.resources_dir, f"{resource_type}.yaml")
        else:
            output_file = os.path.join(self.resources_dir, f"{resource_type}.json")
        
        try:
            # Write resource to file
            if format == 'yaml':
                with open(output_file, 'w', encoding='utf-8') as f:
                    yaml.dump(resource_data, f, allow_unicode=True, sort_keys=False)
            else:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(resource_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Updated {resource_type} in {output_file}")
            return True
        except Exception as e:
            logger.error(f"Error updating {resource_type}: {str(e)}")
            return False
    
    def add_language(self, language_code: str, language_name: str, resources: Dict) -> bool:
        """
        Add a new language to all resources
        
        Args:
            language_code: Language code (e.g., 'fr')
            language_name: Language name (e.g., 'French')
            resources: Dictionary of language resources
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Load existing resources
            existing_resources = self.load_resources()
            
            # Update each resource with new language
            for resource_type, resource_data in existing_resources.items():
                if language_code not in resource_data:
                    resource_data[language_code] = resources.get(resource_type, {}).get(language_code, {})
                    
                    # Update resource file
                    self.update_resource(resource_type, resource_data)
            
            logger.info(f"Added language {language_name} ({language_code}) to all resources")
            return True
        except Exception as e:
            logger.error(f"Error adding language {language_code}: {str(e)}")
            return False
    
    def remove_language(self, language_code: str) -> bool:
        """
        Remove a language from all resources
        
        Args:
            language_code: Language code (e.g., 'fr')
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Load existing resources
            existing_resources = self.load_resources()
            
            # Update each resource to remove language
            for resource_type, resource_data in existing_resources.items():
                if language_code in resource_data:
                    del resource_data[language_code]
                    
                    # Update resource file
                    self.update_resource(resource_type, resource_data)
            
            logger.info(f"Removed language {language_code} from all resources")
            return True
        except Exception as e:
            logger.error(f"Error removing language {language_code}: {str(e)}")
            return False
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """
        Get list of supported languages from resources
        
        Returns:
            List of dictionaries with language code and name
        """
        languages = []
        language_codes = set()
        
        # Load existing resources
        existing_resources = self.load_resources()
        
        # Extract language codes from resources
        for resource_type, resource_data in existing_resources.items():
            for language_code in resource_data.keys():
                language_codes.add(language_code)
        
        # Load language names if available
        language_names = {}
        if 'language_names' in existing_resources:
            language_names = existing_resources['language_names']
        
        # Create language list
        for code in language_codes:
            languages.append({
                "code": code,
                "name": language_names.get(code, code.upper())
            })
        
        return languages

# Main function for testing
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Test the language resources manager
    manager = LanguageResourcesManager()
    
    # Load resources
    resources = manager.load_resources()
    print(f"Loaded {len(resources)} resources")
    
    # Get supported languages
    languages = manager.get_supported_languages()
    print(f"Supported languages: {languages}")
    
    # Test adding a new language
    new_language = {
        "stopwords": {
            "it": ["il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "e", "ed", "o", "ma", "se", "perché", "come", "dove", "quando", "chi", "che", "cosa"]
        },
        "task_keywords": {
            "it": {
                "search": ["cercare", "trovare", "ricercare", "consultare", "esplorare", "indagare", "esaminare", "navigare"],
                "create": ["creare", "fare", "generare", "costruire", "sviluppare", "progettare", "produrre", "comporre", "elaborare"]
            }
        }
    }
    
    success = manager.add_language("it", "Italian", new_language)
    print(f"Added Italian language: {success}")
    
    # Get updated supported languages
    languages = manager.get_supported_languages()
    print(f"Updated supported languages: {languages}")
