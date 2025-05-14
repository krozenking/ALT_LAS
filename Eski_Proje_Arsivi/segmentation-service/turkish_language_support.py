"""
Turkish language support module for ALT_LAS Segmentation Service

This module provides enhanced Turkish language processing capabilities
when a full spaCy model is not available.
"""

import re
import string
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
import nltk
from nltk.tokenize import word_tokenize

# Configure logging
logger = logging.getLogger("turkish_language_support")

# Ensure NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Turkish-specific character mappings for case conversion
tr_lower_map = {
    'İ': 'i', 'I': 'ı', 'Ğ': 'ğ', 'Ü': 'ü', 'Ö': 'ö', 'Ş': 'ş', 'Ç': 'ç'
}

tr_upper_map = {
    'i': 'İ', 'ı': 'I', 'ğ': 'Ğ', 'ü': 'Ü', 'ö': 'Ö', 'ş': 'Ş', 'ç': 'Ç'
}

# Extended Turkish stopwords
turkish_stopwords = {
    "acaba", "ama", "aslında", "az", "bazı", "belki", "biri", "birkaç", "birşey", "biz", "bu", "çok", "çünkü",
    "da", "daha", "de", "defa", "diye", "eğer", "en", "gibi", "hem", "hep", "hepsi", "her", "hiç", "için",
    "ile", "ise", "kez", "ki", "kim", "mı", "mu", "mü", "nasıl", "ne", "neden", "nerde", "nerede", "nereye",
    "niçin", "niye", "o", "sanki", "şey", "siz", "şu", "tüm", "ve", "veya", "ya", "yani", "bir", "olarak",
    "tarafından", "üzere", "dolayı", "itibaren", "göre", "kadar", "rağmen", "sonra", "önce", "beri", "ait",
    "dolayısıyla", "başka", "bazıları", "bana", "beni", "bende", "benimle", "benden", "bize", "bizi", "bizde",
    "bizimle", "bizden", "ona", "onu", "onda", "onunla", "ondan", "onlara", "onları", "onlarda", "onlarla",
    "onlardan", "bunlar", "şunlar", "böyle", "şöyle", "öyle", "öbür", "diğer", "tabi", "tamam", "sadece", "yalnız",
    "ancak", "fakat", "lakin", "oysa", "oysaki", "halbuki", "mademki", "demek", "yani", "üstelik", "hatta", "dahası",
    "ayrıca", "kısacası", "özetle", "örneğin", "mesela", "şimdi", "biraz", "az", "çok", "daha", "en", "pek", "gayet",
    "oldukça", "epey", "hayli", "bayağı", "son", "ilk", "ikinci", "üçüncü", "dördüncü", "beşinci", "altıncı", "yedinci",
    "sekizinci", "dokuzuncu", "onuncu", "sonuncu", "önceki", "şimdiki", "gelecek", "geçmiş", "yakın", "uzak", "iç", "dış",
    "alt", "üst", "yan", "karşı", "orta", "ön", "arka", "sağ", "sol", "doğu", "batı", "kuzey", "güney", "yukarı", "aşağı",
    "içeri", "dışarı", "ileri", "geri", "beri", "öte", "aşırı", "fazla", "eksik", "yarım", "tam", "hiçbir", "herhangi",
    "tüm", "bütün", "hep", "daima", "sürekli", "sık", "bazen", "ara", "sıra", "nadiren", "artık", "henüz", "daha", "hala",
    "halen", "şimdilik", "şimdi", "demin", "az", "önce", "birazdan", "yakında", "bugün", "dün", "yarın", "evvel", "gün",
    "hafta", "ay", "yıl", "asır", "sabah", "öğle", "akşam", "gece", "gündüz", "pazartesi", "salı", "çarşamba", "perşembe",
    "cuma", "cumartesi", "pazar", "ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül",
    "ekim", "kasım", "aralık"
}

# Extended Turkish verb suffixes for stemming
turkish_verb_suffixes = [
    "mek", "mak", "miş", "muş", "mış", "müş", "ti", "di", "tu", "du", "tı", "dı", "tü", "dü",
    "yor", "acak", "ecek", "ar", "er", "ır", "ir", "ur", "ür", "iyor", "ıyor", "uyor", "üyor",
    "miştir", "muştur", "mıştır", "müştür", "mişti", "muştu", "mıştı", "müştü",
    "meli", "malı", "meliydi", "malıydı", "ecekti", "acaktı", "irdi", "ırdı", "urdu", "ürdü"
]

