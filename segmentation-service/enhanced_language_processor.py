"""
Enhanced Multilanguage Support Module for ALT_LAS Segmentation Service

This module extends language processing capabilities using spaCy for:
- Named Entity Recognition (NER)
- Dependency Parsing
- Improved tokenization and sentence segmentation
"""

import re
import string
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
import spacy
from spacy.tokens import Doc, Span, Token

# Configure logging
logger = logging.getLogger("enhanced_language_processor")

# Load spaCy models (add more languages as needed)
try:
    nlp_en = spacy.load("en_core_web_sm")
    logger.info("Loaded spaCy model: en_core_web_sm")
except OSError:
    logger.error("Could not load spaCy model 'en_core_web_sm'. Please download it using: python -m spacy download en_core_web_sm")
    nlp_en = None

# Define a basic set of Turkish stopwords if NLTK fails
try:
    from nltk.corpus import stopwords
    turkish_stops = set(stopwords.words("turkish"))
except:
    logger.warning("NLTK Turkish stopwords not found, using a basic list.")
    turkish_stops = {
        "acaba", "ama", "aslında", "az", "bazı", "belki", "biri", "birkaç", "birşey", "biz", "bu", "çok", "çünkü",
        "da", "daha", "de", "defa", "diye", "eğer", "en", "gibi", "hem", "hep", "hepsi", "her", "hiç", "için",
        "ile", "ise", "kez", "ki", "kim", "mı", "mu", "mü", "nasıl", "ne", "neden", "nerde", "nerede", "nereye",
        "niçin", "niye", "o", "sanki", "şey", "siz", "şu", "tüm", "ve", "veya", "ya", "yani"
    }

try:
    english_stops = set(stopwords.words("english"))
except:
    logger.warning("NLTK English stopwords not found, using a basic list.")
    english_stops = {"i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"}


