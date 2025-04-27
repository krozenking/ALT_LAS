"""
Enhanced Language Processor with Extended Multilingual Support

This module provides language processing capabilities with support for multiple languages:
- English (en)
- Turkish (tr)
- German (de)
- French (fr)
- Spanish (es)
- Russian (ru)

Features include:
- Language detection
- Tokenization
- Stopwords
- Task keywords
- Dependency indicators
- Relationship indicators
- Context keywords
"""

import os
import re
import json
import yaml
import string
import logging
from typing import Dict, List, Set, Tuple, Any, Optional
from collections import defaultdict, Counter
from pathlib import Path

# Setup logging
logger = logging.getLogger(__name__)

class LanguageProcessor:
    """
    Language processor for multilingual support
    
    Supports:
    - English (en)
    - Turkish (tr)
    - German (de)
    - French (fr)
    - Spanish (es)
    - Russian (ru)
    """
    
    def __init__(self, resources_dir: str = None):
        """
        Initialize language processor
        
        Args:
            resources_dir: Directory containing language resources (YAML/JSON files)
        """
        # Set resources directory
        self.resources_dir = resources_dir or os.path.join(os.path.dirname(__file__), "language_resources")
        
        # Create resources directory if it doesn't exist
        os.makedirs(self.resources_dir, exist_ok=True)
        
        # Initialize language resources
        self._initialize_resources()
        
        # Load external resources if available
        self._load_external_resources()
        
        logger.info(f"Initialized language processor with support for {', '.join(self.supported_languages)}")
    
    def _initialize_resources(self):
        """Initialize default language resources"""
        # Supported languages
        self.supported_languages = ["en", "tr", "de", "fr", "es", "ru"]
        
        # Language names
        self.language_names = {
            "en": "English",
            "tr": "Turkish",
            "de": "German",
            "fr": "French",
            "es": "Spanish",
            "ru": "Russian"
        }
        
        # Language detection patterns
        self.language_patterns = {
            "en": [
                r"\b(the|a|an|is|are|was|were|have|has|had|this|that|these|those)\b",
                r"\b(and|or|but|if|then|because|therefore|however|although)\b",
                r"\b(I|you|he|she|it|we|they|my|your|his|her|its|our|their)\b"
            ],
            "tr": [
                r"\b(bir|ve|veya|bu|şu|o|için|ile|gibi|kadar|daha|çok|az)\b",
                r"\b(ben|sen|o|biz|siz|onlar|benim|senin|onun|bizim|sizin|onların)\b",
                r"\b(var|yok|değil|evet|hayır|tamam|oldu|olur|olsun|olacak|olmuş)\b",
                r"[ğüşıöç]"  # Turkish-specific characters
            ],
            "de": [
                r"\b(der|die|das|ein|eine|und|oder|aber|wenn|dann|weil|deshalb)\b",
                r"\b(ich|du|er|sie|es|wir|ihr|sie|mein|dein|sein|ihr|unser|euer)\b",
                r"\b(ist|sind|war|waren|haben|hat|hatte|hatten|werden|wird|wurde)\b",
                r"[äöüß]"  # German-specific characters
            ],
            "fr": [
                r"\b(le|la|les|un|une|des|et|ou|mais|si|alors|parce|que|donc)\b",
                r"\b(je|tu|il|elle|nous|vous|ils|elles|mon|ton|son|notre|votre)\b",
                r"\b(est|sont|était|étaient|avoir|a|avait|avaient|être|suis|es)\b",
                r"[éèêëàâäôöùûüÿçœæ]"  # French-specific characters
            ],
            "es": [
                r"\b(el|la|los|las|un|una|unos|unas|y|o|pero|si|entonces|porque)\b",
                r"\b(yo|tú|él|ella|nosotros|vosotros|ellos|ellas|mi|tu|su|nuestro)\b",
                r"\b(es|son|era|eran|ha|han|había|habían|ser|estar|estoy|está)\b",
                r"[áéíóúüñ¿¡]"  # Spanish-specific characters
            ],
            "ru": [
                r"\b(и|или|но|если|то|потому|что|поэтому|однако|хотя|также|как)\b",
                r"\b(я|ты|он|она|оно|мы|вы|они|мой|твой|его|её|наш|ваш|их)\b",
                r"\b(есть|был|была|было|были|буду|будет|будут|быть|являюсь)\b",
                r"[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]"  # Russian-specific characters (Cyrillic)
            ]
        }
        
        # Stopwords
        self.stopwords = {
            "en": {
                "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "where", "why", "how",
                "all", "any", "both", "each", "few", "more", "most", "some", "such", "no", "nor", "not",
                "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don",
                "should", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn", "didn",
                "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn",
                "wasn", "weren", "won", "wouldn", "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
                "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
                "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
                "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was",
                "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing",
                "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at",
                "by", "for", "with", "about", "against", "between", "into", "through", "during", "before",
                "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over",
                "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how",
                "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
                "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
                "don", "should", "now"
            },
            "tr": {
                "acaba", "altı", "altmış", "ama", "ancak", "arada", "artık", "asla", "aslında", "ayrıca",
                "az", "bana", "bazen", "bazı", "bazıları", "belki", "ben", "benden", "beni", "benim",
                "beş", "bile", "bilhassa", "bin", "bir", "biraz", "birçoğu", "birçok", "biri", "birisi",
                "birkaç", "birşey", "biz", "bizden", "bize", "bizi", "bizim", "böyle", "böylece", "bu",
                "buna", "bunda", "bundan", "bunlar", "bunları", "bunların", "bunu", "bunun", "burada",
                "bütün", "çoğu", "çoğunu", "çok", "çünkü", "da", "daha", "dahi", "de", "defa", "değil",
                "diğer", "diğeri", "diğerleri", "diye", "doksan", "dokuz", "dolayı", "dolayısıyla", "dört",
                "edecek", "eden", "ederek", "edilecek", "ediliyor", "edilmesi", "ediyor", "eğer", "elbette",
                "elli", "en", "etmesi", "etti", "ettiği", "ettiğini", "fakat", "falan", "filan", "gene",
                "gereği", "gerek", "gibi", "göre", "hala", "halde", "halen", "hangi", "hangisi", "hani",
                "hatta", "hem", "henüz", "hep", "hepsi", "her", "herhangi", "herkes", "herkese", "herkesi",
                "herkesin", "hiç", "hiçbir", "hiçbiri", "için", "içinde", "iki", "ile", "ilgili", "ise",
                "işte", "itibaren", "itibariyle", "kaç", "kadar", "karşın", "kendi", "kendilerine", "kendine",
                "kendini", "kendisi", "kendisine", "kendisini", "kez", "ki", "kim", "kime", "kimi", "kimin",
                "kimisi", "kimse", "kırk", "madem", "mi", "mı", "milyar", "milyon", "mu", "mü", "nasıl", "ne",
                "neden", "nedenle", "nerde", "nerede", "nereye", "neyse", "niçin", "nin", "nın", "niye", "nun",
                "nün", "o", "öbür", "olan", "olarak", "oldu", "olduğu", "olduğunu", "olduklarını", "olmadı",
                "olmadığı", "olmak", "olması", "olmayan", "olmaz", "olsa", "olsun", "olup", "olur", "olursa",
                "oluyor", "on", "ön", "ona", "önce", "ondan", "onlar", "onlara", "onlardan", "onları", "onların",
                "onu", "onun", "orada", "öte", "ötürü", "otuz", "öyle", "oysa", "pek", "rağmen", "sana", "sanki",
                "şayet", "şekilde", "sekiz", "seksen", "sen", "senden", "seni", "senin", "şey", "şeyden", "şeye",
                "şeyi", "şeyler", "şimdi", "siz", "sizden", "size", "sizi", "sizin", "sonra", "şöyle", "şu",
                "şuna", "şunda", "şundan", "şunlar", "şunu", "şunun", "ta", "tabii", "tam", "tamam", "tamamen",
                "tarafından", "trilyon", "tüm", "tümü", "üç", "üzere", "var", "vardı", "ve", "veya", "ya", "yani",
                "yapacak", "yapılan", "yapılması", "yapıyor", "yapmak", "yaptı", "yaptığı", "yaptığını", "yaptıkları",
                "ye", "yedi", "yerine", "yetmiş", "yi", "yı", "yine", "yirmi", "yoksa", "yu", "yüz", "zaten", "zira"
            },
            "de": {
                "aber", "alle", "allem", "allen", "aller", "alles", "als", "also", "am", "an", "ander", "andere",
                "anderem", "anderen", "anderer", "anderes", "anderm", "andern", "anderr", "anders", "auch", "auf",
                "aus", "bei", "bin", "bis", "bist", "da", "damit", "dann", "der", "den", "des", "dem", "die", "das",
                "daß", "dass", "derselbe", "derselben", "denselben", "desselben", "demselben", "dieselbe", "dieselben",
                "dasselbe", "dazu", "dein", "deine", "deinem", "deinen", "deiner", "deines", "denn", "derer", "dessen",
                "dich", "dir", "du", "dies", "diese", "diesem", "diesen", "dieser", "dieses", "doch", "dort", "durch",
                "ein", "eine", "einem", "einen", "einer", "eines", "einig", "einige", "einigem", "einigen", "einiger",
                "einiges", "einmal", "er", "ihn", "ihm", "es", "etwas", "euer", "eure", "eurem", "euren", "eurer",
                "eures", "für", "gegen", "gewesen", "hab", "habe", "haben", "hat", "hatte", "hatten", "hier", "hin",
                "hinter", "ich", "mich", "mir", "ihr", "ihre", "ihrem", "ihren", "ihrer", "ihres", "euch", "im", "in",
                "indem", "ins", "ist", "jede", "jedem", "jeden", "jeder", "jedes", "jene", "jenem", "jenen", "jener",
                "jenes", "jetzt", "kann", "kein", "keine", "keinem", "keinen", "keiner", "keines", "können", "könnte",
                "machen", "man", "manche", "manchem", "manchen", "mancher", "manches", "mein", "meine", "meinem",
                "meinen", "meiner", "meines", "mit", "muss", "musste", "nach", "nicht", "nichts", "noch", "nun", "nur",
                "ob", "oder", "ohne", "sehr", "sein", "seine", "seinem", "seinen", "seiner", "seines", "selbst", "sich",
                "sie", "ihnen", "sind", "so", "solche", "solchem", "solchen", "solcher", "solches", "soll", "sollte",
                "sondern", "sonst", "über", "um", "und", "uns", "unse", "unsem", "unsen", "unser", "unses", "unter",
                "viel", "vom", "von", "vor", "während", "war", "waren", "warst", "was", "weg", "weil", "weiter",
                "welche", "welchem", "welchen", "welcher", "welches", "wenn", "werde", "werden", "wie", "wieder",
                "will", "wir", "wird", "wirst", "wo", "wollen", "wollte", "würde", "würden", "zu", "zum", "zur", "zwar",
                "zwischen"
            },
            "fr": {
                "a", "à", "au", "aux", "avec", "ce", "ces", "dans", "de", "des", "du", "elle", "en", "et", "eux",
                "il", "ils", "je", "j'ai", "j'avais", "la", "le", "leur", "lui", "ma", "mais", "me", "même", "mes",
                "moi", "mon", "ni", "notre", "nous", "on", "ou", "où", "par", "pas", "pour", "qu", "que", "qui",
                "s", "sa", "se", "si", "son", "sur", "ta", "te", "tes", "toi", "ton", "tu", "un", "une", "votre",
                "vous", "c", "d", "j", "l", "à", "m", "n", "s", "t", "y", "été", "étée", "étées", "étés", "étant",
                "suis", "es", "est", "sommes", "êtes", "sont", "serai", "seras", "sera", "serons", "serez", "seront",
                "serais", "serait", "serions", "seriez", "seraient", "étais", "était", "étions", "étiez", "étaient",
                "fus", "fut", "fûmes", "fûtes", "furent", "sois", "soit", "soyons", "soyez", "soient", "fusse",
                "fusses", "fût", "fussions", "fussiez", "fussent", "avoir", "ayant", "eu", "eue", "eues", "eus",
                "ai", "as", "avons", "avez", "ont", "aurai", "auras", "aura", "aurons", "aurez", "auront", "aurais",
                "aurait", "aurions", "auriez", "auraient", "avais", "avait", "avions", "aviez", "avaient", "eut",
                "eûmes", "eûtes", "eurent", "aie", "aies", "ait", "ayons", "ayez", "aient", "eusse", "eusses", "eût",
                "eussions", "eussiez", "eussent", "ceci", "cela", "celà", "cet", "cette", "ici", "ils", "les", "leurs",
                "quel", "quels", "quelle", "quelles", "sans", "soi"
            },
            "es": {
                "a", "al", "algo", "algunas", "algunos", "ante", "antes", "como", "con", "contra", "cual", "cuando",
                "de", "del", "desde", "donde", "durante", "e", "el", "ella", "ellas", "ellos", "en", "entre", "era",
                "erais", "eran", "eras", "eres", "es", "esa", "esas", "ese", "eso", "esos", "esta", "estaba", "estabais",
                "estaban", "estabas", "estad", "estada", "estadas", "estado", "estados", "estamos", "estando", "estar",
                "estaremos", "estará", "estarán", "estarás", "estaré", "estaréis", "estaría", "estaríais", "estaríamos",
                "estarían", "estarías", "estas", "este", "estemos", "esto", "estos", "estoy", "estuve", "estuviera",
                "estuvierais", "estuvieran", "estuvieras", "estuvieron", "estuviese", "estuvieseis", "estuviesen",
                "estuvieses", "estuvimos", "estuviste", "estuvisteis", "estuviéramos", "estuviésemos", "estuvo", "está",
                "estábamos", "estáis", "están", "estás", "esté", "estéis", "estén", "estés", "fue", "fuera", "fuerais",
                "fueran", "fueras", "fueron", "fuese", "fueseis", "fuesen", "fueses", "fui", "fuimos", "fuiste", "fuisteis",
                "fuéramos", "fuésemos", "ha", "habida", "habidas", "habido", "habidos", "habiendo", "habremos", "habrá",
                "habrán", "habrás", "habré", "habréis", "habría", "habríais", "habríamos", "habrían", "habrías", "habéis",
                "había", "habíais", "habíamos", "habían", "habías", "han", "has", "hasta", "hay", "haya", "hayamos", "hayan",
                "hayas", "hayáis", "he", "hemos", "hube", "hubiera", "hubierais", "hubieran", "hubieras", "hubieron",
                "hubiese", "hubieseis", "hubiesen", "hubieses", "hubimos", "hubiste", "hubisteis", "hubiéramos",
                "hubiésemos", "hubo", "la", "las", "le", "les", "lo", "los", "me", "mi", "mis", "mucho", "muchos", "muy",
                "más", "mí", "mía", "mías", "mío", "míos", "nada", "ni", "no", "nos", "nosotras", "nosotros", "nuestra",
                "nuestras", "nuestro", "nuestros", "o", "os", "otra", "otras", "otro", "otros", "para", "pero", "poco",
                "por", "porque", "que", "quien", "quienes", "qué", "se", "sea", "seamos", "sean", "seas", "seremos",
                "será", "serán", "serás", "seré", "seréis", "sería", "seríais", "seríamos", "serían", "serías", "seáis",
                "si", "sido", "siendo", "sin", "sobre", "sois", "somos", "son", "soy", "su", "sus", "suya", "suyas",
                "suyo", "suyos", "sí", "también", "tanto", "te", "tendremos", "tendrá", "tendrán", "tendrás", "tendré",
                "tendréis", "tendría", "tendríais", "tendríamos", "tendrían", "tendrías", "tened", "tenemos", "tenga",
                "tengamos", "tengan", "tengas", "tengo", "tengáis", "tenida", "tenidas", "tenido", "tenidos", "teniendo",
                "tenéis", "tenía", "teníais", "teníamos", "tenían", "tenías", "ti", "tiene", "tienen", "tienes", "todo",
                "todos", "tu", "tus", "tuve", "tuviera", "tuvierais", "tuvieran", "tuvieras", "tuvieron", "tuviese",
                "tuvieseis", "tuviesen", "tuvieses", "tuvimos", "tuviste", "tuvisteis", "tuviéramos", "tuviésemos",
                "tuvo", "tuya", "tuyas", "tuyo", "tuyos", "tú", "un", "una", "uno", "unos", "vosotras", "vosotros",
                "vuestra", "vuestras", "vuestro", "vuestros", "y", "ya", "yo", "él", "éramos"
            },
            "ru": {
                "а", "е", "и", "ж", "м", "о", "на", "не", "ни", "об", "но", "он", "мне", "мои", "мож", "она", "они",
                "оно", "мной", "много", "многочисленное", "многочисленная", "многочисленные", "многочисленный", "мною",
                "мой", "мог", "могут", "можно", "может", "можхо", "мор", "моя", "моё", "мочь", "над", "нее", "оба",
                "нам", "нем", "нами", "ними", "мимо", "немного", "одной", "одного", "менее", "однажды", "однако", "меня",
                "нему", "меньше", "ней", "наверху", "него", "ниже", "мало", "надо", "один", "одиннадцать", "одиннадцатый",
                "назад", "наиболее", "недавно", "миллионов", "недалеко", "между", "низко", "меля", "нельзя", "нибудь",
                "непрерывно", "наконец", "никогда", "никуда", "нас", "наш", "нет", "нею", "неё", "них", "мира", "наша",
                "наше", "наши", "ничего", "начала", "нередко", "несколько", "обычно", "опять", "около", "мы", "ну", "нх",
                "от", "отовсюду", "особенно", "нужно", "очень", "отсюда", "в", "во", "вон", "вниз", "внизу", "вокруг",
                "вот", "восемнадцать", "восемнадцатый", "восемь", "восьмой", "вверх", "вам", "вами", "важное", "важная",
                "важные", "важный", "вдали", "везде", "ведь", "вас", "ваш", "ваша", "ваше", "ваши", "впрочем", "весь",
                "вдруг", "вы", "все", "второй", "всем", "всеми", "времени", "время", "всему", "всего", "всегда", "всех",
                "всею", "всю", "вся", "всё", "всюду", "г", "год", "говорил", "говорит", "года", "году", "где", "да", "ее",
                "за", "из", "ли", "же", "им", "до", "по", "ими", "под", "иногда", "довольно", "именно", "долго", "позже",
                "более", "должно", "пожалуйста", "значит", "иметь", "больше", "пока", "ему", "имя", "пор", "пора", "потом",
                "потому", "после", "почему", "почти", "посреди", "ей", "два", "две", "двенадцать", "двенадцатый", "двадцать",
                "двадцатый", "двух", "его", "дел", "или", "без", "день", "занят", "занята", "занято", "заняты", "действительно",
                "давно", "девятнадцать", "девятнадцатый", "девять", "девятый", "даже", "алло", "жизнь", "далеко", "близко",
                "здесь", "дальше", "для", "лет", "зато", "даром", "первый", "перед", "затем", "зачем", "лишь", "десять",
                "десятый", "ею", "её", "их", "бы", "еще", "при", "был", "про", "процентов", "против", "просто", "бывает",
                "бывь", "если", "люди", "была", "были", "было", "будем", "будет", "будете", "будешь", "прекрасно", "буду",
                "будь", "будто", "будут", "ещё", "пятнадцать", "пятнадцатый", "друго", "другое", "другой", "другие", "другая",
                "других", "есть", "пять", "быть", "лучше", "пятый", "к", "ком", "конечно", "кому", "кого", "когда", "которой",
                "которого", "которая", "которые", "который", "которых", "кем", "каждое", "каждая", "каждые", "каждый", "кажется",
                "как", "какой", "какая", "кто", "кроме", "куда", "кругом", "с", "т", "у", "я", "та", "те", "уж", "со", "то",
                "том", "снова", "тому", "совсем", "того", "тогда", "тоже", "собой", "тобой", "собою", "тобою", "сначала",
                "только", "уметь", "тот", "тою", "хорошо", "хотеть", "хочешь", "хоть", "хотя", "свое", "свои", "твой", "своей",
                "своего", "своих", "свою", "твоя", "твоё", "раз", "уже", "сам", "там", "тем", "чем", "сама", "сами", "теми",
                "само", "рано", "самом", "самому", "самой", "самого", "семнадцать", "семнадцатый", "самим", "самими", "самих",
                "саму", "семь", "чему", "раньше", "сейчас", "чего", "сегодня", "себе", "тебе", "сеаой", "человек", "разве",
                "теперь", "себя", "тебя", "седьмой", "спасибо", "слишком", "так", "такое", "такой", "такие", "также", "такая",
                "сих", "тех", "чаще", "четвертый", "через", "часто", "шестой", "шестнадцать", "шестнадцатый", "шесть", "четыре",
                "четырнадцать", "четырнадцатый", "сколько", "сказал", "сказала", "сказать", "ту", "ты", "три", "эта", "эти",
                "что", "это", "чтоб", "этом", "этому", "этой", "этого", "чтобы", "этот", "стал", "туда", "этим", "этими",
                "рядом", "тринадцать", "тринадцатый", "этих", "третий", "тут", "эту", "суть", "чуть", "тысяч"
            }
        }
        
        # Task keywords
        self.task_keywords = {
            "en": {
                "search": ["search", "find", "look", "query", "google", "research", "explore", "investigate", "browse"],
                "create": ["create", "make", "generate", "build", "develop", "design", "produce", "compose", "construct"],
                "analyze": ["analyze", "examine", "study", "inspect", "review", "evaluate", "assess", "investigate", "scrutinize"],
                "summarize": ["summarize", "condense", "digest", "brief", "outline", "recap", "abstract", "synopsize", "overview"],
                "compare": ["compare", "contrast", "differentiate", "distinguish", "weigh", "match", "correlate", "juxtapose", "relate"],
                "translate": ["translate", "convert", "interpret", "render", "transform", "transcribe", "transpose", "reword", "rephrase"],
                "calculate": ["calculate", "compute", "determine", "figure", "reckon", "solve", "count", "quantify", "measure"],
                "visualize": ["visualize", "display", "show", "present", "illustrate", "depict", "render", "represent", "diagram"],
                "extract": ["extract", "pull", "obtain", "derive", "gather", "collect", "mine", "retrieve", "acquire"],
                "format": ["format", "arrange", "organize", "structure", "style", "layout", "configure", "set up", "design"]
            },
            "tr": {
                "search": ["ara", "bul", "araştır", "sorgula", "google", "incele", "keşfet", "soruştur", "gözat"],
                "create": ["oluştur", "yap", "üret", "inşa et", "geliştir", "tasarla", "yarat", "hazırla", "kur"],
                "analyze": ["analiz et", "incele", "çalış", "denetle", "gözden geçir", "değerlendir", "araştır", "tetkik et", "sorgula"],
                "summarize": ["özetle", "kısalt", "özet çıkar", "ana hatlarıyla belirt", "özetini çıkar", "özet yap", "ana hatları çıkar", "özetini yap", "özet oluştur"],
                "compare": ["karşılaştır", "kıyasla", "farkını bul", "ayırt et", "tart", "eşleştir", "ilişkilendir", "yan yana koy", "bağlantı kur"],
                "translate": ["çevir", "tercüme et", "yorumla", "dönüştür", "aktarım yap", "yeniden yaz", "ifade et", "başka dile çevir", "tercüme yap"],
                "calculate": ["hesapla", "hesap yap", "belirle", "çöz", "say", "ölç", "hesabını yap", "rakamlarını bul", "sayısal değerini bul"],
                "visualize": ["görselleştir", "göster", "sun", "sergile", "resmet", "tasvir et", "canlandır", "temsil et", "şema oluştur"],
                "extract": ["çıkar", "al", "elde et", "topla", "derle", "çek", "ayıkla", "getir", "edin"],
                "format": ["biçimlendir", "düzenle", "organize et", "yapılandır", "şekillendir", "tasarla", "ayarla", "kur", "düzen ver"]
            },
            "de": {
                "search": ["suchen", "finden", "recherchieren", "abfragen", "google", "erforschen", "erkunden", "untersuchen", "durchsuchen"],
                "create": ["erstellen", "machen", "generieren", "bauen", "entwickeln", "gestalten", "produzieren", "komponieren", "konstruieren"],
                "analyze": ["analysieren", "untersuchen", "studieren", "inspizieren", "überprüfen", "bewerten", "beurteilen", "erforschen", "prüfen"],
                "summarize": ["zusammenfassen", "kondensieren", "verdichten", "kurzfassen", "skizzieren", "rekapitulieren", "abstrahieren", "überblicken", "umreißen"],
                "compare": ["vergleichen", "gegenüberstellen", "differenzieren", "unterscheiden", "abwägen", "abgleichen", "korrelieren", "nebeneinanderstellen", "beziehen"],
                "translate": ["übersetzen", "konvertieren", "interpretieren", "wiedergeben", "transformieren", "transkribieren", "umsetzen", "umformulieren", "umschreiben"],
                "calculate": ["berechnen", "kalkulieren", "ermitteln", "ausrechnen", "bestimmen", "lösen", "zählen", "quantifizieren", "messen"],
                "visualize": ["visualisieren", "anzeigen", "zeigen", "präsentieren", "illustrieren", "darstellen", "rendern", "repräsentieren", "diagramm erstellen"],
                "extract": ["extrahieren", "ziehen", "erhalten", "ableiten", "sammeln", "erfassen", "gewinnen", "abrufen", "beschaffen"],
                "format": ["formatieren", "anordnen", "organisieren", "strukturieren", "gestalten", "layout", "konfigurieren", "einrichten", "entwerfen"]
            },
            "fr": {
                "search": ["rechercher", "trouver", "chercher", "interroger", "google", "explorer", "enquêter", "examiner", "parcourir"],
                "create": ["créer", "faire", "générer", "construire", "développer", "concevoir", "produire", "composer", "élaborer"],
                "analyze": ["analyser", "examiner", "étudier", "inspecter", "réviser", "évaluer", "estimer", "enquêter", "scruter"],
                "summarize": ["résumer", "condenser", "synthétiser", "abréger", "esquisser", "récapituler", "abstraire", "synoptiser", "aperçu"],
                "compare": ["comparer", "contraster", "différencier", "distinguer", "peser", "correspondre", "corréler", "juxtaposer", "relier"],
                "translate": ["traduire", "convertir", "interpréter", "rendre", "transformer", "transcrire", "transposer", "reformuler", "paraphraser"],
                "calculate": ["calculer", "informatiser", "déterminer", "figurer", "estimer", "résoudre", "compter", "quantifier", "mesurer"],
                "visualize": ["visualiser", "afficher", "montrer", "présenter", "illustrer", "dépeindre", "rendre", "représenter", "diagramme"],
                "extract": ["extraire", "tirer", "obtenir", "dériver", "recueillir", "collecter", "exploiter", "récupérer", "acquérir"],
                "format": ["formater", "arranger", "organiser", "structurer", "styliser", "mise en page", "configurer", "mettre en place", "concevoir"]
            },
            "es": {
                "search": ["buscar", "encontrar", "investigar", "consultar", "google", "explorar", "indagar", "examinar", "navegar"],
                "create": ["crear", "hacer", "generar", "construir", "desarrollar", "diseñar", "producir", "componer", "elaborar"],
                "analyze": ["analizar", "examinar", "estudiar", "inspeccionar", "revisar", "evaluar", "valorar", "investigar", "escrutar"],
                "summarize": ["resumir", "condensar", "sintetizar", "abreviar", "esquematizar", "recapitular", "abstraer", "sinopsis", "resumen"],
                "compare": ["comparar", "contrastar", "diferenciar", "distinguir", "sopesar", "emparejar", "correlacionar", "yuxtaponer", "relacionar"],
                "translate": ["traducir", "convertir", "interpretar", "rendir", "transformar", "transcribir", "transponer", "reformular", "parafrasear"],
                "calculate": ["calcular", "computar", "determinar", "figurar", "estimar", "resolver", "contar", "cuantificar", "medir"],
                "visualize": ["visualizar", "mostrar", "enseñar", "presentar", "ilustrar", "representar", "renderizar", "representar", "diagrama"],
                "extract": ["extraer", "sacar", "obtener", "derivar", "recoger", "recopilar", "minar", "recuperar", "adquirir"],
                "format": ["formatear", "organizar", "estructurar", "estilizar", "diseñar", "configurar", "establecer", "diseñar"]
            },
            "ru": {
                "search": ["искать", "найти", "поиск", "запрос", "гуглить", "исследовать", "изучать", "расследовать", "просматривать"],
                "create": ["создать", "сделать", "генерировать", "построить", "разработать", "проектировать", "производить", "составлять", "конструировать"],
                "analyze": ["анализировать", "изучать", "исследовать", "проверять", "рассматривать", "оценивать", "оценить", "исследовать", "изучить"],
                "summarize": ["обобщать", "конденсировать", "резюмировать", "кратко", "очертить", "резюме", "абстрагировать", "синопсис", "обзор"],
                "compare": ["сравнивать", "сопоставлять", "различать", "отличать", "взвешивать", "сопоставить", "соотносить", "сравнить", "связывать"],
                "translate": ["переводить", "конвертировать", "интерпретировать", "преобразовать", "трансформировать", "транскрибировать", "перефразировать", "переформулировать"],
                "calculate": ["вычислять", "рассчитывать", "определять", "вычислить", "решать", "считать", "количественно оценить", "измерять"],
                "visualize": ["визуализировать", "отображать", "показывать", "представлять", "иллюстрировать", "изображать", "представить", "диаграмма"],
                "extract": ["извлекать", "получать", "выводить", "собирать", "коллекционировать", "добывать", "получить", "приобретать"],
                "format": ["форматировать", "упорядочивать", "организовывать", "структурировать", "стилизовать", "макет", "настраивать", "установить", "проектировать"]
            }
        }
        
        # Dependency indicators
        self.dependency_indicators = {
            "en": [
                "after", "before", "then", "once", "when", "following", "prior to", "subsequent to", "upon completion of",
                "after completing", "before starting", "once finished", "when done", "following the", "prior to the",
                "subsequent to the", "upon completion of the", "after the", "before the", "once the", "when the"
            ],
            "tr": [
                "sonra", "önce", "ardından", "bitince", "tamamlanınca", "takiben", "öncesinde", "sonrasında", "tamamlandıktan sonra",
                "tamamladıktan sonra", "başlamadan önce", "bitirdikten sonra", "yapıldığında", "takiben", "öncesinde",
                "sonrasında", "tamamlandıktan sonra", "sonra", "önce", "bitince", "olduğunda"
            ],
            "de": [
                "nach", "vor", "dann", "sobald", "wenn", "folgend", "vor dem", "nach dem", "nach Abschluss von",
                "nach Abschluss", "vor Beginn", "sobald fertig", "wenn erledigt", "folgend auf", "vor dem",
                "nach dem", "nach Abschluss des", "nach dem", "vor dem", "sobald das", "wenn das"
            ],
            "fr": [
                "après", "avant", "puis", "une fois", "quand", "suivant", "avant de", "suite à", "après avoir terminé",
                "après avoir complété", "avant de commencer", "une fois terminé", "quand c'est fait", "suivant le", "avant le",
                "suite au", "après avoir terminé le", "après le", "avant le", "une fois le", "quand le"
            ],
            "es": [
                "después", "antes", "luego", "una vez", "cuando", "siguiendo", "antes de", "posterior a", "al completar",
                "después de completar", "antes de comenzar", "una vez terminado", "cuando esté hecho", "siguiendo el", "antes del",
                "posterior al", "al completar el", "después del", "antes del", "una vez el", "cuando el"
            ],
            "ru": [
                "после", "до", "затем", "как только", "когда", "следующий", "до того", "после того", "по завершении",
                "после завершения", "перед началом", "как только закончено", "когда сделано", "следуя", "до",
                "после", "по завершении", "после", "до", "как только", "когда"
            ]
        }
        
        # Conjunction indicators
        self.conjunction_indicators = {
            "en": ["and", "also", "additionally", "moreover", "furthermore", "plus", "as well as", "along with", "together with", "in addition to"],
            "tr": ["ve", "ayrıca", "ek olarak", "dahası", "üstelik", "artı", "yanı sıra", "birlikte", "beraber", "ilaveten"],
            "de": ["und", "auch", "zusätzlich", "außerdem", "ferner", "plus", "sowie", "zusammen mit", "gemeinsam mit", "zusätzlich zu"],
            "fr": ["et", "aussi", "en outre", "de plus", "par ailleurs", "plus", "ainsi que", "avec", "ensemble avec", "en plus de"],
            "es": ["y", "también", "adicionalmente", "además", "asimismo", "más", "así como", "junto con", "junto a", "además de"],
            "ru": ["и", "также", "дополнительно", "кроме того", "более того", "плюс", "а также", "вместе с", "совместно с", "в дополнение к"]
        }
        
        # Alternative indicators
        self.alternative_indicators = {
            "en": ["or", "alternatively", "either", "otherwise", "instead", "as an alternative", "as another option", "as a substitute", "rather than", "in place of"],
            "tr": ["veya", "ya da", "alternatif olarak", "aksi takdirde", "bunun yerine", "bir alternatif olarak", "başka bir seçenek olarak", "yerine", "yerine geçecek şekilde", "yerini alarak"],
            "de": ["oder", "alternativ", "entweder", "andernfalls", "stattdessen", "als Alternative", "als andere Option", "als Ersatz", "anstatt", "anstelle von"],
            "fr": ["ou", "alternativement", "soit", "autrement", "au lieu de", "comme alternative", "comme autre option", "comme substitut", "plutôt que", "à la place de"],
            "es": ["o", "alternativamente", "ya sea", "de lo contrario", "en su lugar", "como alternativa", "como otra opción", "como sustituto", "en vez de", "en lugar de"],
            "ru": ["или", "альтернативно", "либо", "иначе", "вместо", "в качестве альтернативы", "как другой вариант", "как замена", "вместо того чтобы", "на месте"]
        }
        
        # Contrast indicators
        self.contrast_indicators = {
            "en": ["but", "however", "nevertheless", "nonetheless", "yet", "still", "although", "though", "even though", "despite", "in spite of", "regardless of", "notwithstanding"],
            "tr": ["ama", "fakat", "ancak", "bununla birlikte", "yine de", "hala", "gerçi", "olsa da", "olsa bile", "rağmen", "karşın", "bakmaksızın", "buna rağmen"],
            "de": ["aber", "jedoch", "dennoch", "trotzdem", "doch", "immer noch", "obwohl", "obgleich", "selbst wenn", "trotz", "ungeachtet", "unabhängig von", "ungeachtet dessen"],
            "fr": ["mais", "cependant", "néanmoins", "pourtant", "toutefois", "encore", "bien que", "quoique", "même si", "malgré", "en dépit de", "indépendamment de", "nonobstant"],
            "es": ["pero", "sin embargo", "no obstante", "aun así", "todavía", "aunque", "a pesar de", "incluso si", "a pesar de", "independientemente de", "no obstante"],
            "ru": ["но", "однако", "тем не менее", "всё же", "всё-таки", "хотя", "несмотря на", "даже если", "вопреки", "независимо от", "невзирая на"]
        }
        
        # Context keywords
        self.context_keywords = {
            "en": {
                "time": ["today", "tomorrow", "yesterday", "now", "later", "soon", "immediately", "eventually", "morning", "afternoon", "evening", "night", "week", "month", "year"],
                "location": ["here", "there", "everywhere", "nowhere", "anywhere", "somewhere", "home", "office", "building", "city", "country", "world", "place", "location", "area"],
                "manner": ["quickly", "slowly", "carefully", "carelessly", "easily", "hardly", "well", "badly", "fast", "slow", "hard", "soft", "loud", "quiet", "silent"],
                "frequency": ["always", "never", "sometimes", "often", "rarely", "usually", "occasionally", "frequently", "seldom", "constantly", "regularly", "intermittently", "periodically", "sporadically", "continuously"],
                "degree": ["very", "extremely", "quite", "rather", "somewhat", "fairly", "almost", "nearly", "completely", "entirely", "totally", "wholly", "partially", "partly", "slightly"]
            },
            "tr": {
                "time": ["bugün", "yarın", "dün", "şimdi", "sonra", "yakında", "hemen", "eninde sonunda", "sabah", "öğleden sonra", "akşam", "gece", "hafta", "ay", "yıl"],
                "location": ["burada", "orada", "her yerde", "hiçbir yerde", "herhangi bir yerde", "bir yerde", "ev", "ofis", "bina", "şehir", "ülke", "dünya", "yer", "konum", "alan"],
                "manner": ["hızlıca", "yavaşça", "dikkatle", "dikkatsizce", "kolayca", "zar zor", "iyi", "kötü", "hızlı", "yavaş", "sert", "yumuşak", "yüksek sesle", "sessizce", "sessiz"],
                "frequency": ["her zaman", "asla", "bazen", "sık sık", "nadiren", "genellikle", "ara sıra", "sıklıkla", "seyrek olarak", "sürekli olarak", "düzenli olarak", "aralıklı olarak", "periyodik olarak", "sporadik olarak", "sürekli"],
                "degree": ["çok", "son derece", "oldukça", "biraz", "bir miktar", "nispeten", "neredeyse", "yaklaşık", "tamamen", "bütünüyle", "tümüyle", "tamamıyla", "kısmen", "kısmen", "hafifçe"]
            },
            "de": {
                "time": ["heute", "morgen", "gestern", "jetzt", "später", "bald", "sofort", "schließlich", "morgens", "nachmittags", "abends", "nachts", "woche", "monat", "jahr"],
                "location": ["hier", "dort", "überall", "nirgendwo", "irgendwo", "irgendwo", "zuhause", "büro", "gebäude", "stadt", "land", "welt", "ort", "standort", "bereich"],
                "manner": ["schnell", "langsam", "sorgfältig", "nachlässig", "leicht", "kaum", "gut", "schlecht", "schnell", "langsam", "hart", "weich", "laut", "leise", "still"],
                "frequency": ["immer", "nie", "manchmal", "oft", "selten", "gewöhnlich", "gelegentlich", "häufig", "selten", "ständig", "regelmäßig", "intermittierend", "periodisch", "sporadisch", "kontinuierlich"],
                "degree": ["sehr", "extrem", "ziemlich", "eher", "etwas", "ziemlich", "fast", "nahezu", "vollständig", "gänzlich", "total", "ganz", "teilweise", "teilweise", "leicht"]
            },
            "fr": {
                "time": ["aujourd'hui", "demain", "hier", "maintenant", "plus tard", "bientôt", "immédiatement", "finalement", "matin", "après-midi", "soir", "nuit", "semaine", "mois", "année"],
                "location": ["ici", "là", "partout", "nulle part", "n'importe où", "quelque part", "maison", "bureau", "bâtiment", "ville", "pays", "monde", "lieu", "emplacement", "zone"],
                "manner": ["rapidement", "lentement", "soigneusement", "négligemment", "facilement", "difficilement", "bien", "mal", "vite", "lent", "dur", "doux", "fort", "calme", "silencieux"],
                "frequency": ["toujours", "jamais", "parfois", "souvent", "rarement", "habituellement", "occasionnellement", "fréquemment", "rarement", "constamment", "régulièrement", "par intermittence", "périodiquement", "sporadiquement", "continuellement"],
                "degree": ["très", "extrêmement", "assez", "plutôt", "quelque peu", "assez", "presque", "presque", "complètement", "entièrement", "totalement", "entièrement", "partiellement", "en partie", "légèrement"]
            },
            "es": {
                "time": ["hoy", "mañana", "ayer", "ahora", "después", "pronto", "inmediatamente", "eventualmente", "mañana", "tarde", "noche", "noche", "semana", "mes", "año"],
                "location": ["aquí", "allí", "en todas partes", "en ninguna parte", "en cualquier lugar", "en algún lugar", "casa", "oficina", "edificio", "ciudad", "país", "mundo", "lugar", "ubicación", "área"],
                "manner": ["rápidamente", "lentamente", "cuidadosamente", "descuidadamente", "fácilmente", "difícilmente", "bien", "mal", "rápido", "lento", "duro", "suave", "fuerte", "tranquilo", "silencioso"],
                "frequency": ["siempre", "nunca", "a veces", "a menudo", "raramente", "usualmente", "ocasionalmente", "frecuentemente", "rara vez", "constantemente", "regularmente", "intermitentemente", "periódicamente", "esporádicamente", "continuamente"],
                "degree": ["muy", "extremadamente", "bastante", "más bien", "algo", "bastante", "casi", "casi", "completamente", "enteramente", "totalmente", "totalmente", "parcialmente", "en parte", "ligeramente"]
            },
            "ru": {
                "time": ["сегодня", "завтра", "вчера", "сейчас", "позже", "скоро", "немедленно", "в конечном итоге", "утро", "день", "вечер", "ночь", "неделя", "месяц", "год"],
                "location": ["здесь", "там", "везде", "нигде", "где угодно", "где-то", "дом", "офис", "здание", "город", "страна", "мир", "место", "местоположение", "область"],
                "manner": ["быстро", "медленно", "осторожно", "небрежно", "легко", "едва", "хорошо", "плохо", "быстро", "медленно", "жестко", "мягко", "громко", "тихо", "бесшумно"],
                "frequency": ["всегда", "никогда", "иногда", "часто", "редко", "обычно", "изредка", "часто", "редко", "постоянно", "регулярно", "прерывисто", "периодически", "спорадически", "непрерывно"],
                "degree": ["очень", "чрезвычайно", "довольно", "скорее", "несколько", "довольно", "почти", "почти", "полностью", "полностью", "полностью", "полностью", "частично", "частично", "слегка"]
            }
        }
        
        # Relationship indicators
        self.relationship_indicators = {
            "en": {
                "sequential": ["first", "second", "third", "next", "then", "finally", "lastly", "subsequently", "afterwards", "later"],
                "causal": ["because", "since", "as", "therefore", "thus", "consequently", "hence", "so", "as a result", "due to"],
                "conditional": ["if", "unless", "provided that", "assuming that", "in case", "on condition that", "as long as", "so long as", "given that", "supposing"],
                "comparative": ["like", "as", "than", "compared to", "in comparison with", "similarly", "likewise", "in the same way", "just as", "equally"],
                "contrastive": ["but", "however", "nevertheless", "nonetheless", "yet", "still", "although", "though", "even though", "despite"]
            },
            "tr": {
                "sequential": ["ilk", "ikinci", "üçüncü", "sonraki", "sonra", "son olarak", "son olarak", "akabinde", "sonrasında", "daha sonra"],
                "causal": ["çünkü", "zira", "dolayısıyla", "bu nedenle", "böylece", "sonuç olarak", "bundan dolayı", "bu yüzden", "sonuç olarak", "nedeniyle"],
                "conditional": ["eğer", "olmadıkça", "şartıyla", "varsayarak", "durumunda", "koşuluyla", "sürece", "sürece", "göz önüne alındığında", "varsayarsak"],
                "comparative": ["gibi", "kadar", "göre", "kıyasla", "karşılaştırıldığında", "benzer şekilde", "aynı şekilde", "aynı şekilde", "tıpkı", "eşit olarak"],
                "contrastive": ["ama", "ancak", "yine de", "buna rağmen", "fakat", "hala", "olsa da", "gerçi", "olsa bile", "rağmen"]
            },
            "de": {
                "sequential": ["erstens", "zweitens", "drittens", "nächstens", "dann", "schließlich", "zuletzt", "anschließend", "nachher", "später"],
                "causal": ["weil", "da", "denn", "deshalb", "daher", "folglich", "somit", "also", "infolgedessen", "aufgrund"],
                "conditional": ["wenn", "es sei denn", "vorausgesetzt dass", "angenommen dass", "falls", "unter der Bedingung dass", "solange", "solange", "angesichts", "angenommen"],
                "comparative": ["wie", "als", "als", "im Vergleich zu", "im Vergleich mit", "ähnlich", "ebenso", "auf die gleiche Weise", "genauso wie", "gleichermaßen"],
                "contrastive": ["aber", "jedoch", "dennoch", "trotzdem", "doch", "immer noch", "obwohl", "obgleich", "selbst wenn", "trotz"]
            },
            "fr": {
                "sequential": ["premièrement", "deuxièmement", "troisièmement", "ensuite", "puis", "finalement", "enfin", "subséquemment", "après", "plus tard"],
                "causal": ["parce que", "puisque", "comme", "donc", "ainsi", "par conséquent", "par conséquent", "alors", "en conséquence", "en raison de"],
                "conditional": ["si", "à moins que", "à condition que", "en supposant que", "au cas où", "à condition que", "tant que", "aussi longtemps que", "étant donné que", "supposant"],
                "comparative": ["comme", "comme", "que", "comparé à", "en comparaison avec", "de même", "pareillement", "de la même manière", "tout comme", "également"],
                "contrastive": ["mais", "cependant", "néanmoins", "néanmoins", "pourtant", "encore", "bien que", "quoique", "même si", "malgré"]
            },
            "es": {
                "sequential": ["primero", "segundo", "tercero", "siguiente", "luego", "finalmente", "por último", "posteriormente", "después", "más tarde"],
                "causal": ["porque", "ya que", "como", "por lo tanto", "así", "consecuentemente", "por ende", "así que", "como resultado", "debido a"],
                "conditional": ["si", "a menos que", "siempre que", "suponiendo que", "en caso de", "a condición de que", "mientras", "siempre y cuando", "dado que", "suponiendo"],
                "comparative": ["como", "como", "que", "comparado con", "en comparación con", "similarmente", "igualmente", "de la misma manera", "así como", "igualmente"],
                "contrastive": ["pero", "sin embargo", "no obstante", "no obstante", "aún", "todavía", "aunque", "aunque", "a pesar de que", "a pesar de"]
            },
            "ru": {
                "sequential": ["во-первых", "во-вторых", "в-третьих", "следующий", "затем", "наконец", "наконец", "впоследствии", "после", "позже"],
                "causal": ["потому что", "поскольку", "так как", "поэтому", "таким образом", "следовательно", "следовательно", "так что", "в результате", "из-за"],
                "conditional": ["если", "если не", "при условии что", "предполагая что", "в случае", "при условии что", "пока", "до тех пор пока", "учитывая что", "предположим"],
                "comparative": ["как", "как", "чем", "по сравнению с", "по сравнению с", "аналогично", "также", "таким же образом", "так же как", "в равной степени"],
                "contrastive": ["но", "однако", "тем не менее", "тем не менее", "все же", "все еще", "хотя", "хотя", "даже если", "несмотря на"]
            }
        }
    
    def _load_external_resources(self):
        """Load external language resources from YAML/JSON files"""
        # Check if resources directory exists
        if not os.path.exists(self.resources_dir):
            logger.warning(f"Resources directory {self.resources_dir} does not exist")
            return
        
        # Load language resources from YAML/JSON files
        for filename in os.listdir(self.resources_dir):
            file_path = os.path.join(self.resources_dir, filename)
            
            # Skip directories
            if os.path.isdir(file_path):
                continue
            
            # Load YAML files
            if filename.endswith('.yaml') or filename.endswith('.yml'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        resource = yaml.safe_load(f)
                    self._process_resource(resource, filename)
                except Exception as e:
                    logger.error(f"Error loading YAML resource {filename}: {str(e)}")
            
            # Load JSON files
            elif filename.endswith('.json'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        resource = json.load(f)
                    self._process_resource(resource, filename)
                except Exception as e:
                    logger.error(f"Error loading JSON resource {filename}: {str(e)}")
    
    def _process_resource(self, resource: Dict, filename: str):
        """
        Process a loaded resource
        
        Args:
            resource: Loaded resource
            filename: Resource filename
        """
        # Extract resource type from filename
        resource_type = filename.split('.')[0].lower()
        
        # Process resource based on type
        if resource_type == 'stopwords':
            for lang, words in resource.items():
                if lang in self.supported_languages:
                    self.stopwords[lang] = set(words)
                    logger.info(f"Loaded {len(words)} stopwords for language {lang}")
        
        elif resource_type == 'task_keywords':
            for lang, categories in resource.items():
                if lang in self.supported_languages:
                    for category, words in categories.items():
                        if category in self.task_keywords.get(lang, {}):
                            self.task_keywords[lang][category] = words
                            logger.info(f"Loaded {len(words)} task keywords for language {lang}, category {category}")
        
        elif resource_type == 'dependency_indicators':
            for lang, indicators in resource.items():
                if lang in self.supported_languages:
                    self.dependency_indicators[lang] = indicators
                    logger.info(f"Loaded {len(indicators)} dependency indicators for language {lang}")
        
        elif resource_type == 'conjunction_indicators':
            for lang, indicators in resource.items():
                if lang in self.supported_languages:
                    self.conjunction_indicators[lang] = indicators
                    logger.info(f"Loaded {len(indicators)} conjunction indicators for language {lang}")
        
        elif resource_type == 'alternative_indicators':
            for lang, indicators in resource.items():
                if lang in self.supported_languages:
                    self.alternative_indicators[lang] = indicators
                    logger.info(f"Loaded {len(indicators)} alternative indicators for language {lang}")
        
        elif resource_type == 'contrast_indicators':
            for lang, indicators in resource.items():
                if lang in self.supported_languages:
                    self.contrast_indicators[lang] = indicators
                    logger.info(f"Loaded {len(indicators)} contrast indicators for language {lang}")
        
        elif resource_type == 'context_keywords':
            for lang, categories in resource.items():
                if lang in self.supported_languages:
                    for category, words in categories.items():
                        if category in self.context_keywords.get(lang, {}):
                            self.context_keywords[lang][category] = words
                            logger.info(f"Loaded {len(words)} context keywords for language {lang}, category {category}")
        
        elif resource_type == 'relationship_indicators':
            for lang, categories in resource.items():
                if lang in self.supported_languages:
                    for category, words in categories.items():
                        if category in self.relationship_indicators.get(lang, {}):
                            self.relationship_indicators[lang][category] = words
                            logger.info(f"Loaded {len(words)} relationship indicators for language {lang}, category {category}")
        
        else:
            logger.warning(f"Unknown resource type: {resource_type}")
    
    def export_resources(self, output_dir: str = None, format: str = 'yaml'):
        """
        Export language resources to YAML/JSON files
        
        Args:
            output_dir: Output directory (defaults to resources_dir)
            format: Output format ('yaml' or 'json')
        """
        # Set output directory
        output_dir = output_dir or self.resources_dir
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Export resources
        resources = {
            'stopwords': self.stopwords,
            'task_keywords': self.task_keywords,
            'dependency_indicators': self.dependency_indicators,
            'conjunction_indicators': self.conjunction_indicators,
            'alternative_indicators': self.alternative_indicators,
            'contrast_indicators': self.contrast_indicators,
            'context_keywords': self.context_keywords,
            'relationship_indicators': self.relationship_indicators
        }
        
        for resource_name, resource_data in resources.items():
            # Set output file path
            if format == 'yaml':
                output_file = os.path.join(output_dir, f"{resource_name}.yaml")
            else:
                output_file = os.path.join(output_dir, f"{resource_name}.json")
            
            try:
                # Write resource to file
                if format == 'yaml':
                    with open(output_file, 'w', encoding='utf-8') as f:
                        yaml.dump(resource_data, f, allow_unicode=True, sort_keys=False)
                else:
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(resource_data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Exported {resource_name} to {output_file}")
            except Exception as e:
                logger.error(f"Error exporting {resource_name}: {str(e)}")
    
    def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Input text
            
        Returns:
            Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
        """
        if not text:
            return 'en'  # Default to English for empty text
        
        # Count pattern matches for each language
        scores = defaultdict(int)
        
        for lang, patterns in self.language_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                scores[lang] += len(matches)
        
        # Normalize scores by number of patterns
        for lang in scores:
            scores[lang] = scores[lang] / len(self.language_patterns[lang])
        
        # Return language with highest score
        if not scores:
            return 'en'  # Default to English if no matches
        
        return max(scores, key=scores.get)
    
    def tokenize_by_language(self, text: str, language: str) -> List[str]:
        """
        Tokenize text based on language
        
        Args:
            text: Input text
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            List of tokens
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        # Simple tokenization by splitting on whitespace and punctuation
        tokens = []
        
        # Remove punctuation and split by whitespace
        text_clean = ''.join([c if c not in string.punctuation else ' ' for c in text])
        for token in text_clean.split():
            if token:
                tokens.append(token.lower())
        
        return tokens
    
    def remove_stopwords(self, tokens: List[str], language: str) -> List[str]:
        """
        Remove stopwords from tokens
        
        Args:
            tokens: List of tokens
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            List of tokens without stopwords
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        # Get stopwords for language
        stopwords = self.get_stopwords(language)
        
        # Remove stopwords
        return [token for token in tokens if token.lower() not in stopwords]
    
    def get_stopwords(self, language: str) -> set:
        """
        Get stopwords for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            Set of stopwords
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.stopwords.get(language, set())
    
    def get_task_keywords(self, language: str) -> Dict[str, List[str]]:
        """
        Get task keywords for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            Dictionary of task keywords
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.task_keywords.get(language, self.task_keywords['en'])
    
    def get_dependency_indicators(self, language: str) -> List[str]:
        """
        Get dependency indicators for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            List of dependency indicators
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.dependency_indicators.get(language, self.dependency_indicators['en'])
    
    def get_conjunction_indicators(self, language: str) -> List[str]:
        """
        Get conjunction indicators for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            List of conjunction indicators
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.conjunction_indicators.get(language, self.conjunction_indicators['en'])
    
    def get_alternative_indicators(self, language: str) -> List[str]:
        """
        Get alternative indicators for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            List of alternative indicators
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.alternative_indicators.get(language, self.alternative_indicators['en'])
    
    def get_contrast_indicators(self, language: str) -> List[str]:
        """
        Get contrast indicators for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            List of contrast indicators
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.contrast_indicators.get(language, self.contrast_indicators['en'])
    
    def get_context_keywords(self, language: str) -> Dict[str, List[str]]:
        """
        Get context keywords for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            Dictionary of context keywords
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.context_keywords.get(language, self.context_keywords['en'])
    
    def get_relationship_indicators(self, language: str) -> Dict[str, List[str]]:
        """
        Get relationship indicators for the specified language
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            Dictionary of relationship indicators
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.relationship_indicators.get(language, self.relationship_indicators['en'])
    
    def get_language_name(self, language: str) -> str:
        """
        Get language name for the specified language code
        
        Args:
            language: Language code ('en', 'tr', 'de', 'fr', 'es', 'ru')
            
        Returns:
            Language name
        """
        # Default to English if language not supported
        if language not in self.supported_languages:
            language = 'en'
        
        return self.language_names.get(language, "Unknown")
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """
        Get list of supported languages
        
        Returns:
            List of dictionaries with language code and name
        """
        return [
            {"code": code, "name": self.language_names.get(code, "Unknown")}
            for code in self.supported_languages
        ]
    
    def analyze_text(self, text: str, language: str = None) -> Dict[str, Any]:
        """
        Analyze text and extract linguistic features
        
        Args:
            text: Input text
            language: Language code (if None, language will be detected)
            
        Returns:
            Dictionary with analysis results
        """
        # Detect language if not provided
        if language is None:
            language = self.detect_language(text)
        
        # Tokenize text
        tokens = self.tokenize_by_language(text, language)
        
        # Remove stopwords
        tokens_without_stopwords = self.remove_stopwords(tokens, language)
        
        # Count tokens
        token_counts = Counter(tokens)
        
        # Extract task keywords
        task_keywords = self.get_task_keywords(language)
        found_task_keywords = {}
        
        for category, keywords in task_keywords.items():
            found_task_keywords[category] = []
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    found_task_keywords[category].append(keyword)
        
        # Extract dependency indicators
        dependency_indicators = self.get_dependency_indicators(language)
        found_dependency_indicators = []
        
        for indicator in dependency_indicators:
            if indicator.lower() in text.lower():
                found_dependency_indicators.append(indicator)
        
        # Extract relationship indicators
        relationship_indicators = self.get_relationship_indicators(language)
        found_relationship_indicators = {}
        
        for category, indicators in relationship_indicators.items():
            found_relationship_indicators[category] = []
            for indicator in indicators:
                if indicator.lower() in text.lower():
                    found_relationship_indicators[category].append(indicator)
        
        # Return analysis results
        return {
            "language": {
                "code": language,
                "name": self.get_language_name(language)
            },
            "tokens": {
                "count": len(tokens),
                "unique": len(set(tokens)),
                "without_stopwords": len(tokens_without_stopwords),
                "most_common": token_counts.most_common(10)
            },
            "task_keywords": found_task_keywords,
            "dependency_indicators": found_dependency_indicators,
            "relationship_indicators": found_relationship_indicators
        }

# Create a global instance
language_processor = LanguageProcessor()

# Function to get the language processor instance
def get_language_processor() -> LanguageProcessor:
    """
    Get the language processor instance
    
    Returns:
        Language processor instance
    """
    return language_processor

# Main function for testing
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Test the language processor
    processor = LanguageProcessor()
    
    # Export resources
    processor.export_resources(format='yaml')
    
    # Test language detection
    test_texts = [
        "Search for information about AI and create a report",
        "Ara yapay zeka hakkında bilgi ve bir rapor oluştur",
        "Suche nach Informationen über KI und erstelle einen Bericht",
        "Rechercher des informations sur l'IA et créer un rapport",
        "Buscar información sobre IA y crear un informe",
        "Найти информацию об ИИ и создать отчет",
        "This is a mixed text with some Turkish words like merhaba and teşekkürler",
        "Dies ist ein gemischter Text mit einigen türkischen Wörtern wie merhaba und teşekkürler",
        "C'est un texte mixte avec quelques mots turcs comme merhaba et teşekkürler",
        "Este es un texto mixto con algunas palabras turcas como merhaba y teşekkürler",
        "Это смешанный текст с некоторыми турецкими словами, такими как merhaba и teşekkürler"
    ]
    
    for text in test_texts:
        lang = processor.detect_language(text)
        print(f"Text: {text}")
        print(f"Detected language: {lang} ({processor.get_language_name(lang)})")
        print(f"Tokens: {processor.tokenize_by_language(text, lang)}")
        print()
    
    # Test text analysis
    analysis = processor.analyze_text("First search for information about AI, then create a comprehensive report with visualizations.")
    print("Text Analysis:")
    print(json.dumps(analysis, indent=2, ensure_ascii=False))