# Extended Turkish noun suffixes for stemming
turkish_noun_suffixes = [
    "ler", "lar", "in", "ın", "un", "ün", "a", "e", "i", "ı", "u", "ü", "da", "de", "ta", "te",
    "dan", "den", "tan", "ten", "la", "le", "ki", "leri", "ları", "nin", "nın", "nun", "nün",
    "ya", "ye", "yi", "yı", "yu", "yü", "nda", "nde", "ndan", "nden", "yla", "yle", "daki", "deki",
    "taki", "teki", "lerin", "ların", "sine", "sına", "suna", "süne", "sinde", "sında", "sunda", "sünde",
    "sinden", "sından", "sundan", "sünden", "siyle", "sıyla", "suyla", "süyle"
]

# Turkish verb stems for common task types
turkish_task_verbs = {
    'search': ['ara', 'bul', 'tara', 'sorgula', 'araştır', 'incele', 'keşfet', 'gözat'],
    'create': ['oluştur', 'yap', 'üret', 'yarat', 'inşa et', 'kur', 'geliştir', 'tasarla', 'hazırla', 'yaz'],
    'analyze': ['analiz et', 'incele', 'değerlendir', 'çözümle', 'tetkik et', 'gözden geçir', 'irdele', 'araştır'],
    'open': ['aç', 'başlat', 'çalıştır', 'göster', 'görüntüle', 'erişim sağla', 'yükle', 'getir'],
    'transform': ['dönüştür', 'çevir', 'değiştir', 'düzenle', 'biçimlendir', 'uyarla', 'modifiye et', 'şekillendir'],
    'execute': ['yürüt', 'çalıştır', 'gerçekleştir', 'uygula', 'icra et', 'yerine getir', 'tamamla', 'yap'],
    'summarize': ['özetle', 'kısalt', 'özet çıkar', 'özetini yap', 'ana hatlarıyla belirt', 'toparlama yap'],
    'schedule': ['planla', 'programla', 'zamanla', 'ayarla', 'organize et', 'düzenle', 'takvimle', 'sırala']
}

# Turkish dependency markers with their types
turkish_dependency_markers = {
    'sequential': [
        'önce', 'ilk olarak', 'başlangıçta', 'ilk adımda', 'ilk aşamada', 'birinci olarak',
        'sonra', 'daha sonra', 'ardından', 'akabinde', 'takiben', 'müteakiben', 'peşinden',
        'son olarak', 'nihayetinde', 'en son', 'sonunda', 'bitirirken', 'tamamlarken',
        'bitince', 'tamamlanınca', 'bittiğinde', 'tamamlandığında', 'bittikten sonra',
        'ilk', 'ikinci', 'üçüncü', 'dördüncü', 'beşinci', 'son', 'önceki', 'sonraki'
    ],
    'causal': [
        'çünkü', 'zira', 'nedeniyle', 'sebebiyle', 'dolayısıyla', 'bu nedenle', 'bu sebeple',
        'bundan dolayı', 'bunun sonucunda', 'sonuç olarak', 'neticesinde', 'böylece',
        'bu yüzden', 'bundan ötürü', 'buna bağlı olarak', '-den dolayı', '-den ötürü'
    ],
    'conditional': [
        'eğer', 'şayet', '-sa', '-se', 'durumunda', 'takdirde', 'halinde', 'olursa',
        'olduğunda', 'olduğu takdirde', 'olması halinde', 'koşuluyla', 'şartıyla',
        'ancak', 'yalnızca', 'sadece', 'sürece', 'müddetçe', 'diye', 'diyerek'
    ],
    'conjunction': [
        've', 'ile', 'hem', 'ayrıca', 'ek olarak', 'bununla birlikte', 'dahası', 'üstelik',
        'bunun yanında', 'yanı sıra', 'beraberinde', 'birlikte', 'beraber', 'ilaveten'
    ],
    'alternative': [
        'veya', 'ya da', 'yahut', 'veyahut', 'yoksa', 'aksi takdirde', 'değilse',
        'alternatif olarak', 'bunun yerine', 'yerine', 'tercihan', 'tercihen'
    ],
    'contrast': [
        'ama', 'fakat', 'lakin', 'ancak', 'oysa', 'halbuki', 'buna rağmen', 'rağmen',
        'karşın', 'karşılık', 'aksine', 'tersine', 'öte yandan', 'diğer taraftan',
        'yine de', 'gene de', 'bununla beraber', 'ne var ki', 'hal böyleyken'
    ]
}