class EnhancedLanguageProcessor:
    """Class for enhanced language detection and multilanguage processing using spaCy."""

    def __init__(self):
        """Initialize the language processor."""
        self.nlp_models = {
            "en": nlp_en,
            # Add other language models here, e.g., "tr": nlp_tr
        }
        self.stopwords = {
            "en": english_stops,
            "tr": turkish_stops
        }
        # Keep keyword lists from the original processor for compatibility/fallback
        self._load_keyword_lists()

    def _load_keyword_lists(self):
        """Loads keyword lists (task, dependency, etc.) for different languages."""
        # Language detection patterns (simple regex for basic detection)
        self.language_patterns = {
            'tr': [
                r'\b(ve|veya|için|ile|bu|şu|şey|çok|daha|en|gibi|kadar)\b',
                r'[şçğüöıİ]',
                r'\b(bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)\b'
            ],
            'en': [
                r'\b(and|or|for|with|this|that|thing|very|more|most|like|than)\b',
                r'\b(one|two|three|four|five|six|seven|eight|nine|ten)\b'
            ]
        }
        # Task type keywords by language
        self.task_keywords = {
            'en': {
                'search': ['search', 'find', 'look', 'query', 'seek', 'browse', 'google', 'research'],
                'create': ['create', 'make', 'generate', 'build', 'produce', 'develop', 'write', 'compose'],
                'analyze': ['analyze', 'examine', 'study', 'investigate', 'review', 'assess', 'evaluate'],
                'open': ['open', 'launch', 'start', 'run', 'execute', 'access', 'view'],
                'transform': ['transform', 'convert', 'change', 'modify', 'alter', 'format', 'translate'],
                'execute': ['execute', 'run', 'perform', 'do', 'carry out', 'implement', 'apply'],
                'summarize': ['summarize', 'summarise', 'brief', 'condense', 'shorten', 'digest', 'outline'],
                'schedule': ['schedule', 'plan', 'arrange', 'book', 'reserve', 'set up', 'organize']
            },
            'tr': {
                'search': ['ara', 'bul', 'araştır', 'sorgula', 'tara', 'gözat', 'google\'da ara', 'incele'],
                'create': ['oluştur', 'yap', 'üret', 'inşa et', 'geliştir', 'yaz', 'hazırla', 'tasarla'],
                'analyze': ['analiz et', 'incele', 'çalış', 'araştır', 'gözden geçir', 'değerlendir', 'ölç'],
                'open': ['aç', 'başlat', 'çalıştır', 'yürüt', 'erişim sağla', 'görüntüle'],
                'transform': ['dönüştür', 'çevir', 'değiştir', 'düzenle', 'biçimlendir', 'tercüme et'],
                'execute': ['yürüt', 'çalıştır', 'gerçekleştir', 'yap', 'uygula', 'icra et'],
                'summarize': ['özetle', 'kısalt', 'özet çıkar', 'ana hatlarıyla belirt', 'özetini çıkar'],
                'schedule': ['planla', 'programla', 'ayarla', 'rezerve et', 'organize et', 'düzenle']
            }
        }
        # Dependency indicators by language
        self.dependency_indicators = {
            'en': [
                'after', 'then', 'next', 'following', 'once', 'when', 'after that',
                'subsequently', 'afterwards', 'later', 'finally', 'lastly'
            ],
            'tr': [
                'sonra', 'daha sonra', 'ardından', 'takiben', 'bitince', 'tamamlanınca', 'bittiğinde',
                'akabinde', 'sonrasında', 'en son', 'son olarak', 'nihayetinde'
            ]
        }
        # Conjunction indicators by language
        self.conjunction_indicators = {
            'en': [
                'and', 'also', 'additionally', 'moreover', 'furthermore', 'plus',
                'as well as', 'along with', 'together with', 'in addition to'
            ],
            'tr': [
                've', 'ayrıca', 'ek olarak', 'dahası', 'üstelik', 'bunun yanında',
                'hem de', 'birlikte', 'beraberinde', 'ilaveten'
            ]
        }
        # Alternative indicators by language
        self.alternative_indicators = {
            'en': [
                'or', 'alternatively', 'either', 'otherwise', 'instead', 'rather than'
            ],
            'tr': [
                'veya', 'ya da', 'alternatif olarak', 'yoksa', 'aksi takdirde', 'yerine'
            ]
        }
        # Context keywords by language
        self.context_keywords = {
            'en': {
                'time': ['today', 'tomorrow', 'yesterday', 'now', 'later', 'soon', 'morning', 'afternoon', 'evening', 'night'],
                'location': ['here', 'there', 'home', 'office', 'work', 'school', 'online', 'locally', 'remotely'],
                'priority': ['urgent', 'important', 'critical', 'high', 'medium', 'low', 'priority'],
                'format': ['pdf', 'doc', 'docx', 'txt', 'csv', 'json', 'yaml', 'xml', 'html', 'markdown', 'md'],
                'audience': ['team', 'manager', 'client', 'customer', 'user', 'public', 'private', 'internal', 'external']
            },
            'tr': {
                'time': ['bugün', 'yarın', 'dün', 'şimdi', 'sonra', 'yakında', 'sabah', 'öğleden sonra', 'akşam', 'gece'],
                'location': ['burada', 'orada', 'ev', 'ofis', 'iş', 'okul', 'çevrimiçi', 'yerel olarak', 'uzaktan'],
                'priority': ['acil', 'önemli', 'kritik', 'yüksek', 'orta', 'düşük', 'öncelik'],
                'format': ['pdf', 'doc', 'docx', 'txt', 'csv', 'json', 'yaml', 'xml', 'html', 'markdown', 'md'],
                'audience': ['takım', 'yönetici', 'müşteri', 'kullanıcı', 'halk', 'özel', 'dahili', 'harici']
            }
        }

    def detect_language(self, text: str) -> str:
        """
        Detect the language of the input text using simple regex patterns.
        Falls back to English if unsure.

        Args:
            text: Input text

        Returns:
            Language code ('en' or 'tr')
        """
        scores = {'tr': 0, 'en': 0}
        for lang, patterns in self.language_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                scores[lang] += len(matches)

        if scores['tr'] > scores['en']:
            return 'tr'
        else:
            return 'en' # Default to English

    def get_nlp_model(self, language: str):
        """Get the spaCy NLP model for the specified language."""
        return self.nlp_models.get(language)

    def process_text(self, text: str, language: str) -> Optional[Doc]:
        """
        Process text using the appropriate spaCy model.

        Args:
            text: Input text.
            language: Language code ('en', 'tr', etc.).

        Returns:
            A spaCy Doc object, or None if the model is not available.
        """
        nlp = self.get_nlp_model(language)
        if nlp:
            return nlp(text)
        logger.warning(f"spaCy model for language '{language}' not available.")
        return None

    def get_sentences(self, doc: Doc) -> List[Span]:
        """Extract sentences from a spaCy Doc."""
        return list(doc.sents)

    def get_tokens(self, doc_or_span: Union[Doc, Span]) -> List[Token]:
        """Extract tokens from a spaCy Doc or Span."""
        return [token for token in doc_or_span]

    def get_named_entities(self, doc: Doc) -> List[Tuple[str, str, int, int]]:
        """
        Extract named entities from a spaCy Doc.

        Args:
            doc: A spaCy Doc object.

        Returns:
            A list of tuples, each containing (entity_text, entity_label, start_char, end_char).
        """
        return [(ent.text, ent.label_, ent.start_char, ent.end_char) for ent in doc.ents]

    def get_dependency_parse(self, doc: Doc) -> List[Dict[str, Any]]:
        """
        Get dependency parsing information for each token in a spaCy Doc.

        Args:
            doc: A spaCy Doc object.

        Returns:
            A list of dictionaries, each containing info about a token's dependency relation.
        """
        return [
            {
                "text": token.text,
                "dep": token.dep_,
                "head_text": token.head.text,
                "head_pos": token.head.pos_,
                "children": [child.text for child in token.children]
            }
            for token in doc
        ]

    def get_root_verb(self, doc_or_span: Union[Doc, Span]) -> Optional[Token]:
        """Find the root verb in a spaCy Doc or Span."""
        for token in doc_or_span:
            if token.dep_ == "ROOT" and token.pos_ == "VERB":
                return token
        # Fallback: find the first verb if no ROOT verb found
        for token in doc_or_span:
            if token.pos_ == "VERB":
                return token
        return None

    # --- Methods for keyword lists (kept for compatibility/fallback) ---

    def get_stopwords(self, language: str) -> set:
        """Get stopwords for the specified language."""
        return self.stopwords.get(language, set())

    def get_task_keywords(self, language: str) -> Dict[str, List[str]]:
        """Get task keywords for the specified language."""
        return self.task_keywords.get(language, self.task_keywords.get('en', {}))

    def get_dependency_indicators(self, language: str) -> List[str]:
        """Get dependency indicators for the specified language."""
        return self.dependency_indicators.get(language, self.dependency_indicators.get('en', []))

    def get_conjunction_indicators(self, language: str) -> List[str]:
        """Get conjunction indicators for the specified language."""
        return self.conjunction_indicators.get(language, self.conjunction_indicators.get('en', []))

    def get_alternative_indicators(self, language: str) -> List[str]:
        """Get alternative indicators for the specified language."""
        return self.alternative_indicators.get(language, self.alternative_indicators.get('en', []))

    def get_context_keywords(self, language: str) -> Dict[str, List[str]]:
        """Get context keywords for the specified language."""
        return self.context_keywords.get(language, self.context_keywords.get('en', {}))

