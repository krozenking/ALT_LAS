# NLP Entegrasyon Yaklaşımı Tasarımı

Bu belge, ALT_LAS Segmentation Service içindeki NLP (Doğal Dil İşleme) yeteneklerini geliştirmek için izlenecek yaklaşımı özetlemektedir.

## Mevcut Durum Analizi

- `language_processor.py`: Temel regex tabanlı dil algılama, basit tokenizasyon ve dil tabanlı anahtar kelime listeleri sağlar.
- `enhanced_language_processor.py`: spaCy kullanarak daha gelişmiş özellikler (NER, bağımlılık ayrıştırma, daha iyi tokenizasyon) sunar ancak tam olarak entegre edilmemiş veya tamamlanmamış olabilir.
- `command_parser.py`: Şu anda `language_processor.py`'deki temel yetenekleri kullanıyor gibi görünmektedir.
- `worker2_todo.md`: Çoklu dil desteğinin (özellikle Türkçe) iyileştirilmesi ve bağlam analizi/referans çözümleme gibi NLP ile ilgili görevleri listeler.

## Hedefler

1.  NLP yeteneklerini merkezileştirmek ve geliştirmek.
2.  Daha doğru komut ayrıştırma ve segmentasyon sağlamak.
3.  Parametre çıkarma işlemini iyileştirmek.
4.  Görevler arasındaki bağımlılıkları daha iyi anlamak.
5.  Çoklu dil desteğini (özellikle Türkçe) güçlendirmek.
6.  Bakımı kolay ve genişletilebilir bir yapı oluşturmak.

## Tasarım Yaklaşımı

1.  **`EnhancedLanguageProcessor`'ı Benimseme**: `enhanced_language_processor.py` modülünü ana NLP bileşeni olarak kullanacağız. `language_processor.py`'deki gerekli anahtar kelime listeleri ve temel işlevler `EnhancedLanguageProcessor` içine entegre edilecek veya bu modül tarafından kullanılacaktır.
2.  **spaCy Entegrasyonu**: spaCy'nin yeteneklerinden tam olarak yararlanılacaktır:
    *   **Dil Modelleri**: Başta İngilizce (`en_core_web_sm`) ve Türkçe olmak üzere desteklenen diller için spaCy modellerinin yüklenmesi ve yönetilmesi sağlanacaktır. Türkçe için uygun bir model (örn. `tr_core_news_sm` veya daha büyüğü) araştırılıp kullanılacaktır. Model yükleme sırasında hata yönetimi eklenecektir.
    *   **Tokenizasyon ve Cümle Segmentasyonu**: spaCy'nin yerleşik tokenizasyon ve cümle segmentasyon özellikleri kullanılacaktır.
    *   **NER (Named Entity Recognition)**: Komutlardaki varlıkları (tarihler, yerler, organizasyonlar, dosya adları vb.) tanımak için NER kullanılacaktır. Bu varlıklar, `TaskSegment` parametrelerinin çıkarılmasında veya doğrulanmasında kullanılabilir.
    *   **Dependency Parsing**: Kelimeler arasındaki ilişkileri (özne-fiil, nesne, niteleyiciler vb.) anlamak için bağımlılık ayrıştırma kullanılacaktır. Bu, görev türünü belirlemede, parametreleri fiillerle ilişkilendirmede ve segmentler arası bağımlılıkları (örn. bir görevin sonucunun diğerinin girdisi olması) tespit etmede yardımcı olabilir.
3.  **`CommandParser` Entegrasyonu**: `CommandParser`, `EnhancedLanguageProcessor`'ı kullanacak şekilde güncellenecektir:
    *   `segment_command` metodu, ham komut metni yerine işlenmiş spaCy `Doc` nesnesini alabilir veya `EnhancedLanguageProcessor`'ı çağırarak metni işleyebilir.
    *   Parametre çıkarma (`_extract_parameters`), NER sonuçlarını ve bağımlılık ağacını kullanarak daha akıllı hale getirilecektir.
    *   Görev türü belirleme (`_identify_task_type`), cümlenin kök fiilini ve yapısını analiz ederek iyileştirilebilir.
    *   Alt görevlere ayırma (`_split_into_subtasks`) ve bağımlılık belirleme (`_identify_dependencies`), spaCy'nin cümle segmentasyonu ve bağımlılık analizi yeteneklerinden faydalanacaktır.
4.  **Çoklu Dil Desteği**: Tüm NLP işlemleri (tokenizasyon, NER, parsing) dil parametresine göre ilgili spaCy modelini kullanacaktır. Anahtar kelime listeleri (görev türleri, bağlam vb.) desteklenen tüm diller için genişletilecek ve güncel tutulacaktır.
5.  **Bağlam Analizi ve Referans Çözümleme**: (İleri Seviye) Komut içindeki zamirlerin (örn. "it", "them", "o", "onları") veya belirsiz referansların ("the previous result", "önceki sonuç") çözümlenmesi için temel mekanizmalar eklenecektir. Bu, önceki segmentlere veya konuşma geçmişine bakmayı gerektirebilir.
6.  **Değişken Çıkarma**: Komutlardaki potansiyel değişkenleri (örn. "{dosya_adı}nı işle") tanıma ve `TaskParameter` olarak işaretleme yeteneği geliştirilecektir.
7.  **Fallback Mekanizması**: spaCy modeli olmayan diller veya spaCy işlemenin başarısız olduğu durumlar için `language_processor.py`'deki anahtar kelime tabanlı yaklaşımlar bir geri dönüş mekanizması olarak korunabilir.

## Uygulama Adımları

1.  Gerekli spaCy modellerini (özellikle Türkçe) yüklemek için kurulum adımlarını güncelle.
2.  `EnhancedLanguageProcessor`'ı tamamla ve `language_processor.py`'deki işlevleri entegre et/kaldır.
3.  `CommandParser`'ı `EnhancedLanguageProcessor`'ı kullanacak şekilde refactor et.
4.  Tokenizasyon, NER ve bağımlılık ayrıştırma kullanarak ilgili `CommandParser` metotlarını (parametre çıkarma, bağımlılık belirleme vb.) iyileştir.
5.  Çoklu dil desteğini test et ve doğrula.
6.  Yeni NLP özellikleri için birim ve entegrasyon testleri yaz/güncelle.
7.  Dokümantasyonu (README, kod içi yorumlar) güncelle.