# Turkish named entity patterns (simple regex patterns for common entities)
turkish_entity_patterns = {
    'DATE': [
        r'\b\d{1,2}\s+(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}\b',
        r'\b(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}\b',
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
        r'\b\d{1,2}\.\d{1,2}\.\d{2,4}\b',
        r'\b(?:Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar)\b'
    ],
    'TIME': [
        r'\b\d{1,2}:\d{2}\b',
        r'\b\d{1,2}:\d{2}:\d{2}\b',
        r'\b\d{1,2}\.\d{2}\b',
        r'\bsabah\b',
        r'\böğle\b',
        r'\bakşam\b',
        r'\bgece\b'
    ],
    'PERSON': [
        r'\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b'
    ],
    'LOCATION': [
        r'\b(?:İstanbul|Ankara|İzmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şanlıurfa|Kocaeli|Mersin|Diyarbakır|Hatay|Manisa|Kayseri|Samsun|Balıkesir|Kahramanmaraş|Van|Aydın|Denizli|Sakarya|Tekirdağ|Muğla|Eskişehir|Mardin|Malatya|Trabzon|Erzurum|Ordu|Afyonkarahisar|Sivas|Adıyaman|Yalova|Çanakkale|Osmaniye|Tokat|Kütahya|Elazığ|Zonguldak|Kırıkkale|Batman|Rize|Aksaray|Giresun|Isparta|Kastamonu|Düzce|Bolu|Nevşehir|Çorum|Uşak|Kırşehir|Niğde|Amasya|Bitlis|Edirne|Burdur|Karaman|Karabük|Bilecik|Hakkari|Kars|Bingöl|Şırnak|Muş|Erzincan|Kırklareli|Bartın|Sinop|Çankırı|Artvin|Ağrı|Yozgat|Siirt|Iğdır|Ardahan|Gümüşhane|Tunceli|Bayburt|Kilis)\b'
    ],
    'ORGANIZATION': [
        r'\b[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜa-zçğıöşü]+\s+(?:Şirketi|Firması|A\.Ş\.|Ltd\.|Holding|Vakfı|Derneği|Kurumu|Bakanlığı|Üniversitesi|Hastanesi|Okulu|Müdürlüğü|Başkanlığı)\b'
    ],
    'MONEY': [
        r'\b\d+(?:\.\d+)*(?:,\d+)?\s*(?:TL|Lira|₺|Dolar|\$|Euro|€|Sterlin|£)\b',
        r'\b(?:TL|Lira|₺|Dolar|\$|Euro|€|Sterlin|£)\s*\d+(?:\.\d+)*(?:,\d+)?\b'
    ],
    'PERCENT': [
        r'\b%\s*\d+(?:,\d+)?\b',
        r'\b\d+(?:,\d+)?\s*%\b',
        r'\byüzde\s+\d+(?:,\d+)?\b'
    ],
    'EMAIL': [
        r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'
    ],
    'URL': [
        r'\b(?:https?://)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[a-zA-Z0-9-._~:/?#[\]@!$&\'()*+,;=]*)?\b'
    ],
    'PHONE': [
        r'\b(?:\+90|0)?\s*(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}\b',
        r'\b(?:\+90|0)?\s*\d{3}\s*\d{3}\s*\d{2}\s*\d{2}\b'
    ],
    'FILE': [
        r'\b[\w-]+\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|xml|html|jpg|jpeg|png|gif|mp3|mp4|avi|mov|zip|rar|tar|gz)\b'
    ]
}

def turkish_lower(text: str) -> str:
    """
    Convert text to lowercase with proper handling of Turkish characters.
    
    Args:
        text: Input text
        
    Returns:
        Lowercase text with proper Turkish character handling
    """
    for upper, lower in tr_lower_map.items():
        text = text.replace(upper, lower)
    return text.lower()

def turkish_upper(text: str) -> str:
    """
    Convert text to uppercase with proper handling of Turkish characters.
    
    Args:
        text: Input text
        
    Returns:
        Uppercase text with proper Turkish character handling
    """
    for lower, upper in tr_upper_map.items():
        text = text.replace(lower, upper)
    return text.upper()

def turkish_tokenize(text: str) -> List[str]:
    """
    Tokenize Turkish text using NLTK's word_tokenize with Turkish-specific handling.
    
    Args:
        text: Input text
        
    Returns:
        List of tokens
    """
    try:
        return word_tokenize(text, language='turkish')
    except:
        # Fallback to simple tokenization
        tokens = []
        # Remove punctuation and split by whitespace
        text_clean = ''.join([c if c not in string.punctuation else ' ' for c in text])
        for token in text_clean.split():
            if token:
                tokens.append(token.lower())
        return tokens

def turkish_stem(word: str) -> str:
    """
    Simple stemming for Turkish words by removing common suffixes.
    
    Args:
        word: Input word
        
    Returns:
        Stemmed word
    """
    word = word.lower()
    original_word = word
    
    # Check verb suffixes
    for suffix in turkish_verb_suffixes:
        if word.endswith(suffix) and len(word) > len(suffix) + 2:
            return word[:-len(suffix)]
    
    # Check noun suffixes
    for suffix in turkish_noun_suffixes:
        if word.endswith(suffix) and len(word) > len(suffix) + 2:
            return word[:-len(suffix)]
    
    return original_word

