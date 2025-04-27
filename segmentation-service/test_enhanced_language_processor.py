#!/usr/bin/env python3
"""
Test suite for enhanced language processor with multilingual support

This module tests the enhanced language processor with support for multiple languages:
- English (en)
- Turkish (tr)
- German (de)
- French (fr)
- Spanish (es)
- Russian (ru)
"""

import os
import json
import unittest
from unittest.mock import patch, MagicMock
import sys
import logging

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules to test
from enhanced_language_processor import EnhancedLanguageProcessor, get_enhanced_language_processor
from language_resources_manager import LanguageResourcesManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestEnhancedLanguageProcessor(unittest.TestCase):
    """Test cases for enhanced language processor"""
    
    def setUp(self):
        """Set up test environment"""
        self.processor = LanguageProcessor()
        self.test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_resources")
        os.makedirs(self.test_dir, exist_ok=True)
    
    def tearDown(self):
        """Clean up test environment"""
        # Clean up test resources directory
        for filename in os.listdir(self.test_dir):
            file_path = os.path.join(self.test_dir, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        
        # Remove test resources directory
        os.rmdir(self.test_dir)
    
    def test_language_detection(self):
        """Test language detection"""
        # Test English
        self.assertEqual(self.processor.detect_language("This is a test sentence in English."), "en")
        
        # Test Turkish
        self.assertEqual(self.processor.detect_language("Bu bir Türkçe test cümlesidir."), "tr")
        
        # Test German
        self.assertEqual(self.processor.detect_language("Dies ist ein Testsatz auf Deutsch."), "de")
        
        # Test French
        self.assertEqual(self.processor.detect_language("C'est une phrase de test en français."), "fr")
        
        # Test Spanish
        self.assertEqual(self.processor.detect_language("Esta es una frase de prueba en español."), "es")
        
        # Test Russian
        self.assertEqual(self.processor.detect_language("Это тестовое предложение на русском языке."), "ru")
        
        # Test mixed language (should detect based on strongest signals)
        self.assertEqual(self.processor.detect_language("This is a mixed sentence with some Türkçe words."), "en")
        
        # Test empty text (should default to English)
        self.assertEqual(self.processor.detect_language(""), "en")
    
    def test_tokenization(self):
        """Test tokenization for different languages"""
        # Test English
        tokens = self.processor.tokenize_by_language("This is a test.", "en")
        self.assertEqual(tokens, ["this", "is", "a", "test"])
        
        # Test Turkish
        tokens = self.processor.tokenize_by_language("Bu bir test.", "tr")
        self.assertEqual(tokens, ["bu", "bir", "test"])
        
        # Test German
        tokens = self.processor.tokenize_by_language("Dies ist ein Test.", "de")
        self.assertEqual(tokens, ["dies", "ist", "ein", "test"])
        
        # Test French
        tokens = self.processor.tokenize_by_language("C'est un test.", "fr")
        self.assertEqual(tokens, ["c", "est", "un", "test"])
        
        # Test Spanish
        tokens = self.processor.tokenize_by_language("Esto es una prueba.", "es")
        self.assertEqual(tokens, ["esto", "es", "una", "prueba"])
        
        # Test Russian
        tokens = self.processor.tokenize_by_language("Это тест.", "ru")
        self.assertEqual(tokens, ["это", "тест"])
        
        # Test unsupported language (should default to English tokenization)
        tokens = self.processor.tokenize_by_language("This is a test.", "xx")
        self.assertEqual(tokens, ["this", "is", "a", "test"])
    
    def test_stopwords_removal(self):
        """Test stopwords removal for different languages"""
        # Test English
        tokens = ["this", "is", "a", "test", "sentence"]
        filtered = self.processor.remove_stopwords(tokens, "en")
        self.assertEqual(filtered, ["test", "sentence"])
        
        # Test Turkish
        tokens = ["bu", "bir", "test", "cümlesi"]
        filtered = self.processor.remove_stopwords(tokens, "tr")
        self.assertEqual(filtered, ["test", "cümlesi"])
        
        # Test German
        tokens = ["dies", "ist", "ein", "test", "satz"]
        filtered = self.processor.remove_stopwords(tokens, "de")
        self.assertEqual(filtered, ["test", "satz"])
        
        # Test French
        tokens = ["c", "est", "un", "test", "phrase"]
        filtered = self.processor.remove_stopwords(tokens, "fr")
        self.assertEqual(filtered, ["test", "phrase"])
        
        # Test Spanish
        tokens = ["esto", "es", "una", "prueba", "frase"]
        filtered = self.processor.remove_stopwords(tokens, "es")
        self.assertEqual(filtered, ["prueba", "frase"])
        
        # Test Russian
        tokens = ["это", "тест", "предложение"]
        filtered = self.processor.remove_stopwords(tokens, "ru")
        self.assertEqual(filtered, ["тест", "предложение"])
        
        # Test unsupported language (should default to English stopwords)
        tokens = ["this", "is", "a", "test", "sentence"]
        filtered = self.processor.remove_stopwords(tokens, "xx")
        self.assertEqual(filtered, ["test", "sentence"])
    
    def test_task_keywords(self):
        """Test task keywords for different languages"""
        # Test English
        keywords = self.processor.get_task_keywords("en")
        self.assertIn("search", keywords)
        self.assertIn("create", keywords)
        self.assertIn("analyze", keywords)
        
        # Test Turkish
        keywords = self.processor.get_task_keywords("tr")
        self.assertIn("search", keywords)
        self.assertIn("create", keywords)
        self.assertIn("analyze", keywords)
        
        # Test German
        keywords = self.processor.get_task_keywords("de")
        self.assertIn("search", keywords)
        self.assertIn("create", keywords)
        self.assertIn("analyze", keywords)
        
        # Test French
        keywords = self.processor.get_task_keywords("fr")
        self.assertIn("search", keywords)
        self.assertIn("create", keywords)
        self.assertIn("analyze", keywords)
        
        # Test Spanish
        keywords = self.processor.get_task_keywords("es")
        self.assertIn("search", keywords)
        self.assertIn("create", keywords)
        self.assertIn("analyze", keywords)
        
        # Test Russian
        keywords = self.processor.get_task_keywords("ru")
        self.assertIn("search", keywords)
        self.assertIn("create", keywords)
        self.assertIn("analyze", keywords)
        
        # Test unsupported language (should default to English)
        keywords = self.processor.get_task_keywords("xx")
        self.assertEqual(keywords, self.processor.task_keywords["en"])
    
    def test_dependency_indicators(self):
        """Test dependency indicators for different languages"""
        # Test English
        indicators = self.processor.get_dependency_indicators("en")
        self.assertIn("after", indicators)
        self.assertIn("before", indicators)
        self.assertIn("then", indicators)
        
        # Test Turkish
        indicators = self.processor.get_dependency_indicators("tr")
        self.assertIn("sonra", indicators)
        self.assertIn("önce", indicators)
        self.assertIn("ardından", indicators)
        
        # Test German
        indicators = self.processor.get_dependency_indicators("de")
        self.assertIn("nach", indicators)
        self.assertIn("vor", indicators)
        self.assertIn("dann", indicators)
        
        # Test French
        indicators = self.processor.get_dependency_indicators("fr")
        self.assertIn("après", indicators)
        self.assertIn("avant", indicators)
        self.assertIn("puis", indicators)
        
        # Test Spanish
        indicators = self.processor.get_dependency_indicators("es")
        self.assertIn("después", indicators)
        self.assertIn("antes", indicators)
        self.assertIn("luego", indicators)
        
        # Test Russian
        indicators = self.processor.get_dependency_indicators("ru")
        self.assertIn("после", indicators)
        self.assertIn("до", indicators)
        self.assertIn("затем", indicators)
        
        # Test unsupported language (should default to English)
        indicators = self.processor.get_dependency_indicators("xx")
        self.assertEqual(indicators, self.processor.dependency_indicators["en"])
    
    def test_relationship_indicators(self):
        """Test relationship indicators for different languages"""
        # Test English
        indicators = self.processor.get_relationship_indicators("en")
        self.assertIn("sequential", indicators)
        self.assertIn("causal", indicators)
        self.assertIn("conditional", indicators)
        
        # Test Turkish
        indicators = self.processor.get_relationship_indicators("tr")
        self.assertIn("sequential", indicators)
        self.assertIn("causal", indicators)
        self.assertIn("conditional", indicators)
        
        # Test German
        indicators = self.processor.get_relationship_indicators("de")
        self.assertIn("sequential", indicators)
        self.assertIn("causal", indicators)
        self.assertIn("conditional", indicators)
        
        # Test French
        indicators = self.processor.get_relationship_indicators("fr")
        self.assertIn("sequential", indicators)
        self.assertIn("causal", indicators)
        self.assertIn("conditional", indicators)
        
        # Test Spanish
        indicators = self.processor.get_relationship_indicators("es")
        self.assertIn("sequential", indicators)
        self.assertIn("causal", indicators)
        self.assertIn("conditional", indicators)
        
        # Test Russian
        indicators = self.processor.get_relationship_indicators("ru")
        self.assertIn("sequential", indicators)
        self.assertIn("causal", indicators)
        self.assertIn("conditional", indicators)
        
        # Test unsupported language (should default to English)
        indicators = self.processor.get_relationship_indicators("xx")
        self.assertEqual(indicators, self.processor.relationship_indicators["en"])
    
    def test_text_analysis(self):
        """Test text analysis for different languages"""
        # Test English
        text = "First search for information, then create a report."
        analysis = self.processor.analyze_text(text, "en")
        self.assertEqual(analysis["language"]["code"], "en")
        self.assertIn("search", analysis["task_keywords"]["search"])
        self.assertIn("create", analysis["task_keywords"]["create"])
        self.assertIn("first", analysis["relationship_indicators"]["sequential"])
        self.assertIn("then", analysis["relationship_indicators"]["sequential"])
        
        # Test Turkish
        text = "Önce bilgi ara, sonra bir rapor oluştur."
        analysis = self.processor.analyze_text(text, "tr")
        self.assertEqual(analysis["language"]["code"], "tr")
        self.assertIn("ara", analysis["task_keywords"]["search"])
        self.assertIn("oluştur", analysis["task_keywords"]["create"])
        self.assertIn("önce", analysis["relationship_indicators"]["sequential"])
        self.assertIn("sonra", analysis["relationship_indicators"]["sequential"])
        
        # Test German
        text = "Zuerst nach Informationen suchen, dann einen Bericht erstellen."
        analysis = self.processor.analyze_text(text, "de")
        self.assertEqual(analysis["language"]["code"], "de")
        self.assertIn("suchen", analysis["task_keywords"]["search"])
        self.assertIn("erstellen", analysis["task_keywords"]["create"])
        self.assertIn("zuerst", analysis["relationship_indicators"]["sequential"])
        self.assertIn("dann", analysis["relationship_indicators"]["sequential"])
        
        # Test French
        text = "D'abord rechercher des informations, puis créer un rapport."
        analysis = self.processor.analyze_text(text, "fr")
        self.assertEqual(analysis["language"]["code"], "fr")
        self.assertIn("rechercher", analysis["task_keywords"]["search"])
        self.assertIn("créer", analysis["task_keywords"]["create"])
        self.assertIn("d'abord", analysis["relationship_indicators"]["sequential"])
        self.assertIn("puis", analysis["relationship_indicators"]["sequential"])
        
        # Test Spanish
        text = "Primero buscar información, luego crear un informe."
        analysis = self.processor.analyze_text(text, "es")
        self.assertEqual(analysis["language"]["code"], "es")
        self.assertIn("buscar", analysis["task_keywords"]["search"])
        self.assertIn("crear", analysis["task_keywords"]["create"])
        self.assertIn("primero", analysis["relationship_indicators"]["sequential"])
        self.assertIn("luego", analysis["relationship_indicators"]["sequential"])
        
        # Test Russian
        text = "Сначала найти информацию, затем создать отчет."
        analysis = self.processor.analyze_text(text, "ru")
        self.assertEqual(analysis["language"]["code"], "ru")
        self.assertIn("найти", analysis["task_keywords"]["search"])
        self.assertIn("создать", analysis["task_keywords"]["create"])
        self.assertIn("сначала", analysis["relationship_indicators"]["sequential"])
        self.assertIn("затем", analysis["relationship_indicators"]["sequential"])
        
        # Test auto language detection
        text = "First search for information, then create a report."
        analysis = self.processor.analyze_text(text)
        self.assertEqual(analysis["language"]["code"], "en")
    
    def test_export_resources(self):
        """Test exporting language resources"""
        # Export resources to test directory
        self.processor.export_resources(self.test_dir, 'yaml')
        
        # Check if files were created
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "stopwords.yaml")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "task_keywords.yaml")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "dependency_indicators.yaml")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "relationship_indicators.yaml")))
        
        # Export resources to test directory in JSON format
        self.processor.export_resources(self.test_dir, 'json')
        
        # Check if files were created
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "stopwords.json")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "task_keywords.json")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "dependency_indicators.json")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "relationship_indicators.json")))
    
    def test_get_language_processor(self):
        """Test getting language processor instance"""
        processor = get_language_processor()
        self.assertIsInstance(processor, LanguageProcessor)
        
        # Should return the same instance
        processor2 = get_language_processor()
        self.assertIs(processor, processor2)
    
    def test_supported_languages(self):
        """Test getting supported languages"""
        languages = self.processor.get_supported_languages()
        self.assertEqual(len(languages), 6)  # en, tr, de, fr, es, ru
        
        # Check if all languages are included
        language_codes = [lang["code"] for lang in languages]
        self.assertIn("en", language_codes)
        self.assertIn("tr", language_codes)
        self.assertIn("de", language_codes)
        self.assertIn("fr", language_codes)
        self.assertIn("es", language_codes)
        self.assertIn("ru", language_codes)
        
        # Check language names
        for lang in languages:
            if lang["code"] == "en":
                self.assertEqual(lang["name"], "English")
            elif lang["code"] == "tr":
                self.assertEqual(lang["name"], "Turkish")
            elif lang["code"] == "de":
                self.assertEqual(lang["name"], "German")
            elif lang["code"] == "fr":
                self.assertEqual(lang["name"], "French")
            elif lang["code"] == "es":
                self.assertEqual(lang["name"], "Spanish")
            elif lang["code"] == "ru":
                self.assertEqual(lang["name"], "Russian")

