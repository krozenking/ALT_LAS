# NLP Entegrasyonu ve Çoklu Dil Desteği

Bu doküman, ALT_LAS Segmentation Service'in NLP (Doğal Dil İşleme) entegrasyonu ve çoklu dil desteği özelliklerini açıklar.

## Genel Bakış

Segmentation Service, doğal dil komutlarını işlemek için gelişmiş NLP yetenekleri kullanır. Bu yetenekler, komutların daha doğru bir şekilde anlaşılmasını, segmentlere ayrılmasını ve işlenmesini sağlar. Servis, birden fazla dili destekler ve dil özelliklerine göre özelleştirilmiş işleme mekanizmaları sunar.

## NLP Bileşenleri

### 1. Dil Algılama

Sistem, gelen komutun dilini otomatik olarak algılar. Şu diller desteklenir:

- İngilizce (en)
- Türkçe (tr)
- Almanca (de)
- Fransızca (fr)
- İspanyolca (es)
- Rusça (ru)

Dil algılama, dile özgü kelime ve karakter kalıplarını kullanarak gerçekleştirilir. Algılama başarısız olursa, varsayılan olarak İngilizce kullanılır.

### 2. Tokenizasyon ve Cümle Segmentasyonu

Komutlar, dile özgü tokenizasyon kuralları kullanılarak tokenlere ve cümlelere ayrılır. Bu işlem için:

- **spaCy**: Desteklenen diller için spaCy modelleri kullanılır
- **NLTK**: spaCy modeli bulunmayan diller için NLTK tokenizasyon kullanılır
- **Özel Tokenizer**: Türkçe gibi bazı diller için özel tokenizer uygulamaları bulunur

### 3. Varlık Tanıma (Named Entity Recognition - NER)

Komutlardaki önemli varlıklar (kişiler, yerler, tarihler, dosya adları vb.) otomatik olarak tanımlanır:

- **spaCy NER**: Desteklenen diller için spaCy NER modelleri kullanılır
- **Regex Kalıpları**: Özel varlık türleri için regex kalıpları kullanılır
- **Dile Özgü Varlık Tanıma**: Her dil için özelleştirilmiş varlık tanıma kuralları uygulanır

### 4. Bağımlılık Ayrıştırma (Dependency Parsing)

Komutlardaki kelimeler arasındaki ilişkiler analiz edilir:

- **Kök Fiil Tanımlama**: Komutun ana eylemini belirler
- **Nesne Tanımlama**: Eylemin etkilediği nesneleri belirler
- **Niteleyici Tanımlama**: Eylemin nasıl gerçekleştirileceğini belirleyen niteleyicileri tanımlar

### 5. Görev Türü Tanımlama

Komutun türü (arama, oluşturma, analiz, dönüştürme vb.), dile özgü görev fiilleri ve kalıpları kullanılarak belirlenir. Her dil için özelleştirilmiş görev türü sözlükleri bulunur.

### 6. Bağımlılık Tanımlama

Görevler arasındaki bağımlılıklar, dile özgü bağımlılık göstergeleri kullanılarak belirlenir:

- **Sıralı Bağımlılıklar**: "sonra", "ardından", "daha sonra" gibi ifadeler
- **Koşullu Bağımlılıklar**: "eğer", "durumunda", "-sa/-se" gibi ifadeler
- **Nedensel Bağımlılıklar**: "çünkü", "nedeniyle", "dolayısıyla" gibi ifadeler

### 7. Değişken Çıkarma

Komutlardaki değişkenler (`{değişken_adı}` veya `<değişken_adı>` formatında) otomatik olarak tanımlanır ve görev parametrelerine dönüştürülür.

### 8. Referans Çözümleme

Komutlardaki zamir ve referanslar ("o", "bu", "onlar", "sonuç" vb.) tanımlanır ve ilgili öğelere bağlanır.

### 9. İlgili Kavram Tanımlama