def extract_turkish_entities(text: str) -> List[Tuple[str, str, int, int]]:
    """
    Extract named entities from Turkish text using regex patterns.
    
    Args:
        text: Input text
        
    Returns:
        List of tuples (entity_text, entity_type, start_index, end_index)
    """
    entities = []
    
    for entity_type, patterns in turkish_entity_patterns.items():
        for pattern in patterns:
            for match in re.finditer(pattern, text):
                entities.append((match.group(), entity_type, match.start(), match.end()))
    
    # Sort by start position
    entities.sort(key=lambda x: x[2])
    return entities

def identify_task_type(text: str) -> str:
    """
    Identify the task type from Turkish text.
    
    Args:
        text: Input text
        
    Returns:
        Task type ('search', 'create', etc.) or 'unknown'
    """
    tokens = turkish_tokenize(text)
    stemmed_tokens = [turkish_stem(token) for token in tokens]
    
    # Check for task verbs
    for task_type, verbs in turkish_task_verbs.items():
        for verb in verbs:
            if verb in text.lower():
                return task_type
            
            # Check stemmed tokens
            verb_stem = turkish_stem(verb.split()[0])  # Handle multi-word verbs
            if verb_stem in stemmed_tokens:
                return task_type
    
    return 'unknown'

def identify_dependencies(text: str) -> Dict[str, List[str]]:
    """
    Identify dependency markers in Turkish text.
    
    Args:
        text: Input text
        
    Returns:
        Dictionary of dependency types and their markers found in the text
    """
    dependencies = {}
    text_lower = text.lower()
    
    for dep_type, markers in turkish_dependency_markers.items():
        found_markers = []
        for marker in markers:
            if marker in text_lower:
                found_markers.append(marker)
        
        if found_markers:
            dependencies[dep_type] = found_markers
    
    return dependencies

def extract_parameters(text: str) -> Dict[str, Any]:
    """
    Extract parameters from Turkish text.
    
    Args:
        text: Input text
        
    Returns:
        Dictionary of parameter types and their values
    """
    parameters = {}
    
    # Extract entities as parameters
    entities = extract_turkish_entities(text)
    for entity_text, entity_type, _, _ in entities:
        if entity_type not in parameters:
            parameters[entity_type] = []
        parameters[entity_type].append(entity_text)
    
    # Extract variables (patterns like {variable_name} or <variable_name>)
    variable_pattern = re.compile(r'[{<]([a-zA-Z0-9_]+)[}>]')
    variables = variable_pattern.findall(text)
    if variables:
        parameters['VARIABLE'] = variables
    
    return parameters

def split_into_segments(text: str) -> List[str]:
    """
    Split Turkish text into segments based on dependency markers.
    
    Args:
        text: Input text
        
    Returns:
        List of text segments
    """
    segments = []
    
    # First try to split by sequential markers
    for marker in turkish_dependency_markers['sequential']:
        if marker in text.lower():
            parts = re.split(r'\b' + re.escape(marker) + r'\b', text, flags=re.IGNORECASE)
            if len(parts) > 1:
                # Add the first part
                segments.append(parts[0].strip())
                # Add the rest with their markers
                for i in range(1, len(parts)):
                    if parts[i].strip():
                        segments.append(f"{marker} {parts[i].strip()}")
                return segments
    
    # If no sequential markers, try to split by conjunction markers
    for marker in turkish_dependency_markers['conjunction']:
        if marker in text.lower():
            parts = re.split(r'\b' + re.escape(marker) + r'\b', text, flags=re.IGNORECASE)
            if len(parts) > 1:
                # Add the first part
                segments.append(parts[0].strip())
                # Add the rest with their markers
                for i in range(1, len(parts)):
                    if parts[i].strip():
                        segments.append(f"{marker} {parts[i].strip()}")
                return segments
    
    # If no markers found, return the whole text as a single segment
    segments.append(text)
    return segments

# Main function for testing
if __name__ == "__main__":
    # Test the Turkish language support
    test_texts = [
        "Yapay zeka hakkında bilgi ara ve bir rapor oluştur",
        "Önce veriyi analiz et, sonra bir görselleştirme oluştur",
        "15 Mayıs 2023 tarihinde İstanbul'da bir toplantı planla",
        "Ahmet Yılmaz'a bir e-posta gönder ve dosyaları ekle",
        "Türkiye Cumhuriyeti Sağlık Bakanlığı'nın web sitesini ziyaret et"
    ]
    
    for text in test_texts:
        print(f"Text: {text}")
        print(f"Tokens: {turkish_tokenize(text)}")
        print(f"Task type: {identify_task_type(text)}")
        print(f"Dependencies: {identify_dependencies(text)}")
        print(f"Parameters: {extract_parameters(text)}")
        print(f"Segments: {split_into_segments(text)}")
        print()