# --- Singleton Instance --- #
enhanced_language_processor_instance = None

def get_enhanced_language_processor() -> 'EnhancedLanguageProcessor':
    """
    Get the singleton instance of the EnhancedLanguageProcessor.

    Returns:
        EnhancedLanguageProcessor instance.
    """
    global enhanced_language_processor_instance
    if enhanced_language_processor_instance is None:
        enhanced_language_processor_instance = EnhancedLanguageProcessor()
    return enhanced_language_processor_instance

# --- Example Usage --- #
if __name__ == "__main__":
    processor = get_enhanced_language_processor()

    test_texts = [
        "Search for climate change research papers from NASA published after 2020 and create a summary document in PDF format.",
        "Analyze the sales data for Q1 2024 from the London office, then schedule a meeting with John Smith for tomorrow afternoon.",
        # Add Turkish examples if a Turkish model is available
        # "2020'den sonra yayınlanan NASA iklim değişikliği araştırma makalelerini ara ve PDF formatında bir özet belgesi oluştur."
    ]

    for text in test_texts:
        lang = processor.detect_language(text)
        print(f"Text: {text}")
        print(f"Detected language: {lang}")

        doc = processor.process_text(text, lang)
        if doc:
            print("\nSentences:")
            for i, sent in enumerate(processor.get_sentences(doc)):
                print(f"  {i+1}: {sent.text}")

            print("\nNamed Entities:")
            entities = processor.get_named_entities(doc)
            if entities:
                for ent_text, ent_label, start, end in entities:
                    print(f"  - '{ent_text}' ({ent_label}) [{start}-{end}]")
            else:
                print("  No entities found.")

            print("\nDependency Parse (Root & Children):")
            dependencies = processor.get_dependency_parse(doc)
            for token_info in dependencies:
                if token_info["dep"] == "ROOT":
                    print(f"  ROOT: {token_info['text']} ({token_info['head_pos']}) -> Children: {token_info['children']}")

            root_verb = processor.get_root_verb(doc)
            if root_verb:
                print(f"\nRoot Verb: {root_verb.text}")
            else:
                print("\nNo root verb found.")

        print("-" * 30)

