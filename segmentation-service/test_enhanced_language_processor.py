"""
Unit tests for the Enhanced Language Processor module.
"""

import unittest
from unittest.mock import patch, MagicMock
import spacy
from spacy.tokens import Doc, Span, Token

# Import the module to be tested
from enhanced_language_processor import EnhancedLanguageProcessor, get_enhanced_language_processor

import nltk # Add this import

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Mock spaCy models if they are not loaded
try:
    nlp_en = spacy.load("en_core_web_sm")
except OSError:
    nlp_en = MagicMock()
    nlp_en.return_value = MagicMock(spec=Doc)

try:
    nlp_tr = spacy.load("tr_core_news_sm")
except OSError:
    nlp_tr = MagicMock()
    nlp_tr.return_value = MagicMock(spec=Doc)

class TestEnhancedLanguageProcessor(unittest.TestCase):
    """Test suite for the EnhancedLanguageProcessor class."""

    @classmethod
    def setUpClass(cls):
        """Set up the test class."""
        cls.processor = EnhancedLanguageProcessor()
        # Override models with mocks if necessary
        if isinstance(nlp_en, MagicMock):
            cls.processor.nlp_models["en"] = nlp_en
        if isinstance(nlp_tr, MagicMock):
            cls.processor.nlp_models["tr"] = nlp_tr

    def test_singleton_instance(self):
        """Test if get_enhanced_language_processor returns the same instance."""
        instance1 = get_enhanced_language_processor()
        instance2 = get_enhanced_language_processor()
        self.assertIs(instance1, instance2)

    def test_detect_language(self):
        """Test language detection."""
        self.assertEqual(self.processor.detect_language("This is an English sentence."), "en")
        self.assertEqual(self.processor.detect_language("Bu bir Türkçe test cümlesidir."), "tr")
        self.assertEqual(self.processor.detect_language("Dies ist ein Testsatz auf Deutsch."), "de")
        self.assertEqual(self.processor.detect_language("C\u0027est une phrase de test en français."), "fr")
        self.assertEqual(self.processor.detect_language("Esta es una frase de prueba en español."), "es")
        self.assertEqual(self.processor.detect_language("Это тестовое предложение на русском языке."), "ru")
        # Test fallback
        self.assertEqual(self.processor.detect_language("Mixed text with some Türkçe words"), "en")
        self.assertEqual(self.processor.detect_language("Biraz English içeren karışık metin"), "tr")

    def test_get_nlp_model(self):
        """Test getting the correct NLP model."""
        self.assertIsNotNone(self.processor.get_nlp_model("en"))
        # Turkish model might be a mock or basic pipeline
        self.assertIsNotNone(self.processor.get_nlp_model("tr"))
        self.assertIsNone(self.processor.get_nlp_model("xx")) # Unsupported language

    @patch("enhanced_language_processor.nlp_en")
    def test_process_text_english(self, mock_nlp_en):
        """Test processing English text."""
        mock_doc = MagicMock(spec=Doc)
        mock_nlp_en.return_value = mock_doc
        self.processor.nlp_models["en"] = mock_nlp_en # Ensure mock is used
        
        text = "Analyze the data and create a report."
        doc = self.processor.process_text(text, "en")
        
        mock_nlp_en.assert_called_once_with(text)
        self.assertEqual(doc, mock_doc)
        # Test caching
        self.processor.process_text(text, "en")
        mock_nlp_en.assert_called_once() # Should not be called again

    @patch("enhanced_language_processor.nlp_tr")
    def test_process_text_turkish(self, mock_nlp_tr):
        """Test processing Turkish text."""
        mock_doc = MagicMock(spec=Doc)
        mock_nlp_tr.return_value = mock_doc
        self.processor.nlp_models["tr"] = mock_nlp_tr # Ensure mock is used
        
        text = "Veriyi analiz et ve bir rapor oluştur."
        doc = self.processor.process_text(text, "tr")
        
        mock_nlp_tr.assert_called_once_with(text)
        self.assertEqual(doc, mock_doc)
        # Test caching
        self.processor.process_text(text, "tr")
        mock_nlp_tr.assert_called_once() # Should not be called again

    def test_process_text_unsupported_language(self):
        """Test processing text with an unsupported language model."""
        text = "Ceci est un texte en français."
        doc = self.processor.process_text(text, "fr") # Assuming French model is not loaded
        self.assertIsNone(doc)

    def test_get_sentences(self):
        """Test sentence segmentation."""
        mock_sent1 = MagicMock(spec=Span, text="Sentence 1.")
        mock_sent2 = MagicMock(spec=Span, text="Sentence 2?")
        mock_doc = MagicMock(spec=Doc)
        mock_doc.sents = [mock_sent1, mock_sent2]
        
        with patch.object(self.processor, "process_text", return_value=mock_doc) as mock_process:
            sentences = self.processor.get_sentences("Sentence 1. Sentence 2?")
            mock_process.assert_called_once()
            self.assertEqual(len(sentences), 2)
            self.assertEqual(sentences[0].text, "Sentence 1.")
            self.assertEqual(sentences[1].text, "Sentence 2?")
            
            # Test with Doc input
            sentences_from_doc = self.processor.get_sentences(mock_doc)
            self.assertEqual(len(sentences_from_doc), 2)

    @patch("enhanced_language_processor.sent_tokenize", return_value=["Sentence 1.", "Sentence 2?"])
    def test_get_sentences_fallback(self, mock_sent_tokenize):
        """Test sentence segmentation fallback using NLTK."""
        with patch.object(self.processor, "process_text", return_value=None) as mock_process:
            sentences = self.processor.get_sentences("Sentence 1. Sentence 2?", language="en")
            mock_process.assert_called_once()
            mock_sent_tokenize.assert_called_once_with("Sentence 1. Sentence 2?", language="en")
            self.assertEqual(len(sentences), 2)
            self.assertEqual(sentences[0], "Sentence 1.")

    def test_get_tokens(self):
        """Test tokenization."""
        mock_token1 = MagicMock(spec=Token, text="Token1")
        mock_token2 = MagicMock(spec=Token, text=".")
        mock_doc = MagicMock(spec=Doc)
        mock_doc.__iter__.return_value = iter([mock_token1, mock_token2])
        
        with patch.object(self.processor, "process_text", return_value=mock_doc) as mock_process:
            tokens = self.processor.get_tokens("Token1.")
            mock_process.assert_called_once()
            self.assertEqual(len(tokens), 2)
            self.assertEqual(tokens[0].text, "Token1")
            self.assertEqual(tokens[1].text, ".")
            
            # Test with Doc input
            tokens_from_doc = self.processor.get_tokens(mock_doc)
            self.assertEqual(len(tokens_from_doc), 2)

    @patch("enhanced_language_processor.word_tokenize", return_value=["Token1", "."])
    def test_get_tokens_fallback(self, mock_word_tokenize):
        """Test tokenization fallback using NLTK."""
        with patch.object(self.processor, "process_text", return_value=None) as mock_process:
            tokens = self.processor.get_tokens("Token1.", language="en")
            mock_process.assert_called_once()
            mock_word_tokenize.assert_called_once_with("Token1.", language="en")
            self.assertEqual(len(tokens), 2)
            self.assertEqual(tokens[0], "Token1")

    def test_get_named_entities(self):
        """Test named entity recognition."""
        mock_ent1 = MagicMock(spec=Span, text="Apple", label_="ORG", start_char=0, end_char=5)
        mock_ent2 = MagicMock(spec=Span, text="yesterday", label_="DATE", start_char=15, end_char=24)
        mock_doc = MagicMock(spec=Doc)
        mock_doc.ents = [mock_ent1, mock_ent2]
        
        with patch.object(self.processor, "process_text", return_value=mock_doc) as mock_process:
            entities = self.processor.get_named_entities("Apple shares rose yesterday.")
            mock_process.assert_called_once()
            self.assertEqual(len(entities), 2)
            self.assertEqual(entities[0], ("Apple", "ORG", 0, 5))
            self.assertEqual(entities[1], ("yesterday", "DATE", 15, 24))
            
            # Test with Doc input
            entities_from_doc = self.processor.get_named_entities(mock_doc)
            self.assertEqual(len(entities_from_doc), 2)

    def test_get_named_entities_fallback(self):
        """Test named entity recognition fallback (returns empty list)."""
        with patch.object(self.processor, "process_text", return_value=None) as mock_process:
            entities = self.processor.get_named_entities("Apple shares rose yesterday.", language="en")
            mock_process.assert_called_once()
            self.assertEqual(entities, [])

    def test_get_dependency_parse(self):
        """Test dependency parsing."""
        mock_token1 = MagicMock(spec=Token, text="Analyze", lemma_="analyze", pos_="VERB", tag_="VB", dep_="ROOT", head=MagicMock(text="Analyze", pos_="VERB"), children=[])
        mock_token2 = MagicMock(spec=Token, text="data", lemma_="data", pos_="NOUN", tag_="NN", dep_="dobj", head=mock_token1, children=[])
        mock_token1.children = [mock_token2]
        mock_doc = MagicMock(spec=Doc)
        mock_doc.__iter__.return_value = iter([mock_token1, mock_token2])
        
        with patch.object(self.processor, "process_text", return_value=mock_doc) as mock_process:
            parse = self.processor.get_dependency_parse("Analyze data")
            mock_process.assert_called_once()
            self.assertEqual(len(parse), 2)
            self.assertEqual(parse[0]["text"], "Analyze")
            self.assertEqual(parse[0]["dep"], "ROOT")
            self.assertEqual(parse[1]["text"], "data")
            self.assertEqual(parse[1]["dep"], "dobj")
            self.assertEqual(parse[1]["head_text"], "Analyze")
            
            # Test with Doc input
            parse_from_doc = self.processor.get_dependency_parse(mock_doc)
            self.assertEqual(len(parse_from_doc), 2)

    def test_get_dependency_parse_fallback(self):
        """Test dependency parsing fallback (returns empty list)."""
        with patch.object(self.processor, "process_text", return_value=None) as mock_process:
            parse = self.processor.get_dependency_parse("Analyze data", language="en")
            mock_process.assert_called_once()
            self.assertEqual(parse, [])

    def test_get_root_verb(self):
        """Test finding the root verb."""
        mock_verb = MagicMock(spec=Token, text="Analyze", dep_="ROOT", pos_="VERB")
        mock_noun = MagicMock(spec=Token, text="data", dep_="dobj", pos_="NOUN")
        mock_doc = MagicMock(spec=Doc)
        mock_doc.__iter__.return_value = iter([mock_verb, mock_noun])
        
        with patch.object(self.processor, "process_text", return_value=mock_doc) as mock_process:
            root_verb = self.processor.get_root_verb("Analyze data")
            mock_process.assert_called_once()
            self.assertEqual(root_verb, mock_verb)
            
            # Test with Doc input
            root_verb_from_doc = self.processor.get_root_verb(mock_doc)
            self.assertEqual(root_verb_from_doc, mock_verb)

    @patch("enhanced_language_processor.word_tokenize", return_value=["Analyze", "data"])
    def test_get_root_verb_fallback(self, mock_word_tokenize):
        """Test finding the root verb using fallback."""
        # Mock task keywords
        self.processor.task_keywords["en"] = {"analyze": ["analyze"]}
        
        with patch.object(self.processor, "process_text", return_value=None) as mock_process:
            root_verb = self.processor.get_root_verb("Analyze data", language="en")
            mock_process.assert_called_once()
            mock_word_tokenize.assert_called_once_with("Analyze data", language="en")
            self.assertEqual(root_verb, "Analyze")

    def test_extract_variables(self):
        """Test variable extraction."""
        text1 = "Process the file {filename} and save to <output_dir>."
        text2 = "No variables here."
        self.assertEqual(self.processor.extract_variables(text1), ["filename", "output_dir"])
        self.assertEqual(self.processor.extract_variables(text2), [])

    def test_identify_references(self):
        """Test reference identification."""
        text_en = "Analyze the report and summarize it. Then send them the results."
        text_tr = "Raporu analiz et ve onu özetle. Sonra onlara sonuçları gönder."
        
        # Mock process_text to return None to test fallback
        with patch.object(self.processor, "process_text", return_value=None):
            refs_en = self.processor.identify_references(text_en, "en")
            refs_tr = self.processor.identify_references(text_tr, "tr")
        
        self.assertIn(("it", "pronoun"), refs_en)
        self.assertIn(("them", "pronoun"), refs_en)
        self.assertIn(("the results", "reference_phrase"), refs_en)
        
        self.assertIn(("onu", "pronoun"), refs_tr)
        self.assertIn(("onlara", "pronoun"), refs_tr)
        self.assertIn(("sonuçları", "reference_phrase"), refs_tr) # Assuming 'sonuç' is in ref list

    @patch("enhanced_language_processor.wordnet.synsets")
    def test_get_related_concepts(self, mock_synsets):
        """Test getting related concepts using WordNet."""
        # Mock WordNet synsets and lemmas
        mock_lemma1 = MagicMock() 
        mock_lemma1.name.return_value = "automobile"
        mock_lemma2 = MagicMock()
        mock_lemma2.name.return_value = "motorcar"
        mock_synset1 = MagicMock()
        mock_synset1.lemmas.return_value = [mock_lemma1, mock_lemma2]
        mock_synset1.hypernyms.return_value = []
        mock_synset1.hyponyms.return_value = []
        mock_synsets.return_value = [mock_synset1]
        
        related = self.processor.get_related_concepts("car", "en")
        mock_synsets.assert_called_once_with("car")
        self.assertIn("automobile", related)
        self.assertIn("motorcar", related)
        self.assertNotIn("car", related)
        
        # Test unsupported language
        related_tr = self.processor.get_related_concepts("araba", "tr")
        self.assertEqual(related_tr, [])

    def test_get_stopwords(self):
        """Test getting stopwords."""
        self.assertIn("the", self.processor.get_stopwords("en"))
        self.assertIn("ve", self.processor.get_stopwords("tr"))
        self.assertEqual(self.processor.get_stopwords("xx"), set()) # Unsupported

    def test_get_task_keywords(self):
        """Test getting task keywords."""
        en_keywords = self.processor.get_task_keywords("en")
        tr_keywords = self.processor.get_task_keywords("tr")
        self.assertIn("search", en_keywords)
        self.assertIn("ara", tr_keywords["search"])
        self.assertEqual(self.processor.get_task_keywords("xx"), en_keywords) # Fallback to English

    def test_get_dependency_indicators(self):
        """Test getting dependency indicators."""
        self.assertIn("after", self.processor.get_dependency_indicators("en"))
        self.assertIn("sonra", self.processor.get_dependency_indicators("tr"))
        self.assertEqual(self.processor.get_dependency_indicators("xx"), self.processor.get_dependency_indicators("en")) # Fallback

    def test_get_conjunction_indicators(self):
        """Test getting conjunction indicators."""
        self.assertIn("and", self.processor.get_conjunction_indicators("en"))
        self.assertIn("ve", self.processor.get_conjunction_indicators("tr"))
        self.assertEqual(self.processor.get_conjunction_indicators("xx"), self.processor.get_conjunction_indicators("en")) # Fallback

    def test_get_alternative_indicators(self):
        """Test getting alternative indicators."""
        self.assertIn("or", self.processor.get_alternative_indicators("en"))
        self.assertIn("veya", self.processor.get_alternative_indicators("tr"))
        self.assertEqual(self.processor.get_alternative_indicators("xx"), self.processor.get_alternative_indicators("en")) # Fallback

    def test_get_relationship_indicators(self):
        """Test getting relationship indicators."""
        en_rels = self.processor.get_relationship_indicators("en")
        tr_rels = self.processor.get_relationship_indicators("tr")
        self.assertIn("sequential", en_rels)
        self.assertIn("sequential", tr_rels)
        self.assertEqual(self.processor.get_relationship_indicators("xx"), en_rels) # Fallback

    def test_get_context_keywords(self):
        """Test getting context keywords."""
        en_ctx = self.processor.get_context_keywords("en")
        tr_ctx = self.processor.get_context_keywords("tr")
        self.assertIn("time", en_ctx)
        self.assertIn("time", tr_ctx)
        self.assertEqual(self.processor.get_context_keywords("xx"), en_ctx) # Fallback

if __name__ == "__main__":
    unittest.main()