class TestLanguageResourcesManager(unittest.TestCase):
    """Test cases for language resources manager"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_resources")
        os.makedirs(self.test_dir, exist_ok=True)
        self.manager = LanguageResourcesManager(self.test_dir)
        
        # Create test resources
        self.test_resources = {
            "stopwords": {
                "en": ["a", "an", "the"],
                "tr": ["bir", "ve", "bu"]
            },
            "task_keywords": {
                "en": {
                    "search": ["search", "find", "look"],
                    "create": ["create", "make", "build"]
                },
                "tr": {
                    "search": ["ara", "bul", "araştır"],
                    "create": ["oluştur", "yap", "inşa et"]
                }
            }
        }
        
        # Save test resources
        self.manager.save_resources(self.test_resources, 'yaml')
    
    def tearDown(self):
        """Clean up test environment"""
        # Clean up test resources directory
        for filename in os.listdir(self.test_dir):
            file_path = os.path.join(self.test_dir, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        
        # Remove test resources directory
        os.rmdir(self.test_dir)
    
    def test_load_resources(self):
        """Test loading language resources"""
        # Load all resources
        resources = self.manager.load_resources()
        self.assertEqual(len(resources), 2)  # stopwords, task_keywords
        self.assertIn("stopwords", resources)
        self.assertIn("task_keywords", resources)
        
        # Load specific resource
        stopwords = self.manager.load_resources("stopwords")
        self.assertEqual(len(stopwords), 1)
        self.assertIn("stopwords", stopwords)
        self.assertEqual(stopwords["stopwords"]["en"], ["a", "an", "the"])
        self.assertEqual(stopwords["stopwords"]["tr"], ["bir", "ve", "bu"])
    
    def test_save_resources(self):
        """Test saving language resources"""
        # Save resources in YAML format
        success = self.manager.save_resources(self.test_resources, 'yaml')
        self.assertTrue(success)
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "stopwords.yaml")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "task_keywords.yaml")))
        
        # Save resources in JSON format
        success = self.manager.save_resources(self.test_resources, 'json')
        self.assertTrue(success)
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "stopwords.json")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "task_keywords.json")))
    
    def test_update_resource(self):
        """Test updating a specific language resource"""
        # Update stopwords
        new_stopwords = {
            "en": ["a", "an", "the", "and", "or"],
            "tr": ["bir", "ve", "bu", "veya", "ile"]
        }
        
        success = self.manager.update_resource("stopwords", new_stopwords, 'yaml')
        self.assertTrue(success)
        
        # Load updated resource
        resources = self.manager.load_resources("stopwords")
        self.assertEqual(resources["stopwords"]["en"], ["a", "an", "the", "and", "or"])
        self.assertEqual(resources["stopwords"]["tr"], ["bir", "ve", "bu", "veya", "ile"])
    
    def test_add_language(self):
        """Test adding a new language to all resources"""
        # Add German language
        new_language = {
            "stopwords": {
                "de": ["der", "die", "das", "und", "oder"]
            },
            "task_keywords": {
                "de": {
                    "search": ["suchen", "finden", "recherchieren"],
                    "create": ["erstellen", "machen", "bauen"]
                }
            }
        }
        
        success = self.manager.add_language("de", "German", new_language)
        self.assertTrue(success)
        
        # Load updated resources
        resources = self.manager.load_resources()
        self.assertIn("de", resources["stopwords"])
        self.assertIn("de", resources["task_keywords"])
        self.assertEqual(resources["stopwords"]["de"], ["der", "die", "das", "und", "oder"])
        self.assertEqual(resources["task_keywords"]["de"]["search"], ["suchen", "finden", "recherchieren"])
        self.assertEqual(resources["task_keywords"]["de"]["create"], ["erstellen", "machen", "bauen"])
    
    def test_remove_language(self):
        """Test removing a language from all resources"""
        # Remove Turkish language
        success = self.manager.remove_language("tr")
        self.assertTrue(success)
        
        # Load updated resources
        resources = self.manager.load_resources()
        self.assertNotIn("tr", resources["stopwords"])
        self.assertNotIn("tr", resources["task_keywords"])
    
    def test_get_supported_languages(self):
        """Test getting supported languages"""
        # Add language names resource
        language_names = {
            "en": "English",
            "tr": "Turkish"
        }
        
        self.manager.update_resource("language_names", language_names, 'yaml')
        
        # Get supported languages
        languages = self.manager.get_supported_languages()
        self.assertEqual(len(languages), 2)  # en, tr
        
        # Check if all languages are included
        language_codes = [lang["code"] for lang in languages]
        self.assertIn("en", language_codes)
        self.assertIn("tr", language_codes)
        
        # Check language names
        for lang in languages:
            if lang["code"] == "en":
                self.assertEqual(lang["name"], "English")
            elif lang["code"] == "tr":
                self.assertEqual(lang["name"], "Turkish")

if __name__ == "__main__":
    unittest.main()