WordNet entegrasyonu ile komutlardaki kavramlarla ilişkili diğer kavramlar (eş anlamlılar, üst kavramlar, alt kavramlar) belirlenir.

## Dile Özgü Özellikler

### Türkçe Dil Desteği

Türkçe dil desteği için özel mekanizmalar uygulanmıştır:

- **Türkçe Karakter İşleme**: Türkçe karakterler (ç, ğ, ı, ö, ş, ü, İ) doğru şekilde işlenir
- **Türkçe Kök Bulma**: Türkçe'ye özgü ek yapısı dikkate alınarak kelime kökleri bulunur
- **Türkçe Görev Fiilleri**: Türkçe'ye özgü görev fiilleri ("ara", "bul", "oluştur", "analiz et" vb.) tanımlanmıştır
- **Türkçe Bağımlılık Göstergeleri**: Türkçe'ye özgü bağımlılık göstergeleri ("önce", "sonra", "eğer", "çünkü" vb.) tanımlanmıştır
- **Türkçe Varlık Tanıma**: Türkçe isimler, yerler, tarihler vb. için özel tanıma kalıpları uygulanmıştır

### Diğer Diller

Diğer desteklenen diller için de benzer özelleştirmeler yapılmıştır:

- **Dile Özgü Durak Kelimeleri (Stopwords)**: Her dil için özelleştirilmiş durak kelime listeleri
- **Dile Özgü Görev Fiilleri**: Her dil için özelleştirilmiş görev fiili sözlükleri
- **Dile Özgü Bağımlılık Göstergeleri**: Her dil için özelleştirilmiş bağımlılık göstergeleri
- **Dile Özgü Bağlam Kelimeleri**: Her dil için özelleştirilmiş bağlam kelime listeleri

## Performans Optimizasyonu

NLP işlemleri genellikle hesaplama açısından yoğun olduğundan, çeşitli optimizasyon teknikleri uygulanmıştır:

- **Önbellek (Caching)**: İşlenmiş belgeler ve sonuçlar önbelleklenir
- **Tembel Yükleme (Lazy Loading)**: Dil modelleri ihtiyaç duyulduğunda yüklenir
- **Geri Dönüş Mekanizmaları**: Dil modeli bulunamazsa alternatif işleme yöntemleri kullanılır
- **Paralel İşleme**: Uygun olduğunda işlemler paralel olarak yürütülür

## API Kullanımı

NLP özelliklerini API üzerinden kullanmak için:

```json
POST /segment
{
  "command": "Önce veriyi analiz et, sonra bir rapor oluştur",
  "mode": "Normal",
  "persona": "researcher",
  "metadata": {
    "language": "tr" // Opsiyonel, belirtilmezse otomatik algılanır
  }
}
```

## Geliştirici Araçları

NLP bileşenlerini doğrudan kullanmak için:

```python
from enhanced_language_processor import EnhancedLanguageProcessor

# Singleton örneği al
processor = EnhancedLanguageProcessor()

# Dil algılama
language = processor.detect_language("Bu bir Türkçe cümledir.")
# Çıktı: "tr"

# Cümle segmentasyonu
sentences = processor.get_sentences("Veriyi analiz et. Bir rapor oluştur.", language="tr")
# Çıktı: ["Veriyi analiz et.", "Bir rapor oluştur."]

# Varlık tanıma
entities = processor.get_named_entities("15 Mayıs 2023 tarihinde İstanbul'da bir toplantı planla.", language="tr")
# Çıktı: [("15 Mayıs 2023", "DATE", 0, 14), ("İstanbul", "LOCATION", 24, 32)]

# Görev türü tanımlama
from turkish_language_support import identify_task_type
task_type = identify_task_type("Yapay zeka hakkında bilgi ara")
# Çıktı: "search"
```

## Gelecek Geliştirmeler

- Daha fazla dil desteği eklenmesi
- Dil modellerinin iyileştirilmesi
- Daha gelişmiş bağlam analizi
- Duygu analizi entegrasyonu
- Daha gelişmiş referans çözümleme
